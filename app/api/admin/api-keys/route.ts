import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";
import { createApiKey, getApiKeys, regenerateApiKey, deleteApiKey, getAllApiKeys } from "@/lib/api-keys";

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = admin.role === "SUPER_ADMIN" ? await getAllApiKeys() : await getApiKeys(admin.id);
    const sanitized = keys.map(({ key, hash: _hash, ...rest }) => ({ ...rest, key: `${key.slice(0, 8)}...` }));

    return NextResponse.json({ keys: sanitized });
  } catch (err) {
    logError(err, "Failed to handle API keys:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = requireOrigin(request);
    if (csrfError) return csrfError;

    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, permissions, expiresAt } = await request.json();

    const result = await createApiKey({
      name: name || "Untitled Key",
      permissions: permissions || [],
      adminId: admin.id,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return NextResponse.json({ key: result.key, message: "Save this key - it won't be shown again" });
  } catch (err) {
    logError(err, "Failed to handle API keys:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const csrfError = requireOrigin(request);
    if (csrfError) return csrfError;

    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, action } = await request.json();

    if (action === "regenerate") {
      const newKey = await regenerateApiKey(id, admin.role === "SUPER_ADMIN" ? undefined : admin.id);
      if (!newKey) return NextResponse.json({ error: "API key not found" }, { status: 404 });
      return NextResponse.json({ key: newKey, message: "Save this key - it won't be shown again" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    logError(err, "Failed to handle API keys:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const csrfError = requireOrigin(request);
    if (csrfError) return csrfError;

    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const deleted = await deleteApiKey(id, admin.role === "SUPER_ADMIN" ? undefined : admin.id);
    if (!deleted) return NextResponse.json({ error: "API key not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, "Failed to handle API keys:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
