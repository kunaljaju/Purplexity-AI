import { PrismaClient } from "@prisma/client";

let prismaInstance = null;

export function isDatabaseConfigured() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return false;
  return dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://");
}

export function getPrisma() {
  const dbUrl = process.env.DATABASE_URL;
  if (!isDatabaseConfigured() || !dbUrl) {
    throw new Error(
      "DATABASE_URL is missing or invalid. Please add your PostgreSQL connection string starting with postgresql:// or postgres:// in Settings > Secrets."
    );
  }

  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });
  }
  return prismaInstance;
}
