import { supabase } from "./supabase";

const BUCKET_NAME = "slambook-images";

export async function uploadImage(file: File): Promise<string> {
  try {
    if (!file) {
      throw new Error("No image selected");
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("Please select a valid image file");
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.${extension}`;

    const filePath = `images/${fileName}`;

    console.log("Starting upload...");
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Bucket:", BUCKET_NAME);
    console.log("File path:", filePath);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error("UPLOAD ERROR:", error);
      console.error("MESSAGE:", error.message);
      console.error("NAME:", error.name);
      console.error("STATUS:", error.status);

      throw new Error(
        `Image upload failed: ${error.message || "Failed to fetch"}`
      );
    }

    if (!data?.path) {
      throw new Error("Upload completed but file path was not returned");
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Could not generate image URL");
    }

    console.log("UPLOAD SUCCESS:", data.path);
    console.log("IMAGE URL:", publicUrlData.publicUrl);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error("FINAL IMAGE UPLOAD ERROR:", error);

    if (error?.message === "Failed to fetch") {
      throw new Error(
        "Supabase Storage connection failed. Check Supabase URL, bucket, and network connection."
      );
    }

    throw error;
  }
}