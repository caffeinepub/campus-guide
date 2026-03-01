import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Bed,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock,
  Globe,
  GraduationCap,
  HeartPulse,
  IndianRupee,
  Info,
  Lightbulb,
  Mail,
  MapPin,
  Mic2,
  Phone,
  Search,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  UtensilsCrossed,
  Wifi,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { CollegeInfo, Course } from "../backend.d";
import {
  SEED_COLLEGE_EXTRA,
  SEED_COLLEGE_INFO,
  SEED_COURSES,
} from "../data/seedCourses";
import { useGetAllCourses, useGetCollegeInfo } from "../hooks/useQueries";

// ── Facility icon map ─────────────────────────────────────

const FACILITY_ICONS: Record<string, React.ReactNode> = {
  "Boys & Girls Hostel": <Bed className="w-4 h-4" />,
  "Central Library": <BookOpen className="w-4 h-4" />,
  "Sports Complex": <Trophy className="w-4 h-4" />,
  "Medical Center": <HeartPulse className="w-4 h-4" />,
  "High-Speed Wi-Fi": <Wifi className="w-4 h-4" />,
  "Cafeteria & Canteen": <UtensilsCrossed className="w-4 h-4" />,
  Auditorium: <Mic2 className="w-4 h-4" />,
  "Innovation Lab": <Lightbulb className="w-4 h-4" />,
};

// ── College Info Modal ────────────────────────────────────

function CollegeInfoModal({
  open,
  onClose,
  info,
}: {
  open: boolean;
  onClose: () => void;
  info: CollegeInfo;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[520px] max-h-[90dvh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Fixed header */}
        <DialogHeader className="px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="font-display text-base leading-tight">
                {info.name}
              </DialogTitle>
              {info.tagline && (
                <p className="text-xs text-muted-foreground mt-0.5 italic truncate">
                  {info.tagline}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <Separator className="flex-shrink-0" />

        {/* Tabbed content */}
        <Tabs defaultValue="about" className="flex flex-col flex-1 min-h-0">
          {/* Sticky tab bar */}
          <TabsList className="flex-shrink-0 mx-4 mt-3 mb-0 grid grid-cols-5 h-9 text-xs rounded-xl">
            <TabsTrigger value="about" className="text-[11px] px-1">
              About
            </TabsTrigger>
            <TabsTrigger value="faculty" className="text-[11px] px-1">
              Faculty
            </TabsTrigger>
            <TabsTrigger value="placement" className="text-[11px] px-1">
              Placement
            </TabsTrigger>
            <TabsTrigger value="facilities" className="text-[11px] px-1">
              Campus
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-[11px] px-1">
              Awards
            </TabsTrigger>
          </TabsList>

          {/* Scrollable tab content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* ── About ── */}
            <TabsContent value="about" className="mt-0 space-y-4">
              {info.description && (
                <p className="text-sm text-foreground leading-relaxed">
                  {info.description}
                </p>
              )}
              <div className="grid grid-cols-1 gap-3">
                {info.established && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Established
                      </p>
                      <p className="text-sm font-medium">{info.established}</p>
                    </div>
                  </div>
                )}
                {info.address && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-medium leading-snug">
                        {info.address}
                      </p>
                    </div>
                  </div>
                )}
                {info.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${info.phone}`}
                        className="text-sm font-medium text-primary"
                      >
                        {info.phone}
                      </a>
                    </div>
                  </div>
                )}
                {info.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${info.email}`}
                        className="text-sm font-medium text-primary break-all"
                      >
                        {info.email}
                      </a>
                    </div>
                  </div>
                )}
                {info.website && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Website</p>
                      <a
                        href={info.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary break-all"
                      >
                        {info.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Faculty ── */}
            <TabsContent value="faculty" className="mt-0">
              <div className="grid grid-cols-1 gap-3">
                {SEED_COLLEGE_EXTRA.faculty.map((f) => (
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
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-muted-foreground bg-muted/60 rounded-md px-2 py-0.5">
                          {f.qualification}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {f.experience}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ── Placement ── */}
            <TabsContent value="placement" className="mt-0 space-y-4">
              <div className="bg-primary/8 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <p className="text-sm font-display font-semibold">
                    Placement Report {SEED_COLLEGE_EXTRA.placement.year}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-xl p-3 text-center">
                    <p className="font-display font-bold text-2xl text-primary">
                      {SEED_COLLEGE_EXTRA.placement.placementPercentage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Placed
                    </p>
                  </div>
                  <div className="bg-background rounded-xl p-3 text-center">
                    <p className="font-display font-bold text-xl text-foreground">
                      {SEED_COLLEGE_EXTRA.placement.highestPackage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Highest Package
                    </p>
                  </div>
                  <div className="bg-background rounded-xl p-3 text-center">
                    <p className="font-display font-bold text-xl text-foreground">
                      {SEED_COLLEGE_EXTRA.placement.averagePackage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Average Package
                    </p>
                  </div>
                  <div className="bg-background rounded-xl p-3 text-center">
                    <p className="font-display font-bold text-2xl text-foreground">
                      {SEED_COLLEGE_EXTRA.placement.companiesVisited}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Companies Visited
                    </p>
                  </div>
                </div>
                <div className="mt-3 bg-background rounded-xl p-3 text-center">
                  <p className="font-display font-bold text-xl text-foreground">
                    {SEED_COLLEGE_EXTRA.placement.offersExtended.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Total Offers Extended
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Top Recruiters
                </p>
                <div className="flex flex-wrap gap-2">
                  {SEED_COLLEGE_EXTRA.placement.topRecruiters.map(
                    (recruiter) => (
                      <Badge
                        key={recruiter}
                        variant="secondary"
                        className="text-xs rounded-full px-3 py-1"
                      >
                        {recruiter}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ── Facilities ── */}
            <TabsContent value="facilities" className="mt-0">
              <div className="grid grid-cols-1 gap-3">
                {SEED_COLLEGE_EXTRA.facilities.map((facility) => (
                  <div
                    key={facility.name}
                    className="flex items-start gap-3 bg-card border border-border rounded-xl p-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 text-accent-foreground">
                      {FACILITY_ICONS[facility.name] ?? (
                        <Building2 className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {facility.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {facility.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ── Achievements ── */}
            <TabsContent value="achievements" className="mt-0">
              <div className="grid grid-cols-1 gap-3">
                {SEED_COLLEGE_EXTRA.achievements.map((ach) => (
                  <div
                    key={ach.title}
                    className="flex items-start gap-3 bg-card border border-border rounded-xl p-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-display font-semibold text-foreground">
                        {ach.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ach.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ── Course Detail Sheet ───────────────────────────────────

function CourseDetailSheet({
  course,
  open,
  onClose,
}: {
  course: Course | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!course) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-w-[430px] mx-auto max-h-[88dvh] overflow-y-auto pb-8"
      >
        <SheetHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <SheetTitle className="font-display text-xl leading-tight">
                {course.name}
              </SheetTitle>
              <div className="mt-2">
                <Badge
                  variant="secondary"
                  className="text-xs font-medium rounded-full"
                >
                  <Building2 className="w-3 h-3 mr-1" />
                  {course.department}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Key stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-primary/8 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground font-medium">
                Duration
              </p>
            </div>
            <p className="font-display font-bold text-base text-foreground">
              {course.duration}
            </p>
          </div>
          <div className="bg-success/8 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="w-4 h-4 text-success" />
              <p className="text-xs text-muted-foreground font-medium">Fees</p>
            </div>
            <p className="font-display font-bold text-base text-foreground">
              {course.fees}
            </p>
          </div>
        </div>

        {/* Eligibility */}
        {course.eligibility && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-display font-semibold">Eligibility</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-xl px-4 py-3">
              {course.eligibility}
            </p>
          </div>
        )}

        {/* Description */}
        {course.description && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-display font-semibold">
                About the Program
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Course Card ───────────────────────────────────────────

const DEPT_COLORS: Record<string, string> = {
  "Computer Science": "oklch(0.52 0.13 200)",
  "Electronics & Communication": "oklch(0.55 0.17 240)",
  Physics: "oklch(0.58 0.16 280)",
  Chemistry: "oklch(0.55 0.14 160)",
  "Business Administration": "oklch(0.58 0.15 40)",
  "Mechanical Engineering": "oklch(0.56 0.12 50)",
  Mathematics: "oklch(0.55 0.14 145)",
};

function getDeptColor(dept: string): string {
  return DEPT_COLORS[dept] ?? "oklch(0.52 0.1 220)";
}

function CourseCard({
  course,
  index,
  onSelect,
}: {
  course: Course;
  index: number;
  onSelect: () => void;
}) {
  const color = getDeptColor(course.department);

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      className="w-full bg-card rounded-2xl border border-border text-left hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.99] overflow-hidden"
      onClick={onSelect}
      type="button"
    >
      {/* Colored dept strip */}
      <div className="h-1.5 w-full" style={{ background: color }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm text-foreground leading-snug line-clamp-2">
              {course.name}
            </p>
            <p className="text-xs mt-1.5 font-medium" style={{ color }}>
              {course.department}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        </div>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {course.duration}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              {course.fees}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ── Courses Tab ───────────────────────────────────────────

export function CoursesTab() {
  const { data: backendCourses, isLoading: coursesLoading } =
    useGetAllCourses();
  const { data: backendCollegeInfo, isLoading: collegeLoading } =
    useGetCollegeInfo();

  const courses =
    backendCourses && backendCourses.length > 0 ? backendCourses : SEED_COURSES;
  const collegeInfo = backendCollegeInfo ?? SEED_COLLEGE_INFO;

  const [searchTerm, setSearchTerm] = useState("");
  const [activeDept, setActiveDept] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseSheetOpen, setCourseSheetOpen] = useState(false);
  const [collegeInfoOpen, setCollegeInfoOpen] = useState(false);

  const departments = useMemo(() => {
    const depts = new Set(courses.map((c) => c.department));
    return Array.from(depts).sort();
  }, [courses]);

  const filtered = useMemo(() => {
    let results = courses;

    if (activeDept !== "all") {
      results = results.filter((c) => c.department === activeDept);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }

    return results;
  }, [courses, searchTerm, activeDept]);

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setCourseSheetOpen(true);
  };

  const handleCloseCourse = () => {
    setCourseSheetOpen(false);
    setTimeout(() => setSelectedCourse(null), 300);
  };

  const isLoading = coursesLoading && courses === SEED_COURSES;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Courses
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Explore programs and fee details
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCollegeInfoOpen(true)}
            className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            disabled={collegeLoading}
          >
            <Info className="w-3.5 h-3.5" />
            College Info
          </button>
        </div>
      </div>

      {/* Search input */}
      <div className="px-4 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search courses or departments..."
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

      {/* Department filters */}
      <div className="flex gap-2 px-4 mt-3 overflow-x-auto pb-1 scrollbar-hide">
        <button
          key="all"
          type="button"
          onClick={() => setActiveDept("all")}
          className={`
            flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all
            ${
              activeDept === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }
          `}
        >
          All
        </button>
        {departments.map((dept) => (
          <button
            key={dept}
            type="button"
            onClick={() => setActiveDept(dept)}
            className={`
              flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all whitespace-nowrap
              ${
                activeDept === dept
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }
            `}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="px-4 mt-3 mb-1">
        <p className="text-xs text-muted-foreground">
          {isLoading
            ? "Loading…"
            : `${filtered.length} course${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Courses list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <div className="space-y-3">
            {(["sk1", "sk2", "sk3", "sk4"] as const).map((sk) => (
              <Skeleton key={sk} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-display font-semibold text-foreground">
              No courses found
            </p>
            <p className="text-sm text-muted-foreground mt-1.5">
              Try a different search term or department
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {filtered.map((course, i) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={i}
                  onSelect={() => handleSelectCourse(course)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Course Detail Sheet */}
      <CourseDetailSheet
        course={selectedCourse}
        open={courseSheetOpen}
        onClose={handleCloseCourse}
      />

      {/* College Info Modal */}
      <CollegeInfoModal
        open={collegeInfoOpen}
        onClose={() => setCollegeInfoOpen(false)}
        info={collegeInfo}
      />
    </div>
  );
}
