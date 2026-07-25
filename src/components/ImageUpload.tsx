import React, { useState, useRef, useEffect } from "react";
import { Upload, X, FileText, Camera, CameraOff, SwitchCamera, ZapOff } from "lucide-react";
import { api } from "../context/AuthContext";

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  defaultUrl?: string;
  label?: string;
  placeholder?: string;
  accept?: string;
}

type TabMode = "file" | "camera";

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  defaultUrl = "",
  label = "Upload Image",
  placeholder = "Drag and drop your file here, or click to browse",
  accept = "image/*,application/pdf",
}) => {
  const [preview, setPreview] = useState<string>(defaultUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabMode>("file");

  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  // Use a ref for facing mode so async camera callbacks always read the latest value
  const facingModeRef = useRef<"user" | "environment">("environment");
  const [facingModeState, setFacingModeState] = useState<"user" | "environment">("environment");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // ── Attach stream to video element whenever cameraActive becomes true ────────
  // This runs AFTER React renders the <video> element into the DOM.
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // ── Upload helper ─────────────────────────────────────────────────────────────
  const handleFileChange = async (file: File) => {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }
    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fileUrl = response.data.url;
      setPreview(fileUrl);
      onUploadSuccess(fileUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // ── File / drag-drop helpers ──────────────────────────────────────────────────
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
  };
  const triggerFileInput = () => fileInputRef.current?.click();
  const clearUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview("");
    onUploadSuccess("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Camera: stop stream ───────────────────────────────────────────────────────
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    // Detach from video element if present
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // ── Camera: start stream ──────────────────────────────────────────────────────
  // Always reads facing mode from ref (no stale closure risk)
  const startCamera = async (facing?: "user" | "environment") => {
    const mode = facing ?? facingModeRef.current;
    setCameraError(null);

    // Stop any previous stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraActive(false);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      // Setting cameraActive triggers the useEffect that attaches srcObject
      // AFTER the <video> element is in the DOM
      setCameraActive(true);
    } catch (err: any) {
      const name = (err as DOMException).name;
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setCameraError("No camera found on this device.");
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setCameraError("Camera is already in use by another app. Please close it and try again.");
      } else {
        setCameraError("Unable to access camera: " + (err.message || err.name));
      }
    }
  };

  // ── Camera: flip front/back ───────────────────────────────────────────────────
  const flipCamera = () => {
    const next = facingModeRef.current === "environment" ? "user" : "environment";
    facingModeRef.current = next;
    setFacingModeState(next);
    startCamera(next);
  };

  // ── Camera: capture snapshot ──────────────────────────────────────────────────
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    setCapturing(true);
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setCapturing(false); return; }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) { setCapturing(false); return; }
        const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: "image/jpeg" });
        // Stop camera first, then switch tab, then upload
        stopStream();
        setActiveTab("file");
        await handleFileChange(file);
        setCapturing(false);
      },
      "image/jpeg",
      0.92
    );
  };

  // ── Tab switch ────────────────────────────────────────────────────────────────
  const switchTab = (tab: TabMode) => {
    if (tab !== "camera") stopStream();
    setActiveTab(tab);
    setCameraError(null);
  };

  const isPdf = preview.toLowerCase().endsWith(".pdf");

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      {/* ── Tab switcher (hidden once image is uploaded) ──────────── */}
      {!preview && (
        <div className="flex gap-1 mb-2">
          <button
            type="button"
            onClick={() => switchTab("file")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
              activeTab === "file"
                ? "bg-red-700 text-white border-red-700"
                : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-red-400"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            File / Gallery
          </button>

          <button
            type="button"
            onClick={() => switchTab("camera")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
              activeTab === "camera"
                ? "bg-red-700 text-white border-red-700"
                : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-red-400"
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            Camera
          </button>
        </div>
      )}

      {/* Hidden canvas used for snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Uploaded preview ─────────────────────────────────────── */}
      {preview ? (
        <div className="relative w-full flex flex-col items-center border-2 border-dashed border-emerald-400 bg-emerald-50/20 dark:bg-emerald-900/10 rounded-lg p-4">
          {isPdf ? (
            <div className="flex flex-col items-center p-4">
              <FileText className="h-16 w-16 text-red-500 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                PDF Document Uploaded
              </span>
            </div>
          ) : (
            <img
              src={
                preview.startsWith("http") || preview.startsWith("/uploads")
                  ? preview
                  : `/uploads/${preview}`
              }
              alt="Upload preview"
              className="max-h-48 object-contain rounded-md shadow-sm border border-gray-100 dark:border-gray-700"
              referrerPolicy="no-referrer"
            />
          )}
          <button
            type="button"
            onClick={clearUpload}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition shadow-md"
            title="Remove"
          >
            <X className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-400 mt-2 truncate max-w-xs">{preview}</span>
        </div>

      ) : activeTab === "file" ? (
        /* ── File / Gallery tab ────────────────────────────────── */
        <div
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={triggerFileInput}
          className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-red-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-lg p-4 cursor-pointer transition-colors"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            accept={accept}
            className="hidden"
          />
          <div className="flex flex-col items-center py-4 text-center">
            {uploading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
                <p className="text-sm text-gray-500 font-medium">Uploading file...</p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{placeholder}</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG or PDF up to 5MB</p>
              </>
            )}
          </div>
        </div>

      ) : (
        /* ── Camera tab ────────────────────────────────────────── */
        <div className="relative border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-gray-950 min-h-[220px] flex flex-col items-center justify-center">

          {cameraError ? (
            /* Permission / error state */
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <CameraOff className="h-10 w-10 text-gray-500" />
              <p className="text-sm text-red-400 font-semibold max-w-[260px]">{cameraError}</p>
              <button
                type="button"
                onClick={() => startCamera()}
                className="px-4 py-1.5 bg-red-700 text-white text-xs font-bold rounded-lg hover:bg-red-800 transition cursor-pointer"
              >
                Try Again
              </button>
            </div>

          ) : !cameraActive ? (
            /* Open camera prompt */
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <Camera className="h-10 w-10 text-gray-500" />
              <p className="text-sm text-gray-400 font-medium">Tap below to open your camera</p>
              <button
                type="button"
                onClick={() => startCamera()}
                className="flex items-center gap-2 px-5 py-2 bg-red-700 text-white text-sm font-bold rounded-lg hover:bg-red-800 transition shadow-md cursor-pointer"
              >
                <Camera className="h-4 w-4" />
                Open Camera
              </button>
            </div>

          ) : (
            /* Live camera preview */
            <div className="relative w-full">
              {/* Video is always rendered when cameraActive so useEffect can attach srcObject */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-72 object-cover block"
              />

              {/* Overlay controls */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 flex items-center justify-between">

                {/* Flip camera */}
                <button
                  type="button"
                  onClick={flipCamera}
                  title={facingModeState === "environment" ? "Switch to front camera" : "Switch to rear camera"}
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition cursor-pointer"
                >
                  <SwitchCamera className="h-5 w-5" />
                </button>

                {/* Shutter / capture */}
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={capturing || uploading}
                  title="Capture Photo"
                  className="h-16 w-16 rounded-full bg-white border-4 border-red-600 shadow-xl hover:bg-red-50 transition cursor-pointer disabled:opacity-50 flex items-center justify-center"
                >
                  {capturing || uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-red-600" />
                  )}
                </button>

                {/* Stop camera */}
                <button
                  type="button"
                  onClick={stopStream}
                  title="Close Camera"
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition cursor-pointer"
                >
                  <ZapOff className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1.5 font-medium">{error}</p>
      )}
    </div>
  );
};
