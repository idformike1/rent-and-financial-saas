import { getSovereignClient } from "./src/lib/db";

async function testDB() {
  const orgId = "Iron-Corp-UUID-Placeholder"; // I should find a real one
  // Let's just try to list properties
  const db = getSovereignClient(orgId);
  try {
    console.log("Testing DB connection...");
    const count = await db.property.count();
    console.log("Property count:", count);
  } catch (e) {
    console.error("DB Test Failed:", e);
  }
}

testDB();
