import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import db, { query } from "./database.js";

const email = String(process.env.ADMIN_BOOTSTRAP_EMAIL || "")
  .trim()
  .toLowerCase();
const name = String(process.env.ADMIN_BOOTSTRAP_NAME || "").trim();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || "";

async function createFirstAdmin() {
  if (!email || !name || !password) {
    throw new Error(
      "Set ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_NAME, and ADMIN_BOOTSTRAP_PASSWORD before running this command.",
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("ADMIN_BOOTSTRAP_EMAIL must be a valid email address.");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters.");
  }

  const schema = await query.get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'",
  );
  if (!schema)
    throw new Error(
      "Start the server once to initialize its database before provisioning an admin.",
    );

  const existing = await query.get(
    "SELECT id, role FROM users WHERE LOWER(email) = ?",
    [email],
  );
  if (existing) {
    throw new Error(
      existing.role === "admin"
        ? "This email already belongs to an admin. No changes were made."
        : "This email already belongs to a non-admin account. No changes were made.",
    );
  }

  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 12);
  const result = await query.run(
    `INSERT INTO users (id, name, email, password_hash, role, account_status, admin_role)
     SELECT ?, ?, ?, ?, 'admin', 'Active', 'super_admin'
     WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin')`,
    [id, name, email, passwordHash],
  );
  if (result.changes !== 1) {
    throw new Error(
      "An admin already exists. Ask an authorized Super Admin to provision additional admins.",
    );
  }
  console.log(`First Super Admin created for ${email}.`);
}

createFirstAdmin()
  .catch((error) => {
    console.error(`Admin provisioning failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => db.close());
