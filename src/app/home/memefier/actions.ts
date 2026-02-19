"use server";

import { createClient } from "@/lib/supabase/server";

const PIPELINE_API_BASE = "https://api.almostcrackd.ai";

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

async function getPresignedUploadUrl(contentType: string): Promise<{
  success: boolean;
  data?: PresignedUrlResponse;
  error?: string;
}> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const response = await fetch(
      `${PIPELINE_API_BASE}/pipeline/generate-presigned-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentType }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Presigned URL error:", errorText);
      return { success: false, error: "Failed to generate upload URL" };
    }

    const data: PresignedUrlResponse = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Presigned URL error:", error);
    return { success: false, error: "Failed to connect to upload service" };
  }
}

async function registerImageWithPipeline(imageUrl: string): Promise<{
  success: boolean;
  imageId?: string;
  error?: string;
}> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const response = await fetch(
      `${PIPELINE_API_BASE}/pipeline/upload-image-from-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl, isCommonUse: false }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Image registration error:", errorText);
      return { success: false, error: "Failed to register image" };
    }

    const data = await response.json();
    return { success: true, imageId: data.imageId };
  } catch (error) {
    console.error("Image registration error:", error);
    return { success: false, error: "Failed to connect to pipeline service" };
  }
}

async function generateCaptions(imageId: string): Promise<{
  success: boolean;
  captions?: string[];
  error?: string;
}> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const response = await fetch(
      `${PIPELINE_API_BASE}/pipeline/generate-captions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageId }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Caption generation error:", errorText);
      return { success: false, error: "Failed to generate captions" };
    }

    const data: CaptionRecord[] = await response.json();
    // Extract caption strings from the response array
    const captions = data.map((record) => record.caption);
    return { success: true, captions };
  } catch (error) {
    console.error("Caption generation error:", error);
    return { success: false, error: "Failed to connect to caption service" };
  }
}

async function uploadImageToPresignedUrl(
  uploadUrl: string,
  imageBase64: string,
  contentType: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: buffer,
    });

    if (!response.ok) {
      console.error("Upload error:", response.status, response.statusText);
      return { success: false, error: "Failed to upload image" };
    }

    return { success: true };
  } catch (error) {
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
    // Step 1: Get presigned upload URL
    const presignedResult = await getPresignedUploadUrl(contentType);
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
    const registerResult = await registerImageWithPipeline(cdnUrl);
    if (!registerResult.success || !registerResult.imageId) {
      return { success: false, error: registerResult.error || "Failed to register image" };
    }

    // Step 4: Generate captions using imageId
    const captionsResult = await generateCaptions(registerResult.imageId);
    if (!captionsResult.success || !captionsResult.captions) {
      return { success: false, error: captionsResult.error || "Failed to generate captions" };
    }

    return { success: true, captions: captionsResult.captions };
  } catch (error) {
    console.error("Process image error:", error);
    return { success: false, error: "An error occurred while processing the image" };
  }
}
