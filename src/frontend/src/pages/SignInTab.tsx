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
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  Trash2,
  User,
  UserCheck,
} from "lucide-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { useMemo } from "react";
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
import type {
  CollegeCourse,
  CollegeEntryInput,
  Department,
  FacultyMember,
  Placement,
} from "../backend.d";
import { CategoryBadge } from "../components/CategoryBadge";
import { SEED_COLLEGES } from "../data/seedColleges";
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
  useGetCallerUserProfile,
  useGetCollegeInfo,
  useIsCallerAdmin,
  useSaveCallerUserProfile,
  useUpdateCollegeInfo,
  useUpdateCourse,
  useUpdateLocation,
} from "../hooks/useQueries";
import { useAddCollegeEntry, useUpdateCollegeEntry } from "../hooks/useQueries";

// ── Re-used helpers from CollegesTab ───────────────────────
function buildInput(form: {
  name: string;
  tagline: string;
  description: string;
  established: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  departments: Department[];
  courses: CollegeCourse[];
  faculty: FacultyMember[];
  placement: Placement;
  facilities: string[];
  achievements: string[];
}): CollegeEntryInput {
  return {
    name: form.name,
    tagline: form.tagline,
    description: form.description,
    established: form.established,
    address: form.address,
    phone: form.phone,
    email: form.email,
    website: form.website,
    departments: form.departments,
    courses: form.courses,
    faculty: form.faculty,
    placement: form.placement,
    facilities: form.facilities.filter(Boolean),
    achievements: form.achievements.filter(Boolean),
  };
}

function StringListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      {items.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: positional
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder={placeholder}
            className="h-9 text-sm"
          />
          <button
            type="button"
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-destructive/10 flex-shrink-0 border border-border"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label="Remove"
          >
            <X className="w-3.5 h-3.5 text-destructive/70" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs rounded-lg w-full"
        onClick={() => onChange([...items, ""])}
      >
        <Plus className="w-3 h-3 mr-1" />
        Add {label}
      </Button>
    </div>
  );
}

function DepartmentsEditor({
  items,
  onChange,
}: {
  items: Department[];
  onChange: (items: Department[]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Departments
      </Label>
      {items.map((dept, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: positional
        <div key={i} className="bg-muted/40 rounded-xl p-3 space-y-2 relative">
          <button
            type="button"
            className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center hover:bg-destructive/10"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label="Remove department"
          >
            <X className="w-3 h-3 text-destructive/70" />
          </button>
          <Input
            value={dept.name}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], name: e.target.value };
              onChange(next);
            }}
            placeholder="Department name"
            className="h-8 text-sm"
          />
          <Input
            value={dept.description}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], description: e.target.value };
              onChange(next);
            }}
            placeholder="Brief description"
            className="h-8 text-sm"
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs rounded-lg w-full"
        onClick={() => onChange([...items, { name: "", description: "" }])}
      >
        <Plus className="w-3 h-3 mr-1" />
        Add Department
      </Button>
    </div>
  );
}

function CoursesEditor({
  items,
  onChange,
}: {
  items: CollegeCourse[];
  onChange: (items: CollegeCourse[]) => void;
}) {
  const empty: CollegeCourse = {
    name: "",
    level: "UG",
    duration: "",
    fees: "",
    eligibility: "",
    description: "",
  };
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Courses
      </Label>
      {items.map((course, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: positional
        <div key={i} className="bg-muted/40 rounded-xl p-3 space-y-2 relative">
          <button
            type="button"
            className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center hover:bg-destructive/10"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label="Remove course"
          >
            <X className="w-3 h-3 text-destructive/70" />
          </button>
          <Input
            value={course.name}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], name: e.target.value };
              onChange(next);
            }}
            placeholder="Course name"
            className="h-8 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={course.level}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], level: e.target.value };
                onChange(next);
              }}
              placeholder="Level (UG/PG/Diploma)"
              className="h-8 text-sm"
            />
            <Input
              value={course.duration}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], duration: e.target.value };
                onChange(next);
              }}
              placeholder="Duration"
              className="h-8 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={course.fees}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], fees: e.target.value };
                onChange(next);
              }}
              placeholder="Fees"
              className="h-8 text-sm"
            />
            <Input
              value={course.eligibility}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], eligibility: e.target.value };
                onChange(next);
              }}
              placeholder="Eligibility"
              className="h-8 text-sm"
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs rounded-lg w-full"
        onClick={() => onChange([...items, { ...empty }])}
      >
        <Plus className="w-3 h-3 mr-1" />
        Add Course
      </Button>
    </div>
  );
}

function FacultyEditor({
  items,
  onChange,
}: {
  items: FacultyMember[];
  onChange: (items: FacultyMember[]) => void;
}) {
  const empty: FacultyMember = {
    name: "",
    designation: "",
    department: "",
    qualification: "",
    experience: "",
  };
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Faculty
      </Label>
      {items.map((f, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: positional
        <div key={i} className="bg-muted/40 rounded-xl p-3 space-y-2 relative">
          <button
            type="button"
            className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center hover:bg-destructive/10"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label="Remove faculty"
          >
            <X className="w-3 h-3 text-destructive/70" />
          </button>
          <Input
            value={f.name}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], name: e.target.value };
              onChange(next);
            }}
            placeholder="Full name"
            className="h-8 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={f.designation}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], designation: e.target.value };
                onChange(next);
              }}
              placeholder="Designation"
              className="h-8 text-sm"
            />
            <Input
              value={f.department}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], department: e.target.value };
                onChange(next);
              }}
              placeholder="Department"
              className="h-8 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={f.qualification}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], qualification: e.target.value };
                onChange(next);
              }}
              placeholder="Qualification"
              className="h-8 text-sm"
            />
            <Input
              value={f.experience}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], experience: e.target.value };
                onChange(next);
              }}
              placeholder="Experience"
              className="h-8 text-sm"
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs rounded-lg w-full"
        onClick={() => onChange([...items, { ...empty }])}
      >
        <Plus className="w-3 h-3 mr-1" />
        Add Faculty
      </Button>
    </div>
  );
}

// ── College Form ───────────────────────────────────────────

function CollegeRegistrationForm({
  open,
  onClose,
  initial,
  editId,
}: {
  open: boolean;
  onClose: () => void;
  initial?: CollegeEntry;
  editId?: bigint;
}) {
  const emptyPlacement: Placement = {
    rate: BigInt(0),
    highestPackage: BigInt(0),
    averagePackage: BigInt(0),
    topRecruiters: [],
  };

  const [form, setForm] = useState(() => ({
    name: initial?.name ?? "",
    tagline: initial?.tagline ?? "",
    description: initial?.description ?? "",
    established: initial?.established ?? "",
    address: initial?.address ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    website: initial?.website ?? "",
    departments: initial?.departments ?? [],
    courses: initial?.courses ?? [],
    faculty: initial?.faculty ?? [],
    placement: initial?.placement ?? emptyPlacement,
    facilities: initial?.facilities ?? [],
    achievements: initial?.achievements ?? [],
  }));

  const addMutation = useAddCollegeEntry();
  const updateMutation = useUpdateCollegeEntry();
  const isLoading = addMutation.isPending || updateMutation.isPending;

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("College name is required");
      return;
    }
    try {
      const input = buildInput(form);
      if (editId !== undefined) {
        await updateMutation.mutateAsync({ id: editId, input });
        toast.success("College updated successfully");
      } else {
        await addMutation.mutateAsync(input);
        toast.success("College registered successfully");
      }
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[430px] max-h-[90dvh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 flex-shrink-0">
          <DialogTitle className="font-display">
            {editId !== undefined ? "Edit College" : "Register Your College"}
          </DialogTitle>
        </DialogHeader>
        <Separator className="flex-shrink-0" />

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <form
            id="mgmt-college-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Basic Info
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="mc-name">
                  College Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mc-name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Hi-Tech Institute of Technology"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mc-tagline">Tagline</Label>
                <Input
                  id="mc-tagline"
                  value={form.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="Short motto or tagline"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mc-desc">Description</Label>
                <Textarea
                  id="mc-desc"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="About the institution…"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="mc-est">Established</Label>
                  <Input
                    id="mc-est"
                    value={form.established}
                    onChange={(e) => set("established", e.target.value)}
                    placeholder="e.g. 2008"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mc-phone">Phone</Label>
                  <Input
                    id="mc-phone"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+91 …"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mc-address">Address</Label>
                <Textarea
                  id="mc-address"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Full address…"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="mc-email">Email</Label>
                  <Input
                    id="mc-email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="info@college.edu"
                    type="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mc-website">Website</Label>
                  <Input
                    id="mc-website"
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                    placeholder="https://…"
                  />
                </div>
              </div>
            </div>

            <Separator />
            <DepartmentsEditor
              items={form.departments}
              onChange={(v) => set("departments", v)}
            />
            <Separator />
            <CoursesEditor
              items={form.courses}
              onChange={(v) => set("courses", v)}
            />
            <Separator />
            <FacultyEditor
              items={form.faculty}
              onChange={(v) => set("faculty", v)}
            />
            <Separator />
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Placement Info
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="mp-rate" className="text-xs">
                    Rate (%)
                  </Label>
                  <Input
                    id="mp-rate"
                    type="number"
                    min={0}
                    max={100}
                    value={Number(form.placement.rate)}
                    onChange={(e) =>
                      set("placement", {
                        ...form.placement,
                        rate: BigInt(e.target.value || "0"),
                      })
                    }
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mp-high" className="text-xs">
                    Highest (LPA)
                  </Label>
                  <Input
                    id="mp-high"
                    type="number"
                    min={0}
                    value={Number(form.placement.highestPackage)}
                    onChange={(e) =>
                      set("placement", {
                        ...form.placement,
                        highestPackage: BigInt(e.target.value || "0"),
                      })
                    }
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mp-avg" className="text-xs">
                    Average (LPA)
                  </Label>
                  <Input
                    id="mp-avg"
                    type="number"
                    min={0}
                    value={Number(form.placement.averagePackage)}
                    onChange={(e) =>
                      set("placement", {
                        ...form.placement,
                        averagePackage: BigInt(e.target.value || "0"),
                      })
                    }
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <StringListEditor
                label="Top Recruiters"
                items={form.placement.topRecruiters}
                onChange={(v) =>
                  set("placement", { ...form.placement, topRecruiters: v })
                }
                placeholder="e.g. TCS"
              />
            </div>
            <Separator />
            <StringListEditor
              label="Facilities"
              items={form.facilities}
              onChange={(v) => set("facilities", v)}
              placeholder="e.g. Central Library"
            />
            <Separator />
            <StringListEditor
              label="Achievements"
              items={form.achievements}
              onChange={(v) => set("achievements", v)}
              placeholder="e.g. NAAC A+ Accredited"
            />
          </form>
        </div>

        <Separator className="flex-shrink-0" />
        <DialogFooter className="px-5 py-4 flex-shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" form="mgmt-college-form" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editId !== undefined ? "Save Changes" : "Register College"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Location Form (Campus Admin) ───────────────────────────

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
            <Label htmlFor="si-loc-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="si-loc-name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Computer Science Department"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="si-loc-category">Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => handleChange("category", v)}
            >
              <SelectTrigger id="si-loc-category">
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
            <Label htmlFor="si-loc-building">
              Building <span className="text-destructive">*</span>
            </Label>
            <Input
              id="si-loc-building"
              value={form.building}
              onChange={(e) => handleChange("building", e.target.value)}
              placeholder="e.g. Engineering Hall"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="si-loc-floor">Floor</Label>
              <Input
                id="si-loc-floor"
                value={form.floor}
                onChange={(e) => handleChange("floor", e.target.value)}
                placeholder="e.g. 3rd Floor"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="si-loc-room">
                Room # <span className="text-destructive">*</span>
              </Label>
              <Input
                id="si-loc-room"
                value={form.roomNumber}
                onChange={(e) => handleChange("roomNumber", e.target.value)}
                placeholder="e.g. E-301"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="si-loc-desc">Description</Label>
            <Textarea
              id="si-loc-desc"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description…"
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

// ── Course Form (Campus Admin) ─────────────────────────────

const EMPTY_COURSE_FORM: CourseInput = {
  name: "",
  department: "",
  duration: "",
  fees: "",
  eligibility: "",
  description: "",
};

function CourseFormDialog({
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
        toast.success("Course updated");
      } else {
        await addMutation.mutateAsync(form);
        toast.success("Course added");
      }
      onClose();
    } catch {
      toast.error("Something went wrong.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[400px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editId ? "Edit Course" : "Add Course"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>
              Course Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. B.Tech – CSE"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>
              Department <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.department}
              onChange={(e) => handleChange("department", e.target.value)}
              placeholder="e.g. Computer Science"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Input
                value={form.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                placeholder="e.g. 4 Years"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Fees</Label>
              <Input
                value={form.fees}
                onChange={(e) => handleChange("fees", e.target.value)}
                placeholder="e.g. ₹85,000/yr"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Eligibility</Label>
            <Textarea
              value={form.eligibility}
              onChange={(e) => handleChange("eligibility", e.target.value)}
              placeholder="Minimum qualification…"
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
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

// ── College Info Form (Campus Admin) ──────────────────────

function CollegeInfoFormDialog({
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
      toast.success("College info updated");
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
            <Label>
              College Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Greenfield Institute"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tagline</Label>
            <Input
              value={form.tagline}
              onChange={(e) => handleChange("tagline", e.target.value)}
              placeholder="A short motto"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="About the institution…"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Established Year</Label>
            <Input
              value={form.established}
              onChange={(e) => handleChange("established", e.target.value)}
              placeholder="e.g. 1978"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Textarea
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Full address…"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+91 …"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="info@…"
                type="email"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Website</Label>
            <Input
              value={form.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://…"
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

// ── Locations Panel ────────────────────────────────────────

function LocationsPanel() {
  const { data: locations = [], isLoading } = useGetAllLocations();
  const deleteMutation = useDeleteLocation();
  const [formOpen, setFormOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);

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
      {isLoading ? (
        <div className="space-y-2">
          {(["sk1", "sk2", "sk3"] as const).map((sk) => (
            <Skeleton key={sk} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <Building2 className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="font-display font-semibold text-sm">No locations yet</p>
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
                    {loc.building} · {loc.roomNumber}
                  </p>
                  <div className="mt-1.5">
                    <CategoryBadge category={loc.category} size="sm" />
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                    onClick={() => {
                      setEditLocation(loc);
                      setFormOpen(true);
                    }}
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
              This will permanently remove <strong>{deleteTarget?.name}</strong>
              . Cannot be undone.
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

// ── Courses Panel ──────────────────────────────────────────

function CoursesPanel() {
  const { data: courses = [], isLoading } = useGetAllCourses();
  const deleteMutation = useDeleteCourse();
  const [formOpen, setFormOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

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
      {isLoading ? (
        <div className="space-y-2">
          {(["sk1", "sk2", "sk3"] as const).map((sk) => (
            <Skeleton key={sk} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <GraduationCap className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="font-display font-semibold text-sm">No courses yet</p>
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
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent"
                    onClick={() => {
                      setEditCourse(course);
                      setFormOpen(true);
                    }}
                    aria-label="Edit"
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(course)}
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
      <CourseFormDialog
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
              This will permanently remove <strong>{deleteTarget?.name}</strong>
              .
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

// ── College Info Panel ─────────────────────────────────────

function CollegeInfoPanel() {
  const { data: collegeInfo, isLoading } = useGetCollegeInfo();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Institution details</p>
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
              {collegeInfo.address && (
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm">{collegeInfo.address}</p>
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
      <CollegeInfoFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={collegeInfo ?? null}
      />
    </div>
  );
}

// ── My Colleges Panel (Management) ────────────────────────

function MyCollegesPanel({ principal }: { principal: string }) {
  const { data: backendColleges, isLoading } = useGetAllCollegeEntries();
  const deleteMutation = useDeleteCollegeEntry();
  const [formOpen, setFormOpen] = useState(false);
  const [editCollege, setEditCollege] = useState<CollegeEntry | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<CollegeEntry | null>(null);

  const myColleges = useMemo(() => {
    const all =
      backendColleges && backendColleges.length > 0
        ? backendColleges
        : SEED_COLLEGES;
    return all.filter((c) => {
      try {
        return c.managedBy.toText() === principal;
      } catch {
        return false;
      }
    });
  }, [backendColleges, principal]);

  const handleFormClose = () => {
    setFormOpen(false);
    setEditCollege(undefined);
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("College removed");
    } catch {
      toast.error("Failed to delete college");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {myColleges.length} college{myColleges.length !== 1 ? "s" : ""} listed
        </p>
        <Button
          size="sm"
          onClick={() => setFormOpen(true)}
          className="h-8 rounded-lg font-medium text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Register New
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {(["sk1", "sk2"] as const).map((sk) => (
            <Skeleton key={sk} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : myColleges.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-3">
            <School className="w-6 h-6 text-accent-foreground" />
          </div>
          <p className="font-display font-semibold text-sm">No colleges yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
            Register your institution and it will appear in the Colleges
            directory
          </p>
          <Button className="mt-4" size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Register College
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {myColleges.map((entry, i) => (
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
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                    onClick={() => {
                      setEditCollege(entry);
                      setFormOpen(true);
                    }}
                    aria-label="Edit college"
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors"
                    onClick={() => setDeleteTarget(entry)}
                    aria-label="Delete college"
                  >
                    <Trash2 className="w-3 h-3 text-destructive/70" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CollegeRegistrationForm
        open={formOpen}
        onClose={handleFormClose}
        initial={editCollege}
        editId={editCollege?.id}
      />
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove college?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.name}</strong>
              .
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
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Student Portal ─────────────────────────────────────────

function StudentPortal({
  onNavigateToColleges,
}: { onNavigateToColleges: () => void }) {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principal = identity?.getPrincipal().toText() ?? "";

  const { data: profile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [nameInput, setNameInput] = useState("");
  const [editingName, setEditingName] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: nameInput.trim() });
      toast.success("Name saved!");
      setEditingName(false);
    } catch {
      toast.error("Failed to save name");
    }
  };

  // Bookmarks from localStorage
  const bookmarkKey = `bookmarks_${principal}`;
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(bookmarkKey) ?? "[]");
    } catch {
      return [];
    }
  });

  const { data: allColleges } = useGetAllCollegeEntries();
  const bookmarkedColleges = useMemo(() => {
    if (!allColleges) return [];
    return allColleges.filter((c) => bookmarks.includes(c.id.toString()));
  }, [allColleges, bookmarks]);

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b !== id);
    setBookmarks(updated);
    localStorage.setItem(bookmarkKey, JSON.stringify(updated));
    toast.success("Bookmark removed");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Student Portal
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your campus companion
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
        {/* Profile */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              {profileLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <p className="font-display font-semibold text-sm truncate">
                  {profile?.name || "Student"}
                </p>
              )}
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {principal.slice(0, 20)}…
              </p>
            </div>
            <button
              type="button"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors flex-shrink-0"
              onClick={() => {
                setNameInput(profile?.name ?? "");
                setEditingName(true);
              }}
              aria-label="Edit name"
            >
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>

          {editingName && (
            <div className="flex gap-2">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your display name"
                className="flex-1 h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                }}
                autoFocus
              />
              <Button
                size="sm"
                className="h-9 px-3"
                onClick={handleSaveName}
                disabled={saveProfile.isPending}
              >
                {saveProfile.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-3"
                onClick={() => setEditingName(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Explore prompt */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/50 rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-sm">
              Explore Colleges
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Browse top 100 universities and compare them
            </p>
          </div>
          <Button
            size="sm"
            className="h-8 text-xs flex-shrink-0"
            onClick={onNavigateToColleges}
          >
            Browse
          </Button>
        </motion.div>

        {/* Bookmarks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-semibold text-sm">
              Bookmarked Colleges
            </p>
            <Badge variant="secondary" className="text-xs">
              {bookmarks.length}
            </Badge>
          </div>
          {bookmarks.length === 0 ? (
            <div className="bg-muted/40 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">No bookmarks yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Browse colleges and tap the bookmark icon to save them
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {bookmarkedColleges.map((college) => (
                <div
                  key={college.id.toString()}
                  className="flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5"
                >
                  <span className="text-xs font-medium text-foreground line-clamp-1 max-w-[140px]">
                    {college.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeBookmark(college.id.toString())}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove bookmark"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Management Portal ──────────────────────────────────────

function ManagementPortal() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const principal = identity?.getPrincipal().toText() ?? "";

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (adminLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-5 pb-3">
          <h1 className="font-display text-2xl font-bold">Management Portal</h1>
        </div>
        <div className="px-4 space-y-3">
          {(["sk1", "sk2", "sk3", "sk4"] as const).map((sk) => (
            <Skeleton key={sk} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Management Portal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAdmin ? "Campus Administrator" : "College Manager"}
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

      <div className="flex-1 overflow-hidden px-4 pb-4">
        <Tabs defaultValue="mycolleges" className="h-full flex flex-col">
          <TabsList
            className={`grid mb-4 w-full ${isAdmin ? "grid-cols-2" : "grid-cols-1"}`}
          >
            <TabsTrigger value="mycolleges" className="text-xs gap-1 px-2">
              <School className="w-3 h-3" />
              My Colleges
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="campus" className="text-xs gap-1 px-2">
                <Building2 className="w-3 h-3" />
                Campus Admin
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="mycolleges" className="mt-0">
              <MyCollegesPanel principal={principal} />
            </TabsContent>
            {isAdmin && (
              <TabsContent value="campus" className="mt-0">
                <Tabs defaultValue="locations" className="flex flex-col">
                  <TabsList className="grid grid-cols-3 mb-4 w-full">
                    <TabsTrigger
                      value="locations"
                      className="text-xs gap-1 px-1"
                    >
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
                  </TabsList>
                  <TabsContent value="locations" className="mt-0">
                    <LocationsPanel />
                  </TabsContent>
                  <TabsContent value="courses" className="mt-0">
                    <CoursesPanel />
                  </TabsContent>
                  <TabsContent value="college" className="mt-0">
                    <CollegeInfoPanel />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// ── Sign In Tab (Main Export) ──────────────────────────────

export function SignInTab({
  onNavigateToColleges,
}: { onNavigateToColleges: () => void }) {
  const { login, loginStatus, identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: roleLoading } = useIsCallerAdmin();

  const [selectedRole, setSelectedRole] = useState<
    "student" | "manager" | null
  >(null);

  // If authenticated, determine the view
  if (isAuthenticated) {
    if (roleLoading) {
      return (
        <div className="flex flex-col h-full">
          <div className="px-4 pt-5 pb-3">
            <h1 className="font-display text-2xl font-bold">Sign In</h1>
          </div>
          <div className="px-4 space-y-3">
            {(["sk1", "sk2", "sk3"] as const).map((sk) => (
              <Skeleton key={sk} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      );
    }

    // Admin → Management Portal; otherwise decide by selectedRole
    if (isAdmin) {
      return <ManagementPortal />;
    }

    // Non-admin: use selectedRole to decide which portal to show
    if (selectedRole === "manager") {
      return <ManagementPortal />;
    }

    // Default for non-admin authenticated: Student Portal
    return <StudentPortal onNavigateToColleges={onNavigateToColleges} />;
  }

  // Unauthenticated view
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Sign In
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Choose your role to continue
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16 gap-6">
        <div className="w-full max-w-sm space-y-4">
          {/* Role cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Student card */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center transition-all ${
                selectedRole === "student"
                  ? "border-primary bg-primary/8"
                  : "border-border bg-card hover:border-primary/40"
              }`}
              onClick={() => setSelectedRole("student")}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold text-sm">Student</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Browse colleges, track your interests
                </p>
              </div>
              {selectedRole === "student" && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <UserCheck className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </motion.button>

            {/* College Manager card */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center transition-all ${
                selectedRole === "manager"
                  ? "border-primary bg-primary/8"
                  : "border-border bg-card hover:border-primary/40"
              }`}
              onClick={() => setSelectedRole("manager")}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold text-sm">
                  College Manager
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  List and manage your institution
                </p>
              </div>
              {selectedRole === "manager" && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <UserCheck className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </motion.button>
          </div>

          {/* Sign in button */}
          <Button
            className="w-full h-12 rounded-xl font-display font-semibold text-base"
            onClick={() => login()}
            disabled={!selectedRole || loginStatus === "logging-in"}
          >
            {loginStatus === "logging-in" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                {selectedRole
                  ? `Sign In as ${selectedRole === "student" ? "Student" : "College Manager"}`
                  : "Select a role to continue"}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            🔐 Both use secure Internet Identity login — no passwords needed
          </p>
        </div>
      </div>
    </div>
  );
}
