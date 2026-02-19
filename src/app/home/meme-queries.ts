import { createClient } from "@/lib/supabase/server";

export interface Meme {
  id: string;
  title: string;
  image: string;
  score: number;
  createdAt: string;
}

export async function getTopRatedCaptions(): Promise<Meme[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("captions")
    .select(
      `
      id,
      content,
      created_datetime_utc,
      like_count,
      images!image_id!inner ( url )
      `
    )
    .eq("is_public", true)
    .order("like_count", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching top rated captions:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[])
    .map((caption) => {
      const image = Array.isArray(caption.images)
        ? caption.images[0]
        : caption.images;

      return {
        id: caption.id,
        title: caption.content ?? "",
        image: image?.url ?? "",
        score: caption.like_count,
        createdAt: caption.created_datetime_utc,
      };
    })
    .filter((meme) => meme.image);
}

