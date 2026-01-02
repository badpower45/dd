import "dotenv/config";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

const demoUsers = [
  {
    email: "admin@demo.com",
    role: "admin" as const,
    full_name: "مدير النظام",
    phone_number: "0501234567",
  },
  {
    email: "dispatcher@demo.com",
    role: "dispatcher" as const,
    full_name: "المنسق أحمد",
    phone_number: "0501234568",
  },
  {
    email: "restaurant@demo.com",
    role: "restaurant" as const,
    full_name: "مطعم الريف",
    phone_number: "0501234569",
  },
  {
    email: "driver@demo.com",
    role: "driver" as const,
    full_name: "السائق محمد",
    phone_number: "0501234570",
  },
];

async function seed() {
  console.log("🌱 Seeding demo users...");

  const hashedPassword = await hash("demo123", 10);

  for (const user of demoUsers) {
    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email));

    if (existing.length > 0) {
      console.log(`  ⏭️ ${user.email} already exists, skipping...`);
      continue;
    }

    await db.insert(users).values({
      ...user,
      password: hashedPassword,
      balance: 0,
    });

    console.log(`  ✅ Created ${user.email} (${user.role})`);
  }

  console.log("\n🎉 Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
