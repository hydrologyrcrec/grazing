import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  const caCertificateBase64 = process.env.DATABASE_CA_CERT_BASE64;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  if (!caCertificateBase64) {
    throw new Error(
      "DATABASE_CA_CERT_BASE64 is required for Aiven PostgreSQL.",
    );
  }

  const connectionUrl = new URL(databaseUrl);

  // TLS is configured explicitly below. Prevent URL parameters from
  // overriding the verified TLS configuration.
  connectionUrl.searchParams.delete("sslmode");
  connectionUrl.searchParams.delete("sslrootcert");

  const adapter = new PrismaPg({
    connectionString: connectionUrl.toString(),
    ssl: {
      ca: Buffer.from(caCertificateBase64, "base64").toString("utf8"),
      rejectUnauthorized: true,
    },
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
