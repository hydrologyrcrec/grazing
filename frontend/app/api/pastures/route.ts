import { errorResponse } from "@/lib/api/errors";
import { readJsonBody } from "@/lib/api/request";
import { privateJson } from "@/lib/api/response";
import { requireActiveUser } from "@/lib/auth/server";
import {
  createPastureForUser,
  listPasturesForUser,
} from "@/lib/pastures/pasture.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireActiveUser();
    const pastures = await listPasturesForUser(user.id);
    return privateJson({ pastures });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireActiveUser();
    const body = await readJsonBody(request);
    const pasture = await createPastureForUser(user.id, body);
    return privateJson({ pasture }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
