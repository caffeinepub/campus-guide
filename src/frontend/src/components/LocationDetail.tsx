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
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Location } from "../backend.d";
import { CategoryBadge } from "./CategoryBadge";

interface LocationDetailProps {
  location: Location | null;
  open: boolean;
  onClose: () => void;
}

function QRCodeDisplay({ locationId }: { locationId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const payload = `location:${locationId}`;
    QRCode.toDataURL(payload, {
      width: 160,
      margin: 2,
      color: {
        dark: "#0c1a2e",
        light: "#f5f8fb",
      },
    })
      .then(setDataUrl)
      .catch(console.error);
  }, [locationId]);

  if (!dataUrl) {
    return (
      <div className="w-40 h-40 bg-muted rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-xs text-muted-foreground">Generating QR…</span>
      </div>
    );
  }

  return (
    <img
      ref={canvasRef as never}
      src={dataUrl}
      alt="Location QR Code"
      className="w-40 h-40 rounded-lg border border-border shadow-sm"
    />
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
