import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";
import {
  getAllTranslations,
  getTranslationStats,
  upsertTranslation,
  deleteTranslation,
} from "@/lib/translations";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const namespace = searchParams.get("namespace") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const missing = searchParams.get("missing") ?? undefined;
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = parseInt(searchParams.get("offset") ?? "0");
    const stats = searchParams.get("stats");

    if (stats === "true") {
      const s = await getTranslationStats();
      return NextResponse.json(s);
    }

    const result = await getAllTranslations({ namespace, search, missing, limit, offset });
    return NextResponse.json(result);
  } catch (err) {
    logError(err, "Failed to handle translations:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = requireOrigin(request);
    if (csrfError) return csrfError;

    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    if (body.action === "upsert") {
      const result = await upsertTranslation(body.data);
      return NextResponse.json({ translation: result });
    }

    if (body.action === "bulk") {
      const results = [];
      for (const item of body.data) {
        results.push(await upsertTranslation(item));
      }
      return NextResponse.json({ count: results.length });
    }

    if (body.action === "delete") {
      await deleteTranslation(body.id);
      return NextResponse.json({ success: true });
    }

    if (body.action === "import") {
      const { items } = body;
      let created = 0;
      for (const item of items) {
        await upsertTranslation(item);
        created++;
      }
      return NextResponse.json({ count: created });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    logError(err, "Failed to handle translations:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const csrfError = requireOrigin(request);
    if (csrfError) return csrfError;

    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, data } = await request.json();
    const { updateTranslation } = await import("@/lib/translations");
    await updateTranslation(id, data, {
      id: admin.id,
      name: admin.name,
      ip: request.headers.get("x-forwarded-for") ?? "",
      browser: request.headers.get("user-agent") ?? "",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, "Failed to handle translations:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
