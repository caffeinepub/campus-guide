import { Toaster } from "@/components/ui/sonner";
import {
  Building2,
  GraduationCap,
  LogIn,
  Map as MapIcon,
  ScanLine,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Location } from "./backend.d";
import { AIChatBot } from "./components/AIChatBot";
import { LocationDetail } from "./components/LocationDetail";
import { SEED_LOCATIONS } from "./data/seedLocations";
import { useGetAllLocations, useGetLocation } from "./hooks/useQueries";
import { CollegesTab } from "./pages/CollegesTab";
import { CoursesTab } from "./pages/CoursesTab";
import { MapTab } from "./pages/MapTab";
import { ScanTab } from "./pages/ScanTab";
import { SearchTab } from "./pages/SearchTab";
import { SignInTab } from "./pages/SignInTab";
import { getUrlParameter } from "./utils/urlParams";

type Tab = "map" | "search" | "scan" | "courses" | "colleges" | "signin";

const TABS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
}[] = [
  { id: "map", label: "Map", icon: MapIcon },
  { id: "search", label: "Search", icon: Search },
  { id: "scan", label: "Scan", icon: ScanLine },
  { id: "courses", label: "Courses", icon: GraduationCap },
  { id: "colleges", label: "Colleges", icon: Building2 },
  { id: "signin", label: "Sign In", icon: LogIn },
];

function useDeepLinkLocation(onFound: (loc: Location) => void) {
  const locationId = getUrlParameter("location");
  const { data: location } = useGetLocation(locationId);

  useEffect(() => {
    if (location) {
      onFound(location);
    }
  }, [location, onFound]);
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: backendLocations, isLoading } = useGetAllLocations();

  // Use seed data until backend loads
  const locations =
    backendLocations && backendLocations.length > 0
      ? backendLocations
      : SEED_LOCATIONS;

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
    setSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setTimeout(() => setSelectedLocation(null), 300);
  };

  // Deep link handler
  useDeepLinkLocation(handleSelectLocation);

  return (
    <div className="app-shell">
      {/* Tab content */}
      <main className="tab-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="h-full"
          >
            {activeTab === "map" && (
              <MapTab
                locations={locations}
                onSelectLocation={handleSelectLocation}
              />
            )}
            {activeTab === "search" && (
              <SearchTab
                locations={locations}
                isLoading={isLoading && locations === SEED_LOCATIONS}
                onSelectLocation={handleSelectLocation}
              />
            )}
            {activeTab === "scan" && (
              <ScanTab
                onLocationFound={handleSelectLocation}
                isActive={activeTab === "scan"}
              />
            )}
            {activeTab === "courses" && <CoursesTab />}
            {activeTab === "colleges" && <CollegesTab />}
            {activeTab === "signin" && (
              <SignInTab
                onNavigateToColleges={() => setActiveTab("colleges")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="flex items-stretch h-16">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className="flex-1 flex flex-col items-center justify-center gap-1 transition-all relative"
                onClick={() => setActiveTab(tab.id)}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: "oklch(var(--nav-active))" }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon
                  className="w-5 h-5 transition-colors"
                  style={{
                    color: isActive
                      ? "oklch(var(--nav-active))"
                      : "oklch(var(--nav-inactive))",
                  }}
                />
                <span
                  className="text-[9px] font-medium transition-colors"
                  style={{
                    color: isActive
                      ? "oklch(var(--nav-active))"
                      : "oklch(var(--nav-inactive))",
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Location Detail Sheet */}
      <LocationDetail
        location={selectedLocation}
        open={sheetOpen}
        onClose={handleCloseSheet}
      />

      {/* AI Chat Bot - floats above bottom nav */}
      <AIChatBot />

      <Toaster position="top-center" />
    </div>
  );
}
