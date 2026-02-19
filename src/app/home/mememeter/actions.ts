"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitVote(captionId: string, voteValue: 1 | -1) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in to vote" };
  }

  // Check if user has already voted on this caption
  const { data: existingVote } = await supabase
    .from("caption_votes")
    .select("id, vote_value")
    .eq("caption_id", captionId)
    .eq("profile_id", user.id)
    .single();

  if (existingVote) {
    // If same vote, remove it (toggle off)
    if (existingVote.vote_value === voteValue) {
      const { error: deleteError } = await supabase
        .from("caption_votes")
        .delete()
        .eq("id", existingVote.id);

      if (deleteError) {
        return { error: "Failed to remove vote" };
      }

      return { success: true, action: "removed" };
    }

    // If different vote, update it
    const { error: updateError } = await supabase
      .from("caption_votes")
      .update({
        vote_value: voteValue,
        modified_datetime_utc: new Date().toISOString(),
      })
      .eq("id", existingVote.id);

    if (updateError) {
      return { error: "Failed to update vote" };
    }

    return { success: true, action: "updated" };
  }

  // Insert new vote
  const { error: insertError } = await supabase.from("caption_votes").insert({
    caption_id: captionId,
    profile_id: user.id,
    vote_value: voteValue,
    created_datetime_utc: new Date().toISOString(),
  });

  if (insertError) {
    console.error("Vote insert error:", insertError);
    return { error: "Failed to submit vote" };
  }

  return { success: true, action: "created" };
}
