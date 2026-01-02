import "dotenv/config";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

const demoEmails = [
  "admin@demo.com",
  "dispatcher@demo.com",
  "restaurant@demo.com",
  "driver@demo.com",
];

async function updatePasswords() {
  console.log("🔐 Updating demo users passwords to 'demo123'...\n");

  const hashedPassword = await hash("demo123", 10);

  for (const email of demoEmails) {
    try {
      const result = await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, email))
        .returning();

      if (result.length > 0) {
        console.log(`  ✅ Updated password for ${email}`);
      } else {
        console.log(`  ⚠️ User ${email} not found`);
      }
    } catch (err) {
      console.error(`  ❌ Failed to update ${email}:`, err);
    }
  }

  console.log("\n🎉 Password update complete!");
  console.log(
    "   You can now login with any demo account using password: demo123",
  );
  process.exit(0);
}

updatePasswords().catch((err) => {
  console.error("❌ Update failed:", err);
  process.exit(1);
});
