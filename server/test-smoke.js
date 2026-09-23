import { query, initDb } from "./src/db/database.js";
import { dispatchEngine } from "./src/services/dispatchEngine.js";
import { calculateDistance, calculateETA } from "./src/utils/geo.js";

async function runSmokeTests() {
  console.log("Starting smoke tests for the Emergency Dispatch System...\n");
  await initDb();

  console.log("Test 1: Verifying seed users and technicians...");
  const users = await query.all("SELECT id, name, role, email FROM users");
  const technicians = await query.all(
    "SELECT t.*, u.name FROM technicians t JOIN users u ON t.user_id = u.id",
  );
  console.log(
    `  Found ${users.length} users and ${technicians.length} technicians.`,
  );
  if (users.length < 3 || technicians.length < 1)
    throw new Error("Missing seed data");
  console.log("  Seed users and technicians verified.\n");

  console.log("Test 2: Verifying Haversine distance and ETA calculations...");
  const distance = calculateDistance(28.6315, 77.2167, 28.6517, 77.1906);
  const eta = calculateETA(distance, "Critical");
  console.log(`  Distance: ${distance} km, Critical ETA: ${eta} minutes.`);
  if (distance <= 0 || eta <= 0)
    throw new Error("Invalid distance or ETA calculation");
  console.log("  Geo calculations verified.\n");

  console.log("Test 3: Testing auto-dispatch candidate ranking engine...");
  const candidates = await dispatchEngine.findEligibleTechnicians(
    "Plumbing",
    28.6315,
    77.2167,
  );
  console.log(`  Found ${candidates.length} eligible online plumbers.`);
  if (candidates.length === 0)
    throw new Error("No candidate found for Plumbing");
  const topCandidate = candidates[0];
  console.log(
    `  Top candidate: ${topCandidate.name} (score ${topCandidate.compositeScore}, ${topCandidate.distanceKm} km, ${topCandidate.etaMinutes} min ETA)`,
  );
  console.log("  Dispatch candidate ranking verified.\n");

  console.log("Test 4: Verifying status log records...");
  const logs = await query.all("SELECT * FROM status_logs LIMIT 5");
  console.log(`  Found ${logs.length} sample status logs.`);
  if (logs.length === 0) throw new Error("No status logs found");
  console.log("  Status audit logging verified.\n");
  console.log("ALL SYSTEM SMOKE TESTS PASSED SUCCESSFULLY!");
}

runSmokeTests().catch((error) => {
  console.error("Smoke test failed:", error);
  process.exit(1);
});
