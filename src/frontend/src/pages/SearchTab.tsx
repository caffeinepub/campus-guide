import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Hash, Layers, MapPin, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Location } from "../backend.d";
import { Category } from "../backend.d";
import { CategoryBadge } from "../components/CategoryBadge";

interface SearchTabProps {
  locations: Location[];
  isLoading: boolean;
  onSelectLocation: (location: Location) => void;
}

const CATEGORIES: { label: string; value: Category | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Department", value: Category.department },
  { label: "Classroom", value: Category.classroom },
  { label: "Lab", value: Category.lab },
  { label: "Office", value: Category.office },
  { label: "Other", value: Category.other },
];

export function SearchTab({
  locations,
  isLoading,
  onSelectLocation,
}: SearchTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  const filtered = useMemo(() => {
    let results = locations;

    if (activeCategory !== "all") {
      results = results.filter((l) => l.category === activeCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      results = results.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.building.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.roomNumber.toLowerCase().includes(q) ||
          l.floor.toLowerCase().includes(q),
      );
    }

    return results;
  }, [locations, searchTerm, activeCategory]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Find a Place
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Search departments, classrooms, and labs
        </p>
      </div>

      {/* Search input */}
      <div className="px-4 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search by name, building, or room..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-card border-border h-11 rounded-xl text-sm"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 px-4 mt-3 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setActiveCategory(cat.value)}
            className={`
              flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all
              ${
                activeCategory === cat.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="px-4 mt-3 mb-1">
        <p className="text-xs text-muted-foreground">
          {isLoading
            ? "Loading…"
            : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <div className="space-y-3">
            {(["sk1", "sk2", "sk3", "sk4", "sk5"] as const).map((sk) => (
              <Skeleton key={sk} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-display font-semibold text-foreground">
              No locations found
            </p>
            <p className="text-sm text-muted-foreground mt-1.5">
              Try a different search term or category
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2.5">
              {filtered.map((loc, i) => (
                <motion.button
                  key={loc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15, delay: i * 0.03 }}
                  className="w-full bg-card rounded-xl border border-border p-4 text-left hover:border-primary/40 hover:shadow-sm transition-all active:scale-[0.99]"
                  onClick={() => onSelectLocation(loc)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm text-foreground truncate">
                        {loc.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          {loc.building}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Layers className="w-3 h-3" />
                          {loc.floor}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Hash className="w-3 h-3" />
                          {loc.roomNumber}
                        </span>
                      </div>
                    </div>
                    <CategoryBadge category={loc.category} size="sm" />
                  </div>
                </motion.button>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
