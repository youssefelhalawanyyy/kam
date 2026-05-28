"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Scan, Search, Loader2, AlertCircle, Flashlight } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "found" | "error">("idle");
  const [error, setError] = useState("");
  const [scanned, setScanned] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<unknown>(null);

  async function startScanner() {
    setStatus("scanning");
    setError("");
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const result = await (reader as unknown as { decodeFromVideoDevice: (d: null, v: HTMLVideoElement, cb: (r: { getText: () => string } | null, e: unknown) => void) => Promise<unknown> }).decodeFromVideoDevice(
        null,
        videoRef.current!,
        (result, err) => {
          if (result) {
            const code = result.getText();
            setScanned(code);
            setStatus("found");
            stopScanner();
          }
          void err;
        }
      );
      void result;
    } catch (e) {
      setStatus("error");
      setError(
        (e as Error).message?.includes("NotAllowed")
          ? "Camera permission denied. Please allow camera access."
          : "Could not start camera. Try using a different browser."
      );
    }
  }

  function stopScanner() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (readerRef.current) {
      try {
        (readerRef.current as { reset: () => void }).reset();
      } catch { /* ignore */ }
    }
  }

  useEffect(() => () => stopScanner(), []);

  async function toggleTorch() {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as MediaTrackConstraintSet] });
      setTorchOn((v) => !v);
    } catch { /* torch not supported */ }
  }

  function searchBarcode(code: string) {
    router.push(`/search?q=${encodeURIComponent(code)}`);
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Scan className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Barcode Scanner</h1>
          <p className="text-slate-400 text-sm mt-1">Point at any product barcode to compare prices</p>
        </div>

        {/* Camera view */}
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-square mb-4 border border-slate-700">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${status === "scanning" ? "block" : "hidden"}`}
            muted
            playsInline
          />

          {status !== "scanning" && (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
              <Camera className="w-16 h-16 text-slate-600" />
              <span className="text-slate-500 text-sm">Camera preview</span>
            </div>
          )}

          {/* Scanning overlay */}
          {status === "scanning" && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner brackets */}
              <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
              {/* Scan line */}
              <motion.div
                className="absolute left-10 right-10 h-0.5 bg-emerald-400/80"
                animate={{ top: ["20%", "80%", "20%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          )}

          {/* Torch button */}
          {status === "scanning" && (
            <button
              onClick={toggleTorch}
              className={`absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                torchOn ? "bg-yellow-400 text-black" : "bg-black/50 text-white"
              }`}
            >
              <Flashlight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Result */}
        <AnimatePresence>
          {status === "found" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-4"
            >
              <p className="text-emerald-400 text-xs font-semibold mb-1">BARCODE DETECTED</p>
              <p className="text-white font-mono text-lg mb-3">{scanned}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => searchBarcode(scanned)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  <Search className="w-4 h-4" />
                  Search Prices
                </button>
                <button
                  onClick={() => { setStatus("idle"); setScanned(""); }}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="space-y-3">
          {status !== "scanning" ? (
            <button
              onClick={startScanner}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:scale-[1.02] text-white font-semibold rounded-2xl transition-all"
            >
              <Camera className="w-5 h-5" />
              {status === "found" ? "Scan Another" : "Start Scanning"}
            </button>
          ) : (
            <button
              onClick={() => { stopScanner(); setStatus("idle"); }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-2xl transition-all"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              Scanning… (tap to stop)
            </button>
          )}

          <button
            onClick={() => router.push("/search")}
            className="w-full px-6 py-3 text-slate-400 hover:text-white text-sm font-medium transition-all text-center"
          >
            Search manually instead →
          </button>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-slate-800/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-semibold mb-2">TIPS</p>
          <ul className="text-slate-500 text-xs space-y-1">
            <li>• Hold the barcode steady, 15–25 cm away</li>
            <li>• Make sure there&apos;s enough light</li>
            <li>• Works with EAN-13, QR codes, and more</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
