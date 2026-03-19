"use server";

import { createClient } from "@/lib/supabase/server";

export interface HumorFlavor {
  id: number;
  slug: string;
  description: string | null;
}

export async function getHumorFlavors(): Promise<HumorFlavor[]> {
  const supabase = await createClient();

  const { data: flavors, error } = await supabase
    .from("humor_flavors")
    .select("id, slug, description")
    .order("slug");

  if (error) {
    console.error("Error fetching humor flavors:", error);
    return [];
  }

  // Filter out flavors marked as "do not use" or "don't use"
  const filteredFlavors = (flavors || []).filter((flavor) => {
    const desc = (flavor.description || "").toLowerCase();
    const slug = flavor.slug.toLowerCase();
    return (
      !desc.includes("do not use") &&
      !desc.includes("don't use") &&
      !slug.includes("do not use") &&
      !slug.includes("don't use")
    );
  });

  return filteredFlavors;
}
