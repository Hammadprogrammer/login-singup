/**
 * One-time / idempotent admin bootstrap script.
 *
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from the environment and creates
 * (or upgrades) a real User row with role = "ADMIN" and a securely hashed
 * password. After this, the admin logs in through the normal login flow —
 * credentials are NEVER checked directly against .env anymore.
 *
 * Run with:  npm run create-admin
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment to bootstrap an admin."
    );
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters long.");
  }

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", password: hashed, provider: "credentials" },
    create: {
      email,
      password: hashed,
      name: "Administrator",
      role: "ADMIN",
      provider: "credentials",
    },
  });

  console.log(`✅ Admin ready: ${admin.email} (id=${admin.id}, role=${admin.role})`);
}

main()
  .catch((err) => {
    console.error("❌ Failed to create admin:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
