import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, ChevronRight, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Location } from "../backend.d";
import { CategoryBadge } from "../components/CategoryBadge";
import { CAMPUS_BUILDINGS } from "../data/seedLocations";

interface MapTabProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
}

export function MapTab({ locations, onSelectLocation }: MapTabProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  const buildingLocations = selectedBuilding
    ? locations.filter((l) => {
        const building = CAMPUS_BUILDINGS.find(
          (b) => b.id === selectedBuilding,
        );
        return building && l.building === building.name;
      })
    : [];

  const selectedBuildingData = CAMPUS_BUILDINGS.find(
    (b) => b.id === selectedBuilding,
  );

  const handleBuildingClick = (buildingId: string) => {
    setSelectedBuilding(buildingId === selectedBuilding ? null : buildingId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Campus Map
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Tap a building to explore rooms
        </p>
      </div>

      {/* Campus Map SVG */}
      <div className="px-4">
        <div className="campus-map-container rounded-2xl overflow-hidden border border-border shadow-md">
          <svg
            viewBox="0 0 430 430"
            className="w-full"
            style={{ aspectRatio: "1 / 1" }}
            role="img"
            aria-label="Campus map showing buildings"
          >
            <title>Campus Map</title>
            {/* Background grid paths */}
            <defs>
              <filter
                id="building-shadow"
                x="-10%"
                y="-10%"
                width="120%"
                height="130%"
              >
                <feDropShadow
                  dx="2"
                  dy="4"
                  stdDeviation="3"
                  floodOpacity="0.18"
                />
              </filter>
            </defs>

            {/* Campus path / walkways */}
            <rect
              x="30"
              y="30"
              width="370"
              height="370"
              rx="12"
              fill="oklch(0.84 0.03 215 / 0.5)"
            />

            {/* Pathways */}
            <rect
              x="180"
              y="30"
              width="14"
              height="380"
              fill="oklch(0.92 0.02 215 / 0.7)"
            />
            <rect
              x="30"
              y="175"
              width="370"
              height="12"
              fill="oklch(0.92 0.02 215 / 0.7)"
            />
            <rect
              x="30"
              y="305"
              width="370"
              height="12"
              fill="oklch(0.92 0.02 215 / 0.7)"
            />

            {/* Green areas */}
            <rect
              x="195"
              y="40"
              width="64"
              height="80"
              rx="8"
              fill="oklch(0.62 0.1 145 / 0.4)"
            />
            <text
              x="227"
              y="86"
              textAnchor="middle"
              fill="oklch(0.4 0.1 145)"
              fontSize="9"
              fontFamily="Outfit, sans-serif"
              fontWeight="500"
            >
              QUAD
            </text>
            <rect
              x="195"
              y="320"
              width="80"
              height="60"
              rx="8"
              fill="oklch(0.62 0.1 145 / 0.4)"
            />
            <text
              x="235"
              y="355"
              textAnchor="middle"
              fill="oklch(0.4 0.1 145)"
              fontSize="9"
              fontFamily="Outfit, sans-serif"
              fontWeight="500"
            >
              PARK
            </text>

            {/* Buildings */}
            {CAMPUS_BUILDINGS.map((building) => (
              <g
                key={building.id}
                className="building-block"
                aria-label={`View rooms in ${building.name}`}
                onClick={() => handleBuildingClick(building.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleBuildingClick(building.id);
                }}
              >
                {/* Shadow */}
                <rect
                  x={building.x + 3}
                  y={building.y + 5}
                  width={building.width}
                  height={building.height}
                  rx="8"
                  fill="oklch(0.15 0.03 240 / 0.2)"
                />
                {/* Main block */}
                <rect
                  x={building.x}
                  y={building.y}
                  width={building.width}
                  height={building.height}
                  rx="8"
                  fill={building.color}
                  stroke={
                    selectedBuilding === building.id
                      ? "oklch(0.98 0.01 0)"
                      : "none"
                  }
                  strokeWidth="3"
                  opacity={
                    selectedBuilding && selectedBuilding !== building.id
                      ? 0.55
                      : 1
                  }
                />
                {/* Highlight top edge */}
                <rect
                  x={building.x}
                  y={building.y}
                  width={building.width}
                  height={4}
                  rx="8"
                  fill="oklch(1 0 0 / 0.2)"
                />
                {/* Short name */}
                <text
                  x={building.x + building.width / 2}
                  y={building.y + building.height / 2 - 7}
                  textAnchor="middle"
                  fill={building.labelColor}
                  fontSize="16"
                  fontFamily="Cabinet Grotesk, system-ui"
                  fontWeight="700"
                >
                  {building.shortName}
                </text>
                {/* Full name (truncated) */}
                <text
                  x={building.x + building.width / 2}
                  y={building.y + building.height / 2 + 10}
                  textAnchor="middle"
                  fill={building.labelColor}
                  fontSize="8"
                  fontFamily="Outfit, sans-serif"
                  fontWeight="500"
                  opacity="0.85"
                >
                  {building.name.length > 18
                    ? `${building.name.slice(0, 16)}…`
                    : building.name}
                </text>
                {/* Room count badge */}
                {(() => {
                  const count = locations.filter(
                    (l) => l.building === building.name,
                  ).length;
                  if (count === 0) return null;
                  return (
                    <g>
                      <circle
                        cx={building.x + building.width - 10}
                        cy={building.y + 10}
                        r="11"
                        fill="oklch(1 0 0 / 0.95)"
                      />
                      <text
                        x={building.x + building.width - 10}
                        y={building.y + 14}
                        textAnchor="middle"
                        fill={building.color}
                        fontSize="9"
                        fontFamily="Outfit, sans-serif"
                        fontWeight="700"
                      >
                        {count}
                      </text>
                    </g>
                  );
                })()}
              </g>
            ))}

            {/* Compass */}
            <g>
              <circle cx="395" cy="50" r="14" fill="oklch(0.98 0.01 0 / 0.9)" />
              <text
                x="395"
                y="46"
                textAnchor="middle"
                fill="oklch(0.4 0.14 200)"
                fontSize="10"
                fontFamily="Outfit"
                fontWeight="700"
              >
                N
              </text>
              <text
                x="395"
                y="58"
                textAnchor="middle"
                fill="oklch(0.5 0.04 220)"
                fontSize="7"
                fontFamily="Outfit"
              >
                ↑
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Building detail panel */}
      {selectedBuilding && selectedBuildingData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 mx-4 mt-4"
        >
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ background: selectedBuildingData.color }}
            >
              <div className="flex items-center gap-2">
                <Building2
                  className="w-4 h-4"
                  style={{ color: selectedBuildingData.labelColor }}
                />
                <span
                  className="font-display font-bold text-sm"
                  style={{ color: selectedBuildingData.labelColor }}
                >
                  {selectedBuildingData.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 hover:bg-white/20"
                onClick={() => setSelectedBuilding(null)}
                style={{ color: selectedBuildingData.labelColor }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {buildingLocations.length === 0 ? (
              <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                No rooms listed for this building yet
              </div>
            ) : (
              <ScrollArea className="max-h-52">
                <div className="divide-y divide-border">
                  {buildingLocations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => onSelectLocation(loc)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {loc.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {loc.floor} · {loc.roomNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <CategoryBadge category={loc.category} size="sm" />
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </motion.div>
      )}

      {!selectedBuilding && (
        <div className="px-4 mt-4 mb-2">
          <p className="text-xs text-muted-foreground text-center">
            {locations.length} locations across {CAMPUS_BUILDINGS.length}{" "}
            buildings
          </p>
        </div>
      )}
    </div>
  );
}
