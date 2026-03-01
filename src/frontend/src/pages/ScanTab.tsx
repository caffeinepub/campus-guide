import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Camera,
  ImageUp,
  RotateCcw,
  X,
  ZapOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Location } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useQRScanner } from "../qr-code/useQRScanner";

interface ScanTabProps {
  onLocationFound: (location: Location) => void;
  isActive: boolean;
}

export function ScanTab({ onLocationFound, isActive }: ScanTabProps) {
  const { actor } = useActor();
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scanner = useQRScanner({
    facingMode: "environment",
    scanInterval: 150,
    maxResults: 1,
  });

  // Detect mobile
  useEffect(() => {
    setIsMobile(
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ),
    );
  }, []);

  // Stop scanning when tab is not active
  useEffect(() => {
    if (!isActive && scanner.isActive) {
      scanner.stopScanning();
    }
  }, [isActive, scanner.isActive, scanner.stopScanning]);

  // Process scan results
  const processResult = useCallback(
    async (data: string) => {
      if (!actor) return;

      // Parse location:<id> format
      const match = data.match(/^location:(.+)$/);
      if (!match) {
        setScanError("Invalid QR code. Please scan a Campus Guide QR code.");
        scanner.clearResults();
        return;
      }

      const locationId = match[1];
      try {
        const location = await actor.getLocation(locationId);
        if (location) {
          setScanSuccess(true);
          scanner.stopScanning();
          setTimeout(() => {
            setScanSuccess(false);
            onLocationFound(location);
            scanner.clearResults();
          }, 600);
        } else {
          setScanError("Location not found. The QR code may be outdated.");
          scanner.clearResults();
        }
      } catch {
        setScanError("Failed to look up location. Please try again.");
        scanner.clearResults();
      }
    },
    [actor, scanner, onLocationFound],
  );

  // Watch for new scan results
  useEffect(() => {
    if (scanner.qrResults.length > 0) {
      const latest = scanner.qrResults[0];
      processResult(latest.data);
    }
  }, [scanner.qrResults, processResult]);

  const handleRetry = () => {
    setScanError(null);
    scanner.clearResults();
    scanner.retry();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError(null);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      // Use jsQR from window (loaded by useQRScanner)
      if (window.jsQR) {
        const result = window.jsQR(
          imageData.data,
          imageData.width,
          imageData.height,
        );
        if (result?.data) {
          processResult(result.data);
        } else {
          setScanError("No QR code found in the uploaded image.");
        }
      } else {
        setScanError(
          "QR decoder is still loading. Please wait a moment and try again.",
        );
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setScanError("Could not read the selected image file.");
    };
    img.src = url;
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Scan QR Code
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Point camera at a location QR code
        </p>
      </div>

      {/* Camera area */}
      <div className="px-4">
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-square w-full max-w-[340px] mx-auto border border-border shadow-lg">
          {/* Video */}
          <video
            ref={scanner.videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          {/* Hidden canvas for processing */}
          <canvas ref={scanner.canvasRef} className="hidden" />

          {/* Not scanning overlay */}
          <AnimatePresence>
            {!scanner.isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white"
              >
                <Camera className="w-12 h-12 mb-3 opacity-60" />
                <p className="text-sm font-medium opacity-80">
                  Camera inactive
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan frame overlay (only when active) */}
          {scanner.isActive && !scanSuccess && (
            <div className="scan-overlay">
              <div className="absolute inset-[20%]">
                <div className="relative w-full h-full">
                  <div className="scan-corner scan-corner-tl" />
                  <div className="scan-corner scan-corner-tr" />
                  <div className="scan-corner scan-corner-bl" />
                  <div className="scan-corner scan-corner-br" />
                  <div className="scan-line" />
                </div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white/70 text-xs font-medium bg-black/40 inline-block px-3 py-1 rounded-full">
                  Align QR code inside frame
                </p>
              </div>
            </div>
          )}

          {/* Success overlay */}
          <AnimatePresence>
            {scanSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-primary/90"
              >
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <span className="text-3xl text-white">✓</span>
                </div>
                <p className="text-white font-display font-bold text-lg">
                  Found!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading state */}
          {scanner.isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      <AnimatePresence>
        {(scanError || scanner.error) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-4 mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                {scanError || scanner.error?.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setScanError(null)}
              className="text-destructive/60 hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="px-4 mt-5 space-y-3">
        {!scanner.isActive ? (
          <Button
            className="w-full h-12 rounded-xl font-display font-semibold text-base"
            onClick={() => {
              setScanError(null);
              scanner.startScanning();
            }}
            disabled={scanner.isLoading || scanner.isSupported === false}
          >
            {scanner.isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Starting camera…
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </>
            )}
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={() => scanner.stopScanning()}
            >
              <X className="w-4 h-4 mr-2" />
              Stop
            </Button>
            {isMobile && (
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={() => scanner.switchCamera()}
                disabled={scanner.isLoading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Flip
              </Button>
            )}
          </div>
        )}

        {scanner.isSupported === false && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <ZapOff className="w-4 h-4" />
            Camera not supported on this device
          </div>
        )}

        {scanner.error && (
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={handleRetry}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry camera
          </Button>
        )}

        {/* Upload Photo button — always visible */}
        <div className="pt-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl text-sm font-medium"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <ImageUp className="w-4 h-4 mr-2" />
            Upload Photo to Scan
          </Button>
        </div>
      </div>

      {/* Hint */}
      <div className="px-6 mt-4 mb-4 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Point your camera at a Campus Guide QR code, or upload a photo
          containing a QR code to navigate to any location.
        </p>
      </div>
    </div>
  );
}
