import { jwtVerify, SignJWT } from "jose";
import { ACCESS_TOKEN_TTL_SECONDS } from "@/lib/auth/constants";

type AccessTokenClaims = {
  userId: string;
  email: string;
  sessionId: string;
};

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_JWT_SECRET must be at least 32 characters long.");
  }
  return new TextEncoder().encode(secret);
}

function issuer() {
  return process.env.AUTH_JWT_ISSUER ?? "grazing-web";
}

function audience() {
  return process.env.AUTH_JWT_AUDIENCE ?? "grazing-web";
}

export async function createAccessToken(claims: AccessTokenClaims) {
  return new SignJWT({
    email: claims.email,
    sid: claims.sessionId,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.userId)
    .setIssuer(issuer())
    .setAudience(audience())
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims> {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    issuer: issuer(),
    audience: audience(),
  });

  if (
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.sid !== "string"
  ) {
    throw new Error("Access token claims are invalid.");
  }

  return {
    userId: payload.sub,
    email: payload.email,
    sessionId: payload.sid,
  };
}
