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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Globe,
  GraduationCap,
  IndianRupee,
  Layers,
  Loader2,
  LogIn,
  Mail,
  MapPin,
  Medal,
  Pencil,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  CollegeCourse,
  CollegeEntry,
  CollegeEntryInput,
  Department,
  FacultyMember,
  Placement,
} from "../backend.d";
import { SEED_COLLEGES } from "../data/seedColleges";
import { UNI_RANK_COLLEGES } from "../data/uniRankColleges";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddCollegeEntry,
  useDeleteCollegeEntry,
  useGetAllCollegeEntries,
  useIsCallerAdmin,
  useUpdateCollegeEntry,
} from "../hooks/useQueries";

// ── Helpers ────────────────────────────────────────────────

function extractCity(address: string): string {
  const parts = address.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    if (
      trimmed &&
      !trimmed.toLowerCase().includes("pin") &&
      !trimmed.toLowerCase().includes("district") &&
      !trimmed.match(/^\d/)
    ) {
      return trimmed.split(":").pop()?.trim() ?? trimmed;
    }
  }
  return parts[parts.length - 2]?.trim() ?? address;
}

function levelColor(level: string) {
  if (level === "UG") return "oklch(0.52 0.13 200)";
  if (level === "PG") return "oklch(0.58 0.17 280)";
  if (level === "Diploma") return "oklch(0.55 0.15 40)";
  return "oklch(0.52 0.1 220)";
}

// ── College Card ───────────────────────────────────────────

function CollegeCard({
  college,
  index,
  onSelect,
}: {
  college: CollegeEntry;
  index: number;
  onSelect: () => void;
}) {
  const city = extractCity(college.address);

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="w-full bg-card rounded-2xl border border-border text-left hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.99] overflow-hidden"
      onClick={onSelect}
      type="button"
    >
      {/* Accent band */}
      <div
        className="h-1.5 w-full"
        style={{ background: "oklch(0.52 0.13 200)" }}
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm text-foreground leading-snug line-clamp-2">
              {college.name}
            </p>
            {college.tagline && (
              <p className="text-xs text-muted-foreground italic mt-0.5 line-clamp-1">
                {college.tagline}
              </p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        </div>

        <div className="flex items-center gap-3 flex-wrap mt-3 pt-3 border-t border-border">
          {college.established && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Est. {college.established}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {college.departments.length} Dept
              {college.departments.length !== 1 ? "s" : ""}
            </span>
          </div>
          {city && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground line-clamp-1">
                {city}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}

// ── College Detail View ────────────────────────────────────

function CollegeDetailView({
  college,
  onClose,
  onEdit,
  onDelete,
  canManage,
  isAuthenticated,
  principal,
}: {
  college: CollegeEntry;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canManage: boolean;
  isAuthenticated: boolean;
  principal: string;
}) {
  const coursesByLevel = useMemo(() => {
    const groups: Record<string, CollegeCourse[]> = {};
    for (const c of college.courses) {
      const lvl = c.level || "Other";
      if (!groups[lvl]) groups[lvl] = [];
      groups[lvl].push(c);
    }
    return groups;
  }, [college.courses]);

  const bookmarkKey = `bookmarks_${principal}`;
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (!principal) return false;
    try {
      const stored: string[] = JSON.parse(
        localStorage.getItem(bookmarkKey) ?? "[]",
      );
      return stored.includes(college.id.toString());
    } catch {
      return false;
    }
  });

  const toggleBookmark = () => {
    if (!principal) return;
    try {
      const stored: string[] = JSON.parse(
        localStorage.getItem(bookmarkKey) ?? "[]",
      );
      const id = college.id.toString();
      let updated: string[];
      if (isBookmarked) {
        updated = stored.filter((b) => b !== id);
        toast.success("Bookmark removed");
      } else {
        updated = [...stored, id];
        toast.success("Bookmarked!");
      }
      localStorage.setItem(bookmarkKey, JSON.stringify(updated));
      setIsBookmarked(!isBookmarked);
    } catch {
      toast.error("Failed to update bookmark");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col h-full bg-background"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 mt-0.5 hover:bg-accent transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-base leading-tight text-foreground line-clamp-2">
              {college.name}
            </h2>
            {college.tagline && (
              <p className="text-xs italic text-muted-foreground mt-0.5 line-clamp-1">
                {college.tagline}
              </p>
            )}
            {college.established && (
              <div className="flex items-center gap-1 mt-1">
                <CalendarDays className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">
                  Est. {college.established}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isAuthenticated && (
              <button
                type="button"
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-accent transition-colors"
                onClick={toggleBookmark}
                aria-label={
                  isBookmarked ? "Remove bookmark" : "Bookmark college"
                }
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            )}
            {canManage && (
              <>
                <button
                  type="button"
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-accent transition-colors"
                  onClick={onEdit}
                  aria-label="Edit"
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-destructive/10 transition-colors"
                  onClick={onDelete}
                  aria-label="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Separator className="flex-shrink-0" />

      {/* Tabbed detail */}
      <Tabs defaultValue="about" className="flex flex-col flex-1 min-h-0">
        <div className="px-4 pt-3 flex-shrink-0">
          <ScrollArea className="w-full">
            <TabsList className="flex w-max gap-1 h-8 bg-muted/60 p-1 rounded-xl">
              {[
                "about",
                "depts",
                "courses",
                "faculty",
                "placement",
                "campus",
                "awards",
              ].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="text-[10px] px-2.5 h-6 capitalize rounded-lg whitespace-nowrap"
                >
                  {tab === "depts"
                    ? "Depts"
                    : tab === "campus"
                      ? "Facilities"
                      : tab === "awards"
                        ? "Achievements"
                        : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* ── About ── */}
          <TabsContent value="about" className="mt-0 space-y-4">
            {college.description && (
              <p className="text-sm text-foreground leading-relaxed">
                {college.description}
              </p>
            )}
            <div className="space-y-3">
              {college.address && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium leading-snug">
                      {college.address}
                    </p>
                  </div>
                </div>
              )}
              {college.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{college.phone}</p>
                  </div>
                </div>
              )}
              {college.email && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${college.email}`}
                      className="text-sm font-medium text-primary break-all"
                    >
                      {college.email}
                    </a>
                  </div>
                </div>
              )}
              {college.website && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    <a
                      href={college.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary break-all"
                    >
                      {college.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Departments ── */}
          <TabsContent value="depts" className="mt-0">
            {college.departments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No departments listed
              </p>
            ) : (
              <div className="space-y-3">
                {college.departments.map((dept) => (
                  <div
                    key={dept.name}
                    className="bg-card border border-border rounded-xl p-3 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-display font-semibold text-foreground">
                        {dept.name}
                      </p>
                      {dept.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {dept.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Courses ── */}
          <TabsContent value="courses" className="mt-0 space-y-5">
            {Object.keys(coursesByLevel).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No courses listed
              </p>
            ) : (
              Object.entries(coursesByLevel).map(([level, courses]) => (
                <div key={level}>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: levelColor(level) }}
                    />
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: levelColor(level) }}
                    >
                      {level}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {courses.map((course) => (
                      <div
                        key={course.name}
                        className="bg-card border border-border rounded-xl p-3"
                      >
                        <p className="text-sm font-display font-semibold text-foreground leading-snug">
                          {course.name}
                        </p>
                        {course.description && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {course.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-border/60">
                          {course.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {course.duration}
                              </span>
                            </div>
                          )}
                          {course.fees && (
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground font-medium">
                                {course.fees}
                              </span>
                            </div>
                          )}
                          {course.eligibility && (
                            <p className="text-xs text-muted-foreground w-full">
                              <span className="font-medium">Eligibility:</span>{" "}
                              {course.eligibility}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* ── Faculty ── */}
          <TabsContent value="faculty" className="mt-0">
            {college.faculty.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No faculty listed
              </p>
            ) : (
              <div className="space-y-3">
                {college.faculty.map((f) => (
                  <div
                    key={f.name}
                    className="bg-card border border-border rounded-xl p-3 flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-display font-semibold text-foreground leading-tight">
                        {f.name}
                      </p>
                      <p className="text-xs text-primary font-medium mt-0.5">
                        {f.designation}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {f.department}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {f.qualification && (
                          <span className="text-xs text-muted-foreground bg-muted/60 rounded-md px-2 py-0.5">
                            {f.qualification}
                          </span>
                        )}
                        {f.experience && (
                          <span className="text-xs text-muted-foreground">
                            {f.experience}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Placement ── */}
          <TabsContent value="placement" className="mt-0 space-y-4">
            <div className="bg-primary/8 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-sm font-display font-semibold">
                  Placement Statistics
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background rounded-xl p-3 text-center">
                  <p className="font-display font-bold text-2xl text-primary">
                    {Number(college.placement.rate)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Placed</p>
                </div>
                <div className="bg-background rounded-xl p-3 text-center">
                  <p className="font-display font-bold text-xl text-foreground">
                    ₹{Number(college.placement.highestPackage)} LPA
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Highest
                  </p>
                </div>
                <div className="bg-background rounded-xl p-3 text-center col-span-2">
                  <p className="font-display font-bold text-xl text-foreground">
                    ₹{Number(college.placement.averagePackage)} LPA
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Average Package
                  </p>
                </div>
              </div>
            </div>
            {college.placement.topRecruiters.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Top Recruiters
                </p>
                <div className="flex flex-wrap gap-2">
                  {college.placement.topRecruiters.map((r) => (
                    <Badge
                      key={r}
                      variant="secondary"
                      className="text-xs rounded-full px-3 py-1"
                    >
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Facilities ── */}
          <TabsContent value="campus" className="mt-0">
            {college.facilities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No facilities listed
              </p>
            ) : (
              <ul className="space-y-2.5">
                {college.facilities.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 bg-card border border-border rounded-xl p-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">
                      {f}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          {/* ── Achievements ── */}
          <TabsContent value="awards" className="mt-0">
            {college.achievements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No achievements listed
              </p>
            ) : (
              <ul className="space-y-2.5">
                {college.achievements.map((a) => (
                  <li
                    key={a}
                    className="flex items-start gap-3 bg-card border border-border rounded-xl p-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground leading-relaxed mt-1">
                      {a}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}

// ── Array field helpers ────────────────────────────────────

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
        // biome-ignore lint/suspicious/noArrayIndexKey: positional index is intentional for editable list
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
        // biome-ignore lint/suspicious/noArrayIndexKey: positional index is intentional for editable list
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
        // biome-ignore lint/suspicious/noArrayIndexKey: positional index is intentional for editable list
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
              placeholder="Fees (e.g. ₹60,000/yr)"
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
          <Input
            value={course.description}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], description: e.target.value };
              onChange(next);
            }}
            placeholder="Description"
            className="h-8 text-sm"
          />
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
        // biome-ignore lint/suspicious/noArrayIndexKey: positional index is intentional for editable list
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

// ── College Registration / Edit Form ──────────────────────

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

function CollegeForm({
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
          <form id="college-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Basic Info
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="c-name">
                  College Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="c-name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Hi-Tech Institute of Technology"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-tagline">Tagline</Label>
                <Input
                  id="c-tagline"
                  value={form.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="Short motto or tagline"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-desc">Description</Label>
                <Textarea
                  id="c-desc"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="About the institution…"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="c-est">Established Year</Label>
                  <Input
                    id="c-est"
                    value={form.established}
                    onChange={(e) => set("established", e.target.value)}
                    placeholder="e.g. 2008"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-phone">Phone</Label>
                  <Input
                    id="c-phone"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+91 …"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-address">Address</Label>
                <Textarea
                  id="c-address"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Full address…"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="c-email">Email</Label>
                  <Input
                    id="c-email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="info@college.edu"
                    type="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-website">Website</Label>
                  <Input
                    id="c-website"
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                    placeholder="https://…"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Departments */}
            <DepartmentsEditor
              items={form.departments}
              onChange={(v) => set("departments", v)}
            />

            <Separator />

            {/* Courses */}
            <CoursesEditor
              items={form.courses}
              onChange={(v) => set("courses", v)}
            />

            <Separator />

            {/* Faculty */}
            <FacultyEditor
              items={form.faculty}
              onChange={(v) => set("faculty", v)}
            />

            <Separator />

            {/* Placement */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Placement Info
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="p-rate" className="text-xs">
                    Rate (%)
                  </Label>
                  <Input
                    id="p-rate"
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
                  <Label htmlFor="p-high" className="text-xs">
                    Highest (LPA)
                  </Label>
                  <Input
                    id="p-high"
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
                  <Label htmlFor="p-avg" className="text-xs">
                    Average (LPA)
                  </Label>
                  <Input
                    id="p-avg"
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

            {/* Facilities */}
            <StringListEditor
              label="Facilities"
              items={form.facilities}
              onChange={(v) => set("facilities", v)}
              placeholder="e.g. Central Library"
            />

            <Separator />

            {/* Achievements */}
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
          <Button type="submit" form="college-form" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editId !== undefined ? "Save Changes" : "Register College"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Colleges Tab ───────────────────────────────────────────

// ── UniRank Badge ──────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 10) {
    return (
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "oklch(0.82 0.16 85 / 0.15)" }}
      >
        <Trophy
          className="w-3.5 h-3.5"
          style={{ color: "oklch(0.65 0.16 85)" }}
        />
      </div>
    );
  }
  if (rank <= 50) {
    return (
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "oklch(0.78 0.04 220 / 0.15)" }}
      >
        <Medal
          className="w-3.5 h-3.5"
          style={{ color: "oklch(0.58 0.05 220)" }}
        />
      </div>
    );
  }
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: "oklch(0.68 0.1 40 / 0.12)" }}
    >
      <Star className="w-3.5 h-3.5" style={{ color: "oklch(0.58 0.1 40)" }} />
    </div>
  );
}

// ── UniRank Section ────────────────────────────────────────

function UniRankSection({ searchFilter }: { searchFilter: string }) {
  const [visible, setVisible] = useState(true);

  const filtered = useMemo(() => {
    if (!searchFilter.trim()) return UNI_RANK_COLLEGES;
    const q = searchFilter.toLowerCase().trim();
    return UNI_RANK_COLLEGES.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.state.toLowerCase().includes(q),
    );
  }, [searchFilter]);

  if (searchFilter.trim() && filtered.length === 0) return null;

  return (
    <div className="mb-5">
      {/* Section header */}
      <button
        type="button"
        className="w-full flex items-center justify-between mb-3 group"
        onClick={() => setVisible((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-display font-bold text-sm text-foreground">
              Top 100 Indian Universities
            </p>
            <p className="text-xs text-muted-foreground">uniRank 2025</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="text-xs rounded-full">
            {filtered.length}
          </Badge>
          {visible ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="space-y-2">
              {filtered.map((uni, i) => (
                <motion.div
                  key={uni.rank}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.12,
                    delay: Math.min(i * 0.01, 0.3),
                  }}
                  className="bg-card rounded-xl border border-border p-3 flex items-center gap-3"
                >
                  <RankBadge rank={uni.rank} />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-xs text-foreground leading-snug line-clamp-2">
                      {uni.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {uni.city}, {uni.state}
                    </p>
                  </div>
                  <div
                    className="text-xs font-bold tabular-nums px-2 py-1 rounded-lg flex-shrink-0"
                    style={{
                      background:
                        uni.rank <= 10
                          ? "oklch(0.82 0.16 85 / 0.12)"
                          : uni.rank <= 50
                            ? "oklch(0.78 0.04 220 / 0.12)"
                            : "oklch(0.68 0.1 40 / 0.1)",
                      color:
                        uni.rank <= 10
                          ? "oklch(0.6 0.16 85)"
                          : uni.rank <= 50
                            ? "oklch(0.45 0.06 220)"
                            : "oklch(0.52 0.1 40)",
                    }}
                  >
                    #{uni.rank}
                  </div>
                </motion.div>
              ))}
            </div>

            {!searchFilter.trim() && (
              <div className="mt-3 mb-1">
                <Separator />
                <p className="text-xs text-center text-muted-foreground mt-3">
                  ↓ Community-registered colleges below
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Colleges Tab ───────────────────────────────────────────

export function CollegesTab() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: backendColleges, isLoading } = useGetAllCollegeEntries();
  const deleteMutation = useDeleteCollegeEntry();

  const colleges =
    backendColleges && backendColleges.length > 0
      ? backendColleges
      : SEED_COLLEGES;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<CollegeEntry | null>(
    null,
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editCollege, setEditCollege] = useState<CollegeEntry | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<CollegeEntry | null>(null);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return colleges;
    const q = searchTerm.toLowerCase().trim();
    return colleges.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q),
    );
  }, [colleges, searchTerm]);

  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal().toText() ?? "";

  const canManage = (college: CollegeEntry) => {
    if (isAdmin) return true;
    if (!identity) return false;
    return college.managedBy.toText() === identity.getPrincipal().toText();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("College removed");
      if (selectedCollege?.id === deleteTarget.id) setSelectedCollege(null);
    } catch {
      toast.error("Failed to delete college");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditCollege(undefined);
  };

  // ── Detail view ──
  if (selectedCollege) {
    return (
      <AnimatePresence mode="wait">
        <CollegeDetailView
          key={selectedCollege.id.toString()}
          college={selectedCollege}
          onClose={() => setSelectedCollege(null)}
          canManage={canManage(selectedCollege)}
          isAuthenticated={isAuthenticated}
          principal={principal}
          onEdit={() => {
            setEditCollege(selectedCollege);
            setFormOpen(true);
          }}
          onDelete={() => setDeleteTarget(selectedCollege)}
        />
        <CollegeForm
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
                This will permanently remove{" "}
                <strong>{deleteTarget?.name}</strong> from the directory. This
                action cannot be undone.
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
      </AnimatePresence>
    );
  }

  // ── Directory view ──
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Colleges
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Browse & compare institutions
            </p>
          </div>
          {isAuthenticated && (
            <Button
              size="sm"
              className="h-9 rounded-xl font-medium text-xs flex-shrink-0"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Register
            </Button>
          )}
          {!isAuthenticated && (
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 hover:bg-accent px-3 py-2 rounded-xl transition-colors"
              onClick={() => {}}
              title="Sign in to register your college"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign in to list
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search colleges by name or city…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-card border-border h-11 rounded-xl text-sm"
        />
        {searchTerm && (
          <button
            type="button"
            className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSearchTerm("")}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* List with UniRank section */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 mt-3">
        {/* UniRank top 100 */}
        <UniRankSection searchFilter={searchTerm} />

        {/* Community registered colleges */}
        {!searchTerm.trim() && (
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-semibold text-sm text-foreground">
              Community Registered
            </p>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "Loading…"
                : `${filtered.length} college${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {(["sk1", "sk2", "sk3"] as const).map((sk) => (
              <Skeleton key={sk} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 && searchTerm.trim() ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-display font-semibold text-foreground">
              No community colleges found
            </p>
            <p className="text-sm text-muted-foreground mt-1.5">
              Try a different search term
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {filtered.map((college, i) => (
                <CollegeCard
                  key={college.id.toString()}
                  college={college}
                  index={i}
                  onSelect={() => setSelectedCollege(college)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Form dialog */}
      <CollegeForm
        open={formOpen}
        onClose={handleFormClose}
        initial={editCollege}
        editId={editCollege?.id}
      />
    </div>
  );
}
