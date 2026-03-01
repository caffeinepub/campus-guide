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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Building2,
  GraduationCap,
  Info,
  Loader2,
  LogIn,
  Pencil,
  Plus,
  School,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  CollegeEntry,
  CollegeInfo,
  Course,
  CourseInput,
  Location,
  LocationInput,
} from "../backend.d";
import { Category } from "../backend.d";
import { CategoryBadge } from "../components/CategoryBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddCourse,
  useAddLocation,
  useDeleteCollegeEntry,
  useDeleteCourse,
  useDeleteLocation,
  useGetAllCollegeEntries,
  useGetAllCourses,
  useGetAllLocations,
  useGetCollegeInfo,
  useIsCallerAdmin,
  useUpdateCollegeInfo,
  useUpdateCourse,
  useUpdateLocation,
} from "../hooks/useQueries";

// ── Location Form ─────────────────────────────────────────

const EMPTY_LOCATION_FORM: LocationInput = {
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
      : EMPTY_LOCATION_FORM,
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
            <Label htmlFor="loc-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="loc-name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Computer Science Department"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="loc-category">Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => handleChange("category", v)}
            >
              <SelectTrigger id="loc-category">
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
            <Label htmlFor="loc-building">
              Building <span className="text-destructive">*</span>
            </Label>
            <Input
              id="loc-building"
              value={form.building}
              onChange={(e) => handleChange("building", e.target.value)}
              placeholder="e.g. Engineering Hall"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="loc-floor">Floor</Label>
              <Input
                id="loc-floor"
                value={form.floor}
                onChange={(e) => handleChange("floor", e.target.value)}
                placeholder="e.g. 3rd Floor"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-room">
                Room # <span className="text-destructive">*</span>
              </Label>
              <Input
                id="loc-room"
                value={form.roomNumber}
                onChange={(e) => handleChange("roomNumber", e.target.value)}
                placeholder="e.g. E-301"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="loc-desc">Description</Label>
            <Textarea
              id="loc-desc"
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

// ── Course Form ───────────────────────────────────────────

const EMPTY_COURSE_FORM: CourseInput = {
  name: "",
  department: "",
  duration: "",
  fees: "",
  eligibility: "",
  description: "",
};

function CourseForm({
  open,
  onClose,
  initial,
  editId,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Course;
  editId?: string;
}) {
  const [form, setForm] = useState<CourseInput>(
    initial
      ? {
          name: initial.name,
          department: initial.department,
          duration: initial.duration,
          fees: initial.fees,
          eligibility: initial.eligibility,
          description: initial.description,
        }
      : EMPTY_COURSE_FORM,
  );

  const addMutation = useAddCourse();
  const updateMutation = useUpdateCourse();
  const isLoading = addMutation.isPending || updateMutation.isPending;

  const handleChange = (field: keyof CourseInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.department.trim()) {
      toast.error("Name and department are required");
      return;
    }

    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, input: form });
        toast.success("Course updated successfully");
      } else {
        await addMutation.mutateAsync(form);
        toast.success("Course added successfully");
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
            {editId ? "Edit Course" : "Add New Course"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="course-name">
              Course Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="course-name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Bachelor of Technology – CS"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="course-dept">
              Department <span className="text-destructive">*</span>
            </Label>
            <Input
              id="course-dept"
              value={form.department}
              onChange={(e) => handleChange("department", e.target.value)}
              placeholder="e.g. Computer Science"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="course-duration">Duration</Label>
              <Input
                id="course-duration"
                value={form.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                placeholder="e.g. 4 Years"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-fees">Fees</Label>
              <Input
                id="course-fees"
                value={form.fees}
                onChange={(e) => handleChange("fees", e.target.value)}
                placeholder="e.g. ₹85,000/yr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="course-eligibility">Eligibility</Label>
            <Textarea
              id="course-eligibility"
              value={form.eligibility}
              onChange={(e) => handleChange("eligibility", e.target.value)}
              placeholder="Minimum qualification required…"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="course-desc">Description</Label>
            <Textarea
              id="course-desc"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="About the program…"
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
              {editId ? "Save Changes" : "Add Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── College Info Form ─────────────────────────────────────

function CollegeInfoForm({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial: CollegeInfo | null;
}) {
  const EMPTY: CollegeInfo = {
    name: "",
    tagline: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    established: "",
  };

  const [form, setForm] = useState<CollegeInfo>(initial ?? EMPTY);
  const updateMutation = useUpdateCollegeInfo();
  const isLoading = updateMutation.isPending;

  const handleChange = (field: keyof CollegeInfo, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("College name is required");
      return;
    }
    try {
      await updateMutation.mutateAsync(form);
      toast.success("College info updated successfully");
      onClose();
    } catch {
      toast.error("Failed to update college info");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[400px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Edit College Info</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="college-name">
              College Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="college-name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Greenfield Institute of Technology"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="college-tagline">Tagline</Label>
            <Input
              id="college-tagline"
              value={form.tagline}
              onChange={(e) => handleChange("tagline", e.target.value)}
              placeholder="A short inspiring motto"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="college-desc">Description</Label>
            <Textarea
              id="college-desc"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="About the institution…"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="college-established">Established Year</Label>
            <Input
              id="college-established"
              value={form.established}
              onChange={(e) => handleChange("established", e.target.value)}
              placeholder="e.g. 1978"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="college-address">Address</Label>
            <Textarea
              id="college-address"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Full address…"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="college-phone">Phone</Label>
              <Input
                id="college-phone"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+91 …"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="college-email">Email</Label>
              <Input
                id="college-email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="info@college.edu"
                type="email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="college-website">Website</Label>
            <Input
              id="college-website"
              value={form.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://www.college.edu"
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
              Save Info
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Locations Panel ───────────────────────────────────────

function LocationsPanel() {
  const { data: locations = [], isLoading: locationsLoading } =
    useGetAllLocations();
  const deleteMutation = useDeleteLocation();

  const [formOpen, setFormOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);

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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {locations.length} location{locations.length !== 1 ? "s" : ""}
        </p>
        <Button
          size="sm"
          onClick={() => setFormOpen(true)}
          className="h-8 rounded-lg font-medium text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Location
        </Button>
      </div>

      {locationsLoading ? (
        <div className="space-y-2">
          {(["sk1", "sk2", "sk3"] as const).map((sk) => (
            <Skeleton key={sk} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-display font-semibold text-sm">No locations yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add your first campus location
          </p>
          <Button className="mt-4" size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Location
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12, delay: i * 0.02 }}
              className="bg-card rounded-xl border border-border p-3"
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
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                    onClick={() => handleEdit(loc)}
                    aria-label="Edit"
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors"
                    onClick={() => setDeleteTarget(loc)}
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3 h-3 text-destructive/70" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <LocationForm
        open={formOpen}
        onClose={handleFormClose}
        initial={editLocation}
        editId={editLocation?.id}
      />

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

// ── Courses Panel ─────────────────────────────────────────

function CoursesPanel() {
  const { data: courses = [], isLoading: coursesLoading } = useGetAllCourses();
  const deleteMutation = useDeleteCourse();

  const [formOpen, setFormOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const handleEdit = (course: Course) => {
    setEditCourse(course);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditCourse(undefined);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Course deleted");
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {courses.length} course{courses.length !== 1 ? "s" : ""}
        </p>
        <Button
          size="sm"
          onClick={() => setFormOpen(true)}
          className="h-8 rounded-lg font-medium text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Course
        </Button>
      </div>

      {coursesLoading ? (
        <div className="space-y-2">
          {(["sk1", "sk2", "sk3"] as const).map((sk) => (
            <Skeleton key={sk} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-display font-semibold text-sm">No courses yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add your first course
          </p>
          <Button className="mt-4" size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Course
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12, delay: i * 0.02 }}
              className="bg-card rounded-xl border border-border p-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm line-clamp-1">
                    {course.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {course.department} · {course.duration} · {course.fees}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                    onClick={() => handleEdit(course)}
                    aria-label="Edit course"
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors"
                    onClick={() => setDeleteTarget(course)}
                    aria-label="Delete course"
                  >
                    <Trash2 className="w-3 h-3 text-destructive/70" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CourseForm
        open={formOpen}
        onClose={handleFormClose}
        initial={editCourse}
        editId={editCourse?.id}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.name}</strong>{" "}
              from the course catalog. This action cannot be undone.
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

// ── College Info Panel ────────────────────────────────────

function CollegeInfoPanel() {
  const { data: collegeInfo, isLoading } = useGetCollegeInfo();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Institution details shown to students
        </p>
        <Button
          size="sm"
          onClick={() => setEditOpen(true)}
          className="h-8 rounded-lg font-medium text-xs"
          disabled={isLoading}
        >
          <Pencil className="w-3.5 h-3.5 mr-1" />
          Edit Info
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {(["sk1", "sk2", "sk3"] as const).map((sk) => (
            <Skeleton key={sk} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
          {collegeInfo ? (
            <>
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-display font-semibold text-sm">
                  {collegeInfo.name}
                </p>
              </div>
              {collegeInfo.tagline && (
                <div>
                  <p className="text-xs text-muted-foreground">Tagline</p>
                  <p className="text-sm italic text-muted-foreground">
                    {collegeInfo.tagline}
                  </p>
                </div>
              )}
              {collegeInfo.established && (
                <div>
                  <p className="text-xs text-muted-foreground">Established</p>
                  <p className="text-sm">{collegeInfo.established}</p>
                </div>
              )}
              {collegeInfo.address && (
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm leading-snug">{collegeInfo.address}</p>
                </div>
              )}
              {(collegeInfo.phone || collegeInfo.email) && (
                <div className="grid grid-cols-2 gap-3">
                  {collegeInfo.phone && (
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm">{collegeInfo.phone}</p>
                    </div>
                  )}
                  {collegeInfo.email && (
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm break-all">{collegeInfo.email}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <Info className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No college info saved yet
              </p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => setEditOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Info
              </Button>
            </div>
          )}
        </div>
      )}

      <CollegeInfoForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={collegeInfo ?? null}
      />
    </div>
  );
}

// ── College Entries Panel ─────────────────────────────────

function CollegeEntriesPanel() {
  const { data: entries = [], isLoading } = useGetAllCollegeEntries();
  const deleteMutation = useDeleteCollegeEntry();
  const [deleteTarget, setDeleteTarget] = useState<CollegeEntry | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("College entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {entries.length} college{entries.length !== 1 ? "s" : ""} registered
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {(["sk1", "sk2", "sk3"] as const).map((sk) => (
            <Skeleton key={sk} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <School className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-display font-semibold text-sm">No colleges yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Colleges registered via the Colleges tab will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id.toString()}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12, delay: i * 0.02 }}
              className="bg-card rounded-xl border border-border p-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm line-clamp-1">
                    {entry.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {entry.established && `Est. ${entry.established} · `}
                    {entry.departments.length} dept
                    {entry.departments.length !== 1 ? "s" : ""}
                    {entry.email && ` · ${entry.email}`}
                  </p>
                </div>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors flex-shrink-0"
                  onClick={() => setDeleteTarget(entry)}
                  aria-label="Delete college entry"
                >
                  <Trash2 className="w-3 h-3 text-destructive/70" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete college entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.name}</strong>{" "}
              from the directory. This action cannot be undone.
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

// ── Admin Tab ─────────────────────────────────────────────

export function AdminTab() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
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
            Manage campus data
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
          <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center mb-6">
            <Building2 className="w-9 h-9 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold text-center">
            Sign in to manage campus
          </h2>
          <p className="text-sm text-muted-foreground text-center mt-2 mb-8 leading-relaxed max-w-[280px]">
            Administrators can manage locations, courses, and college
            information.
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
              Access Restricted
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
            Manage campus content
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="h-9 rounded-lg text-sm mt-1"
        >
          Sign Out
        </Button>
      </div>

      {/* Admin tabs */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <Tabs defaultValue="locations" className="h-full flex flex-col">
          <TabsList className="grid grid-cols-4 mb-4 w-full">
            <TabsTrigger value="locations" className="text-xs gap-1 px-1">
              <Building2 className="w-3 h-3" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="courses" className="text-xs gap-1 px-1">
              <BookOpen className="w-3 h-3" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="college" className="text-xs gap-1 px-1">
              <Info className="w-3 h-3" />
              College
            </TabsTrigger>
            <TabsTrigger value="colleges" className="text-xs gap-1 px-1">
              <School className="w-3 h-3" />
              Directory
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="locations" className="mt-0">
              <LocationsPanel />
            </TabsContent>
            <TabsContent value="courses" className="mt-0">
              <CoursesPanel />
            </TabsContent>
            <TabsContent value="college" className="mt-0">
              <CollegeInfoPanel />
            </TabsContent>
            <TabsContent value="colleges" className="mt-0">
              <CollegeEntriesPanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
