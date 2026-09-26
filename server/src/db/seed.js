import { initDb } from "./database.js";

// Kept as a harmless command for existing package scripts. It never overwrites
// customer data or recreates demo accounts, professionals, bookings, or history.
async function seed() {
  await initDb();
  console.log("No demo data is seeded. Existing data was left untouched.");
}

seed().catch((err) => {
  console.error("Database initialization failed:", err);
  process.exit(1);
});
