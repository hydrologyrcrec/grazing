import { Prisma, UserStatus } from "@prisma/client";
import { REFRESH_TOKEN_TTL_SECONDS } from "@/lib/auth/constants";
import { ApiError } from "@/lib/auth/errors";
import { hashPassword, verifyPassword } from "@/lib/auth/passwords";
import { createRefreshToken, hashRefreshToken } from "@/lib/auth/refresh-tokens";
import { createAccessToken } from "@/lib/auth/tokens";
import type { LoginInput, SignUpInput } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export type AuthResult = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
};

function publicUser(user: AuthUser): AuthUser {
  return user;
}

function refreshExpiry() {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
}

async function createSessionTokens(user: AuthUser): Promise<AuthResult> {
  const refreshToken = createRefreshToken();
  const refreshExpiresAt = refreshExpiry();
  const session = await prisma.authSession.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: refreshExpiresAt,
    },
    select: { id: true },
  });

  const accessToken = await createAccessToken({
    userId: user.id,
    email: user.email,
    sessionId: session.id,
  });

  return { user: publicUser(user), accessToken, refreshToken, refreshExpiresAt };
}

export async function registerUser(input: SignUpInput): Promise<AuthResult> {
  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: await hashPassword(input.password),
        firstName: input.firstName,
        lastName: input.lastName,
        status: UserStatus.ACTIVE,
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    return createSessionTokens(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ApiError(409, "EMAIL_ALREADY_REGISTERED", "An account already exists for this email.");
    }
    throw error;
  }
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      firstName: true,
      lastName: true,
      status: true,
    },
  });

  if (!user || !(await verifyPassword(user.passwordHash, input.password))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new ApiError(403, "ACCOUNT_UNAVAILABLE", "This account is not available.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return createSessionTokens(user);
}

export async function rotateRefreshSession(refreshToken: string): Promise<AuthResult> {
  const tokenHash = hashRefreshToken(refreshToken);
  const session = await prisma.authSession.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, status: true },
      },
    },
  });

  if (
    !session ||
    session.revokedAt ||
    session.expiresAt <= new Date() ||
    session.user.status !== UserStatus.ACTIVE
  ) {
    throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Please sign in again.");
  }

  const nextRefreshToken = createRefreshToken();

  // The token hash in the WHERE clause makes concurrent refresh attempts safe:
  // only the first one can rotate this session.
  const rotation = await prisma.authSession.updateMany({
    where: {
      id: session.id,
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: {
      tokenHash: hashRefreshToken(nextRefreshToken),
      lastUsedAt: new Date(),
    },
  });

  if (rotation.count !== 1) {
    throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Please sign in again.");
  }

  const user = publicUser(session.user);
  const accessToken = await createAccessToken({
    userId: user.id,
    email: user.email,
    sessionId: session.id,
  });

  return {
    user,
    accessToken,
    refreshToken: nextRefreshToken,
    refreshExpiresAt: session.expiresAt,
  };
}

export async function revokeRefreshSession(refreshToken: string) {
  await prisma.authSession.updateMany({
    where: {
      tokenHash: hashRefreshToken(refreshToken),
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

export async function getActiveUser(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, status: UserStatus.ACTIVE },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  if (!user) {
    throw new ApiError(401, "SESSION_INVALID", "Your session is no longer valid.");
  }

  return user;
}
