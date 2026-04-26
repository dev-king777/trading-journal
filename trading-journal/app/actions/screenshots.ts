"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/auth/current-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SCREENSHOT_BUCKET = "screenshots";

function safeScreenshotName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function getScreenshotStorageClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.storage.getBucket(SCREENSHOT_BUCKET);

    if (error) {
      const { error: createError } = await admin.storage.createBucket(SCREENSHOT_BUCKET, {
        public: false,
        fileSizeLimit: "10MB"
      });

      if (createError && !createError.message.toLowerCase().includes("already exists")) {
        throw createError;
      }
    }

    return admin.storage;
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase environment variables are required.");
  }

  return supabase.storage;
}

async function uploadScreenshotFile(file: File, path: string) {
  const storage = await getScreenshotStorageClient();
  const { error: uploadError } = await storage.from(SCREENSHOT_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type
  });

  if (uploadError) throw uploadError;

  const { data, error: signedError } = await storage.from(SCREENSHOT_BUCKET).createSignedUrl(path, 60 * 60);
  if (signedError) throw signedError;

  return data.signedUrl;
}

export async function uploadDraftTradeScreenshot(formData: FormData) {
  const file = formData.get("screenshot");

  if (!(file instanceof File) || !file.size) {
    return { ok: false, message: "Choose a screenshot first." };
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: "Supabase environment variables are required." };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sign in before uploading screenshots." };
  }

  try {
    const path = `${user.id}/drafts/${Date.now()}-${safeScreenshotName(file.name)}`;
    const signedUrl = await uploadScreenshotFile(file, path);
    return { ok: true, path, signedUrl };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Screenshot upload failed."
    };
  }
}

export async function uploadTradeScreenshot(formData: FormData) {
  const tradeId = String(formData.get("tradeId") ?? "");
  const file = formData.get("screenshot");

  if (!(file instanceof File) || !file.size) {
    redirect(`/trades/${tradeId}?error=no-file`);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect(`/trades/${tradeId}?error=storage-required`);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const path = `${user.id}/${tradeId}/${Date.now()}-${safeScreenshotName(file.name)}`;
  try {
    await uploadScreenshotFile(file, path);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Screenshot upload failed.";
    redirect(`/trades/${tradeId}?error=${encodeURIComponent(message)}`);
  }

  const { error: updateError } = await supabase
    .from("trades")
    .update({ screenshot_url: path })
    .eq("id", tradeId)
    .eq("user_id", user.id);

  if (updateError) {
    redirect(`/trades/${tradeId}?error=${encodeURIComponent(updateError.message)}`);
  }

  revalidatePath(`/trades/${tradeId}`);
  redirect(`/trades/${tradeId}`);
}
