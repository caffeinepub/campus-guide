import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Loader2,
  LogIn,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Location, LocationInput } from "../backend.d";
import { Category } from "../backend.d";
import { CategoryBadge } from "../components/CategoryBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddLocation,
  useDeleteLocation,
  useGetAllLocations,
  useIsCallerAdmin,
  useUpdateLocation,
} from "../hooks/useQueries";

const EMPTY_FORM: LocationInput = {
  name: "",
  category: Category.classroom,
  building: "",
  floor: "",
  roomNumber: "",
  description: "",
};

function LocationForm({
  open,
  onClose,
  initial,
  editId,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Location;
  editId?: string;
}) {
  const [form, setForm] = useState<LocationInput>(
    initial
      ? {
          name: initial.name,
          category: initial.category,
          building: initial.building,
          floor: initial.floor,
          roomNumber: initial.roomNumber,
          description: initial.description,
        }
      : EMPTY_FORM,
  );

  const addMutation = useAddLocation();
  const updateMutation = useUpdateLocation();
  const isLoading = addMutation.isPending || updateMutation.isPending;

  const handleChange = (field: keyof LocationInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.building.trim() || !form.roomNumber.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, input: form });
        toast.success("Location updated successfully");
      } else {
        await addMutation.mutateAsync(form);
        toast.success("Location added successfully");
      }
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[400px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editId ? "Edit Location" : "Add New Location"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Computer Science Department"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => handleChange("category", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Category.department}>Department</SelectItem>
                <SelectItem value={Category.classroom}>Classroom</SelectItem>
                <SelectItem value={Category.lab}>Lab</SelectItem>
                <SelectItem value={Category.office}>Office</SelectItem>
                <SelectItem value={Category.other}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="building">
              Building <span className="text-destructive">*</span>
            </Label>
            <Input
              id="building"
              value={form.building}
              onChange={(e) => handleChange("building", e.target.value)}
              placeholder="e.g. Engineering Hall"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                value={form.floor}
                onChange={(e) => handleChange("floor", e.target.value)}
                placeholder="e.g. 3rd Floor"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roomNumber">
                Room # <span className="text-destructive">*</span>
              </Label>
              <Input
                id="roomNumber"
                value={form.roomNumber}
                onChange={(e) => handleChange("roomNumber", e.target.value)}
                placeholder="e.g. E-301"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of the location…"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editId ? "Save Changes" : "Add Location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminTab() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: locations = [], isLoading: locationsLoading } =
    useGetAllLocations();
  const deleteMutation = useDeleteLocation();

  const [formOpen, setFormOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleEdit = (loc: Location) => {
    setEditLocation(loc);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditLocation(undefined);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Location deleted");
    } catch {
      toast.error("Failed to delete location");
    } finally {
      setDeleteTarget(null);
    }
  };

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-5 pb-3">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Admin
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage campus locations
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
          <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center mb-6">
            <Building2 className="w-9 h-9 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold text-center">
            Sign in to manage locations
          </h2>
          <p className="text-sm text-muted-foreground text-center mt-2 mb-8 leading-relaxed max-w-[280px]">
            Administrators can add, edit, and remove campus locations visible to
            all students.
          </p>
          <Button
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            className="h-12 px-8 rounded-xl font-display font-semibold text-base"
          >
            {loginStatus === "logging-in" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Loading admin check
  if (adminLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-5 pb-3">
          <h1 className="font-display text-2xl font-bold">Admin</h1>
        </div>
        <div className="px-4 space-y-3">
          {(["sk1", "sk2", "sk3", "sk4"] as const).map((sk) => (
            <Skeleton key={sk} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Admin</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage campus locations
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
          <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center mb-6">
            <ShieldAlert className="w-9 h-9 text-destructive" />
          </div>
          <h2 className="font-display text-xl font-bold text-center">
            Access Restricted
          </h2>
          <p className="text-sm text-muted-foreground text-center mt-2 leading-relaxed max-w-[280px]">
            Your account doesn't have admin privileges. Contact the campus IT
            department to request access.
          </p>
        </div>
      </div>
    );
  }

  // Admin view
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Admin</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {locations.length} locations on campus
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Button
            size="sm"
            onClick={() => setFormOpen(true)}
            className="h-9 rounded-lg font-medium text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="h-9 rounded-lg text-sm"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Locations list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {locationsLoading ? (
          <div className="space-y-3">
            {(["sk1", "sk2", "sk3", "sk4", "sk5"] as const).map((sk) => (
              <Skeleton key={sk} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-display font-semibold">No locations yet</p>
            <p className="text-sm text-muted-foreground mt-1.5">
              Add your first campus location
            </p>
            <Button className="mt-5" onClick={() => setFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {locations.map((loc, i) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: i * 0.02 }}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm truncate">
                      {loc.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {loc.building} · {loc.roomNumber} · {loc.floor}
                    </p>
                    <div className="mt-1.5">
                      <CategoryBadge category={loc.category} size="sm" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                      onClick={() => handleEdit(loc)}
                      aria-label="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors"
                      onClick={() => setDeleteTarget(loc)}
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit form */}
      <LocationForm
        open={formOpen}
        onClose={handleFormClose}
        initial={editLocation}
        editId={editLocation?.id}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete location?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.name}</strong>{" "}
              from the campus guide. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
