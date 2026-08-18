import { errorResponse } from "@/lib/api/errors";
import { readJsonBody } from "@/lib/api/request";
import { privateJson } from "@/lib/api/response";
import { requireActiveUser } from "@/lib/auth/server";
import {
  archivePastureForUser,
  getPastureForUser,
  updatePastureForUser,
} from "@/lib/pastures/pasture.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ pastureId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireActiveUser();
    const { pastureId } = await context.params;
    const pasture = await getPastureForUser(user.id, pastureId);
    return privateJson({ pasture });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireActiveUser();
    const { pastureId } = await context.params;
    const body = await readJsonBody(request);
    const pasture = await updatePastureForUser(user.id, pastureId, body);
    return privateJson({ pasture });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireActiveUser();
    const { pastureId } = await context.params;
    await archivePastureForUser(user.id, pastureId);
    return new Response(null, {
      status: 204,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
