"use client";

import { useRef, useState } from "react";

interface MemeComposerProps {
  image: string;
  caption: string;
  onBack: () => void;
  onReset: () => void;
}

type TextPosition = "top" | "bottom";

const FONT_SIZES = [
  { label: "S", value: 16 },
  { label: "M", value: 20 },
  { label: "L", value: 24 },
  { label: "XL", value: 32 },
];

const TEXT_COLORS = [
  { label: "White", value: "#ffffff" },
  { label: "Black", value: "#000000" },
  { label: "Yellow", value: "#ffff00" },
  { label: "Red", value: "#ff0000" },
  { label: "Orange", value: "#FF8C42" },
];

const BG_COLORS = [
  { label: "Black", value: "#000000" },
  { label: "White", value: "#ffffff" },
  { label: "Purple", value: "#6B21A8" },
  { label: "Navy", value: "#1e3a5f" },
  { label: "Orange", value: "#FF8C42" },
];

export default function MemeComposer({
  image,
  caption,
  onBack,
  onReset,
}: MemeComposerProps) {
  const memeRef = useRef<HTMLDivElement>(null);
  const [editedCaption, setEditedCaption] = useState(caption);
  const [isEditing, setIsEditing] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [textPosition, setTextPosition] = useState<TextPosition>("bottom");
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");

  const downloadMeme = async () => {
    if (!memeRef.current || !image) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = image;
      });

      const padding = 20;
      const scaledFontSize = Math.max(fontSize * 1.5, img.width / 20);
      const lineHeight = scaledFontSize * 1.3;

      ctx.font = `bold ${scaledFontSize}px Arial, sans-serif`;

      const maxWidth = img.width - padding * 2;
      const words = editedCaption.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      const captionHeight = lines.length * lineHeight + padding * 2;

      if (textPosition === "bottom") {
        canvas.width = img.width;
        canvas.height = img.height + captionHeight;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        ctx.fillStyle = textColor;
        ctx.font = `bold ${scaledFontSize}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        // Add text stroke for better visibility
        ctx.strokeStyle = textColor === "#000000" ? "#ffffff" : "#000000";
        ctx.lineWidth = scaledFontSize / 10;

        const textStartY = img.height + padding;
        lines.forEach((line, index) => {
          const y = textStartY + index * lineHeight;
          ctx.strokeText(line, canvas.width / 2, y);
          ctx.fillText(line, canvas.width / 2, y);
        });
      } else {
        canvas.width = img.width;
        canvas.height = img.height + captionHeight;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, captionHeight);

        ctx.fillStyle = textColor;
        ctx.font = `bold ${scaledFontSize}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        ctx.strokeStyle = textColor === "#000000" ? "#ffffff" : "#000000";
        ctx.lineWidth = scaledFontSize / 10;

        const textStartY = padding;
        lines.forEach((line, index) => {
          const y = textStartY + index * lineHeight;
          ctx.strokeText(line, canvas.width / 2, y);
          ctx.fillText(line, canvas.width / 2, y);
        });
      }

      const link = document.createElement("a");
      link.download = "meme.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to download meme:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main layout: Image on left-center, controls on right */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
        {/* Spacer to push content right */}
        <div className="hidden lg:block lg:flex-1" />

        {/* Meme Preview */}
        <div className="flex-shrink-0 max-w-sm mx-auto lg:mx-0">
          <div
            ref={memeRef}
            className="rounded-lg overflow-hidden shadow-lg max-h-[70vh] overflow-y-auto"
          >
            {textPosition === "top" && (
              <div className="p-4" style={{ backgroundColor: bgColor }}>
                {isEditing ? (
                  <textarea
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    className="w-full bg-transparent text-center font-bold resize-none outline-none border border-white/30 rounded p-2"
                    style={{ fontSize: `${fontSize}px`, color: textColor }}
                    rows={2}
                    autoFocus
                    onBlur={() => setIsEditing(false)}
                  />
                ) : (
                  <p
                    className="text-center font-bold cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ fontSize: `${fontSize}px`, color: textColor }}
                    onClick={() => setIsEditing(true)}
                    title="Click to edit caption"
                  >
                    {editedCaption}
                  </p>
                )}
              </div>
            )}
            <img src={image} alt="Meme" className="w-full max-h-[60vh] object-cover" />
            {textPosition === "bottom" && (
              <div className="p-4" style={{ backgroundColor: bgColor }}>
                {isEditing ? (
                  <textarea
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    className="w-full bg-transparent text-center font-bold resize-none outline-none border border-white/30 rounded p-2"
                    style={{ fontSize: `${fontSize}px`, color: textColor }}
                    rows={2}
                    autoFocus
                    onBlur={() => setIsEditing(false)}
                  />
                ) : (
                  <p
                    className="text-center font-bold cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ fontSize: `${fontSize}px`, color: textColor }}
                    onClick={() => setIsEditing(true)}
                    title="Click to edit caption"
                  >
                    {editedCaption}
                  </p>
                )}
              </div>
            )}
          </div>
          {/* Edit hint */}
          <p className="text-center font-bold text-purple-200 text-sm mt-2">
            Click on the caption to edit
          </p>
        </div>

        {/* Right side: Text Customization Controls */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white/10 rounded-xl p-4 space-y-5 sticky top-4">
            <h4 className="font-semibold text-white border-b border-white/20 pb-2">
              Customize
            </h4>

            {/* Font Size */}
            <div className="space-y-2">
              <span className="text-sm text-purple-200">Size</span>
              <div className="grid grid-cols-4 gap-1.5">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setFontSize(size.value)}
                    className={`h-9 rounded-lg font-medium text-sm transition-colors ${
                      fontSize === size.value
                        ? "bg-[var(--primary-orange)] text-white"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Position */}
            <div className="space-y-2">
              <span className="text-sm text-purple-200">Position</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setTextPosition("top")}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5 ${
                    textPosition === "top"
                      ? "bg-[var(--primary-orange)] text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Top
                </button>
                <button
                  onClick={() => setTextPosition("bottom")}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5 ${
                    textPosition === "bottom"
                      ? "bg-[var(--primary-orange)] text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Bottom
                </button>
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <span className="text-sm text-purple-200">Text Color</span>
              <div className="flex gap-2 flex-wrap">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setTextColor(color.value)}
                    className={`w-9 h-9 rounded-lg transition-all border-2 ${
                      textColor === color.value
                        ? "border-[var(--primary-orange)] scale-110"
                        : "border-transparent hover:border-white/30"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <span className="text-sm text-purple-200">Background</span>
              <div className="flex gap-2 flex-wrap">
                {BG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setBgColor(color.value)}
                    className={`w-9 h-9 rounded-lg transition-all border-2 ${
                      bgColor === color.value
                        ? "border-[var(--primary-orange)] scale-110"
                        : "border-transparent hover:border-white/30"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Download Button in sidebar */}
            <button
              onClick={downloadMeme}
              className="w-full py-3 bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onBack}
          className="py-3 px-5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/20 hover:border-white/40 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Another Caption
        </button>
        <button
          onClick={onReset}
          className="py-3 px-5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/20 hover:border-white/40 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Start Over
        </button>
      </div>
    </div>
  );
}
