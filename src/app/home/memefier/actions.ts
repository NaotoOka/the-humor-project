"use server";

import { createClient } from "@/lib/supabase/server";

const PIPELINE_API_BASE = "https://api.almostcrackd.ai";
const SUPPORTED_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
];
const REQUEST_TIMEOUT_MS = 30000;
const CAPTION_TIMEOUT_MS = 120000; // Caption generation may take longer due to AI processing

interface PresignedUrlResponse {
  presignedUrl: string;
  cdnUrl: string;
}

interface CaptionRecord {
  id: string;
  caption: string;
  [key: string]: unknown;
}

async function getAccessToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function getPresignedUploadUrl(
  token: string,
  contentType: string
): Promise<{
  success: boolean;
  data?: PresignedUrlResponse;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${PIPELINE_API_BASE}/pipeline/generate-presigned-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentType }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Presigned URL error:", errorText);
      return { success: false, error: "Failed to generate upload URL" };
    }

    const data = await response.json();
    if (!data.presignedUrl || !data.cdnUrl) {
      return { success: false, error: "Invalid response from upload service" };
    }
    return { success: true, data };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, error: "Request timed out" };
    }
    console.error("Presigned URL error:", error);
    return { success: false, error: "Failed to connect to upload service" };
  }
}

async function registerImageWithPipeline(
  token: string,
  imageUrl: string
): Promise<{
  success: boolean;
  imageId?: string;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${PIPELINE_API_BASE}/pipeline/upload-image-from-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl, isCommonUse: false }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Image registration error:", errorText);
      return { success: false, error: "Failed to register image" };
    }

    const data = await response.json();
    if (!data.imageId) {
      return { success: false, error: "Invalid response from pipeline service" };
    }
    return { success: true, imageId: data.imageId };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, error: "Request timed out" };
    }
    console.error("Image registration error:", error);
    return { success: false, error: "Failed to connect to pipeline service" };
  }
}

async function generateCaptions(
  token: string,
  imageId: string
): Promise<{
  success: boolean;
  captions?: string[];
  error?: string;
}> {
  try {
    const response = await fetch(
      `${PIPELINE_API_BASE}/pipeline/generate-captions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageId }),
        signal: AbortSignal.timeout(CAPTION_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Caption generation error:", errorText);
      return { success: false, error: "Failed to generate captions" };
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return { success: false, error: "Invalid response from caption service" };
    }
    const captions = data.map((record: CaptionRecord) => record.caption);
    return { success: true, captions };
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return { success: false, error: "Caption generation timed out" };
    }
    console.error("Caption generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to connect to caption service: ${message}` };
  }
}

async function uploadImageToPresignedUrl(
  uploadUrl: string,
  imageBase64: string,
  contentType: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Convert base64 to buffer - handle data URLs with any content type
    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: buffer,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error("Upload error:", response.status, response.statusText);
      return { success: false, error: "Failed to upload image" };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, error: "Upload timed out" };
    }
    console.error("Upload error:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

export async function processImageAndGenerateCaptions(
  imageBase64: string,
  contentType: string
): Promise<{
  success: boolean;
  captions?: string[];
  error?: string;
}> {
  try {
    // Validate content type
    if (!SUPPORTED_CONTENT_TYPES.includes(contentType)) {
      return {
        success: false,
        error: `Unsupported image type. Supported types: ${SUPPORTED_CONTENT_TYPES.join(", ")}`,
      };
    }

    // Get token once for all API calls
    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    // Step 1: Get presigned upload URL
    const presignedResult = await getPresignedUploadUrl(token, contentType);
    if (!presignedResult.success || !presignedResult.data) {
      return { success: false, error: presignedResult.error || "Failed to get upload URL" };
    }

    const { presignedUrl, cdnUrl } = presignedResult.data;

    // Step 2: Upload image to presigned URL
    const uploadResult = await uploadImageToPresignedUrl(
      presignedUrl,
      imageBase64,
      contentType
    );
    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error || "Failed to upload image" };
    }

    // Step 3: Register image with pipeline
    const registerResult = await registerImageWithPipeline(token, cdnUrl);
    if (!registerResult.success || !registerResult.imageId) {
      return { success: false, error: registerResult.error || "Failed to register image" };
    }

    // Step 4: Generate captions using imageId
    const captionsResult = await generateCaptions(token, registerResult.imageId);
    if (!captionsResult.success || !captionsResult.captions) {
      return { success: false, error: captionsResult.error || "Failed to generate captions" };
    }

    return { success: true, captions: captionsResult.captions };
  } catch (error) {
    console.error("Process image error:", error);
    return { success: false, error: "An error occurred while processing the image" };
  }
}
