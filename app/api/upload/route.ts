import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    console.log("[UPLOAD API] Request received");

    // Get form data
    const formData = await req.formData();
    console.log("[UPLOAD API] Form data parsed");

    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
    }

    console.log(`[UPLOAD API] File received: ${file.name}, User: ${userId}`);

    // Save file locally
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `admin_${Date.now()}.png`;
    const uploadDir = `${process.cwd()}/public/uploads`;
    const fs = require("fs");
    const path = require("path");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const relativeUrl = `/uploads/${filename}`;
    console.log(`[UPLOAD API] File written at: ${filepath}`);
    console.log(`[UPLOAD API] Relative URL: ${relativeUrl}`);

    // ✅ FIX: ensure we create the Supabase client instance
    const supabase = await createClient();  // <-- this must return supabase client

      // After generating fileUrl
    const { data, error } = await supabase.from("uploaded_images").insert({
      user_id: userId,
      filename: formData.get("filename") as string, // ✅ original filename
      file_url: relativeUrl, // ✅ relative local path
      file_size: buffer.length, // ✅ optional
      mime_type: file.type,
      user_label: formData.get("user_label") || null,
      plant_part: formData.get("plant_part") || null,
      location_name: formData.get("location_name") || null,
      notes: formData.get("notes") || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[UPLOAD API] Supabase insert error:", error);
    } else {
      console.log("[UPLOAD API] Supabase insert success:", data);
    }


    return NextResponse.json({ success: true, fileUrl: relativeUrl });
  } catch (err) {
    console.error("[UPLOAD API] Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
