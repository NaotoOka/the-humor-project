"use client";

import { useState, useCallback } from "react";
import { processImageAndGenerateCaptions } from "./actions";
import Navbar from "../Navbar";
import Footer from "../Footer";

type Step = "upload" | "processing" | "captions";

const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];

const ACCEPT_STRING = SUPPORTED_TYPES.join(",");

export default function MemefierPage() {
  const [step, setStep] = useState<Step>("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  const validateAndSetFile = useCallback((file: File) => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError("Unsupported image type. Please use JPEG, PNG, WebP, GIF, or HEIC.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    setError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
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
    setError(null);
    setProcessingStatus("");
  };

  const copyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption);
  };

  return (
    <div className="min-h-screen bg-[var(--secondary-purple)] font-sans text-white flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:px-6 flex-1">
        <div className="max-w-2xl mx-auto">
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
            <div className="space-y-6">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-purple-400/50 rounded-xl p-8 text-center hover:border-[var(--primary-orange)] transition-colors cursor-pointer bg-white/5"
              >
                <input
                  type="file"
                  accept={ACCEPT_STRING}
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {selectedImage ? (
                    <div className="space-y-4">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="max-h-64 mx-auto rounded-lg shadow-lg"
                      />
                      <p className="text-purple-200 text-sm">
                        Click or drag to change image
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/30 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-purple-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-medium">
                          Drop your image here
                        </p>
                        <p className="text-purple-200 text-sm">
                          or click to browse (max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <button
                onClick={processImage}
                disabled={!selectedImage}
                className="w-full py-4 px-6 bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-lg shadow-lg"
              >
                Generate Captions
              </button>
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="text-center space-y-6 py-12">
              <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/30 flex items-center justify-center animate-pulse">
                <svg
                  className="w-10 h-10 text-[var(--primary-orange)] animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xl font-medium">{processingStatus}</p>
                <p className="text-purple-200 text-sm mt-2">
                  This may take a moment...
                </p>
              </div>
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Processing"
                  className="max-h-48 mx-auto rounded-lg opacity-50"
                />
              )}
            </div>
          )}

          {/* Captions Step */}
          {step === "captions" && (
            <div className="space-y-6">
              {selectedImage && (
                <div className="text-center">
                  <img
                    src={selectedImage}
                    alt="Your meme"
                    className="max-h-64 mx-auto rounded-lg shadow-lg"
                  />
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xl font-bold text-center">
                  Generated Captions
                </h3>
                {captions.map((caption, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/10 rounded-lg flex items-center justify-between gap-4 hover:bg-white/15 transition-colors"
                  >
                    <p className="flex-1">{caption}</p>
                    <button
                      onClick={() => copyCaption(caption)}
                      className="px-3 py-1 bg-[var(--primary-orange)]/20 hover:bg-[var(--primary-orange)]/40 rounded text-sm transition-colors"
                      title="Copy to clipboard"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={reset}
                className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
              >
                Upload Another Image
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
