"use client";

import { useState, useCallback } from "react";
import { processImageAndGenerateCaptions } from "./actions";
import Navbar from "../Navbar";
import Footer from "../Footer";
import MemeComposer from "./MemeComposer";
import ProcessingImage from "./ProcessingImage";

type Step = "upload" | "processing" | "captions" | "meme";

const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif"

];

const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic",".heif"];

const ACCEPT_STRING = SUPPORTED_TYPES.join(",");

const getFileExtension = (filename: string): string => {
  return filename.toLowerCase().slice(filename.lastIndexOf("."));
};

const isValidImageFile = (file: File): boolean => {
  // Check MIME type first
  if (SUPPORTED_TYPES.includes(file.type)) {
    return true;
  }
  // Fallback to extension check for HEIC/HEIF (browsers often don't detect MIME type correctly)
  if (!file.type || file.type === "application/octet-stream") {
    const ext = getFileExtension(file.name);
    return SUPPORTED_EXTENSIONS.includes(ext);
  }
  return false;
};

const isHeicFile = (file: File): boolean => {
  if (file.type === "image/heic" || file.type === "image/heif") {
    return true;
  }
  const ext = getFileExtension(file.name);
  return ext === ".heic" || ext === ".heif";
};

export default function MemefierPage() {
  const [step, setStep] = useState<Step>("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  const validateAndSetFile = useCallback(async (file: File) => {
    if (!isValidImageFile(file)) {
      setError("Unsupported image type. Please use JPEG, PNG, WebP, GIF, or HEIC.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    setError(null);

    let fileToProcess = file;

    // Convert HEIC to JPEG for display (browsers can't render HEIC natively)
    if (isHeicFile(file)) {
      try {
        const heic2any = (await import("heic2any")).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.9,
        });
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        fileToProcess = new File([blob], file.name.replace(/\.heic$/i, ".jpg"), {
          type: "image/jpeg",
        });
      } catch {
        setError("Failed to convert HEIC image. Please try a different file.");
        return;
      }
    }

    setImageFile(fileToProcess);

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(fileToProcess);
  }, []);

  const handleImageSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) validateAndSetFile(file);
    },
    [validateAndSetFile]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (file) validateAndSetFile(file);
    },
    [validateAndSetFile]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    []
  );

  const processImage = async () => {
    if (!selectedImage || !imageFile) {
      setError("Please select an image first");
      return;
    }

    setStep("processing");
    setError(null);
    setProcessingStatus("Processing image...");

    try {
      const result = await processImageAndGenerateCaptions(
        selectedImage,
        imageFile.type
      );

      if (!result.success || !result.captions) {
        throw new Error(result.error || "Failed to generate captions");
      }

      setCaptions(result.captions);
      setStep("captions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStep("upload");
    }
  };

  const reset = () => {
    setStep("upload");
    setSelectedImage(null);
    setImageFile(null);
    setCaptions([]);
    setSelectedCaption(null);
    setError(null);
    setProcessingStatus("");
  };

  const chooseCaption = (caption: string) => {
    setSelectedCaption(caption);
    setStep("meme");
  };

  const backToCaptions = () => {
    setSelectedCaption(null);
    setStep("captions");
  };

  return (
    <div className="min-h-screen bg-[var(--secondary-purple)] font-sans text-white flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:px-6 flex-1">
        <div className={`mx-auto ${step === "meme" || step === "captions" ? "max-w-4xl" : "max-w-2xl"}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight md:text-4xl drop-shadow-lg">
              <span className="text-[var(--primary-orange)] drop-shadow-md">
                The Memefier
              </span>
            </h1>
            <p className="text-purple-200">
              Upload an image and let AI turn it into a Meme
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center">
              {error}
            </div>
          )}

          {/* Upload Step */}
          {step === "upload" && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-purple-400/50 rounded-xl p-6 hover:border-[var(--primary-orange)] transition-all cursor-pointer bg-white/5 hover:bg-white/10"
            >
              <input
                type="file"
                accept={ACCEPT_STRING}
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />

              {selectedImage ? (
                <div className="space-y-4">
                  {/* Image preview with overlay button */}
                  <label htmlFor="image-upload" className="cursor-pointer block relative group">
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="max-h-72 mx-auto rounded-lg shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <span className="text-white font-medium flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Change image
                      </span>
                    </div>
                  </label>

                  {/* Generate button - compact and stylish */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={processImage}
                      className="px-8 py-3 bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Captions
                    </button>
                  </div>
                </div>
              ) : (
                <label htmlFor="image-upload" className="cursor-pointer block py-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/40 to-[var(--primary-orange)]/40 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-white">
                        Drop your image here
                      </p>
                      <p className="text-purple-200 text-sm mt-1">
                        or click to browse
                      </p>
                      <p className="text-purple-300/60 text-xs mt-2">
                        JPEG, PNG, WebP, GIF, HEIC • Max 10MB
                      </p>
                    </div>
                  </div>
                </label>
              )}
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <ProcessingImage
              status={processingStatus}
              previewImage={selectedImage}
              onCancel={reset}
            />
          )}

          {/* Captions Step */}
          {step === "captions" && (
            <div className="space-y-6">
              {/* Side by side layout on desktop */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Image */}
                {selectedImage && (
                  <div className="lg:w-2/5 flex-shrink-0">
                    <div className="sticky top-4">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="w-full rounded-xl shadow-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Right: Captions */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-xl font-bold">
                    Choose a Caption
                  </h3>
                  <div className="space-y-3">
                    {captions.map((caption, index) => (
                      <button
                        key={index}
                        onClick={() => chooseCaption(caption)}
                        className="w-full p-4 bg-gradient-to-r from-[var(--primary-orange)]/10 to-white/5 rounded-xl text-left hover:from-[var(--primary-orange)]/20 hover:to-white/10 hover:border-[var(--primary-orange)] border-2 border-[var(--primary-orange)]/20 transition-all group cursor-pointer"
                      >
                        <p className="text-white text-lg font-semibold group-hover:text-white/90">{caption}</p>
                      </button>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={processImage}
                      className="flex-1 py-3 px-4 bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Regenerate
                    </button>
                    <button
                      onClick={reset}
                      className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
                    >
                      New Image
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meme Step */}
          {step === "meme" && selectedCaption && selectedImage && (
            <MemeComposer
              image={selectedImage}
              caption={selectedCaption}
              onBack={backToCaptions}
              onReset={reset}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
