import { createClient } from "@/lib/supabase/server";

export interface CaptionForVoting {
  id: string;
  content: string;
  imageUrl: string;
  imageId: string;
  userVote: number | null; // 1 = upvote, -1 = downvote, null = no vote
}

export async function getCaptionsForVoting(): Promise<CaptionForVoting[]> {
  const supabase = await createClient();

  // Get the current user (may be null if not logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, get caption IDs they've already voted on
  let votedCaptionIds: string[] = [];
  if (user) {
    const { data: votes } = await supabase
      .from("caption_votes")
      .select("caption_id")
      .eq("profile_id", user.id);

    if (votes) {
      votedCaptionIds = votes.map((v) => v.caption_id);
    }
  }

  // Fetch captions with joined image data
  let query = supabase
    .from("captions")
    .select("id, content, image_id, images(id, url)")
    .eq("is_public", true);

  // Exclude already voted captions if user is logged in
  if (votedCaptionIds.length > 0) {
    query = query.not("id", "in", `(${votedCaptionIds.join(",")})`);
  }

  const { data: captions, error } = await query;

  if (error) {
    console.error("Error fetching captions:", error);
    return [];
  }

  const result = (captions || [])
    .map((caption) => {
      const images = caption.images as unknown as
        | { id: string; url: string }
        | null;
      return {
        id: caption.id,
        content: caption.content ?? "",
        imageUrl: images?.url ?? "",
        imageId: caption.image_id,
        userVote: null, // Always null since we only fetch unvoted captions
      };
    })
    .filter((caption) => caption.imageUrl && caption.content);

  // Shuffle and return 30 random captions
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.slice(0, 30);
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
