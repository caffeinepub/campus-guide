import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Building2,
  Check,
  Copy,
  FileText,
  Hash,
  Layers,
  MapPin,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Location } from "../backend.d";
import { CategoryBadge } from "./CategoryBadge";

interface LocationDetailProps {
  location: Location | null;
  open: boolean;
  onClose: () => void;
}

// ── QR Code Generator ─────────────────────────────────────
// Loads qrcode-generator from CDN (same pattern as jsQR in useQRScanner)

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    qrcode: any;
  }
}

const QR_CDN_URL =
  "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js";

let qrLibPromise: Promise<void> | null = null;

function loadQRLib(): Promise<void> {
  if (window.qrcode) return Promise.resolve();
  if (qrLibPromise) return qrLibPromise;

  qrLibPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = QR_CDN_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load QR library"));
    document.head.appendChild(script);
  });

  return qrLibPromise;
}

function QRCodeDisplay({ locationId }: { locationId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    const payload = `location:${locationId}`;

    loadQRLib()
      .then(() => {
        if (cancelled) return;
        if (!window.qrcode || !canvasRef.current) return;

        try {
          const qr = window.qrcode(0, "M");
          qr.addData(payload);
          qr.make();

          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          const moduleCount = qr.getModuleCount();
          const size = 160;
          const moduleSize = size / moduleCount;

          canvas.width = size;
          canvas.height = size;

          // Background
          ctx.fillStyle = "#f5f8fb";
          ctx.fillRect(0, 0, size, size);

          // Modules
          ctx.fillStyle = "#0c1a2e";
          for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
              if (qr.isDark(row, col)) {
                ctx.fillRect(
                  col * moduleSize,
                  row * moduleSize,
                  moduleSize,
                  moduleSize,
                );
              }
            }
          }

          setStatus("ready");
        } catch {
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [locationId]);

  return (
    <div className="flex flex-col items-center gap-1">
      {status === "loading" && (
        <div className="w-40 h-40 bg-muted rounded-lg animate-pulse flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Generating QR…</span>
        </div>
      )}
      {status === "error" && (
        <div className="w-40 h-40 bg-muted rounded-lg flex items-center justify-center">
          <span className="text-xs text-muted-foreground text-center px-2">
            QR unavailable offline
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`rounded-lg border border-border shadow-sm ${status !== "ready" ? "hidden" : ""}`}
        style={{ width: "160px", height: "160px" }}
      />
    </div>
  );
}

export function LocationDetail({
  location,
  open,
  onClose,
}: LocationDetailProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!location) return;
    const url = `${window.location.origin}${window.location.pathname}?location=${location.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!location) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-w-[430px] mx-auto h-auto max-h-[88dvh] overflow-y-auto pb-8"
      >
        <SheetHeader className="pb-2">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <SheetTitle className="font-display text-xl leading-tight">
                {location.name}
              </SheetTitle>
              <div className="mt-1.5">
                <CategoryBadge category={location.category} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Location details */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Building</p>
              <p className="font-medium">{location.building}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Floor</p>
              <p className="font-medium">{location.floor}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Hash className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Room Number</p>
              <p className="font-medium">{location.roomNumber}</p>
            </div>
          </div>

          {location.description && (
            <div className="flex items-start gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Description</p>
                <p className="font-medium leading-relaxed">
                  {location.description}
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            Scan to share this location
          </p>
          <QRCodeDisplay locationId={location.id} />
          <p className="text-xs text-muted-foreground font-mono">
            {location.roomNumber} · {location.building}
          </p>
        </div>

        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="w-full mt-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Link Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Share Link
            </>
          )}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
