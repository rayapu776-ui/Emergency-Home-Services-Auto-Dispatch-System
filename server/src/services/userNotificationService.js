import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database.js";

export async function createUserNotification(
  io,
  userId,
  { title, description, type = "booking" },
) {
  if (!userId || !title || !description) {
    throw new Error("A recipient, title, and description are required.");
  }

  const id = uuidv4();
  await query.run(
    `INSERT INTO user_notifications (id, user_id, title, description, type, unread)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [id, userId, title, description, type],
  );
  const notification = await query.get(
    "SELECT * FROM user_notifications WHERE id = ?",
    [id],
  );

  if (io && notification) {
    io.to(`user_${userId}`).emit("user_notification", notification);
    const recipient = await query.get("SELECT role FROM users WHERE id = ?", [
      userId,
    ]);
    if (recipient?.role === "technician") {
      io.to(`user_${userId}`).emit("technician_notification", notification);
    }
  }

  return notification;
}
