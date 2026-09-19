import express from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// ----------------------------------------------------
// CART ENDPOINTS
// ----------------------------------------------------

// Get user cart items
router.get("/cart", authenticateToken, async (req, res) => {
  try {
    const items = await query.all(
      "SELECT * FROM user_cart WHERE user_id = ? ORDER BY created_at ASC",
      [req.user.id],
    );
    res.json(items);
  } catch (err) {
    console.error("Fetch cart error:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Add or update item in cart
router.post("/cart", authenticateToken, async (req, res) => {
  try {
    const { slug, name, price, quantity = 1, image } = req.body;
    if (!slug || !name) {
      return res.status(400).json({ error: "Item slug and name are required" });
    }

    const existing = await query.get(
      "SELECT * FROM user_cart WHERE user_id = ? AND slug = ?",
      [req.user.id, slug],
    );

    if (existing) {
      const newQty = Number(quantity);
      if (newQty <= 0) {
        await query.run("DELETE FROM user_cart WHERE id = ?", [existing.id]);
      } else {
        await query.run("UPDATE user_cart SET quantity = ? WHERE id = ?", [
          newQty,
          existing.id,
        ]);
      }
    } else {
      const id = uuidv4();
      await query.run(
        `INSERT INTO user_cart (id, user_id, slug, name, price, quantity, image)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          req.user.id,
          slug,
          name,
          price || "$29",
          Math.max(1, Number(quantity) || 1),
          image || "",
        ],
      );
    }

    const updatedItems = await query.all(
      "SELECT * FROM user_cart WHERE user_id = ? ORDER BY created_at ASC",
      [req.user.id],
    );
    res.json(updatedItems);
  } catch (err) {
    console.error("Save cart error:", err);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// Delete specific item from cart by slug
router.delete("/cart/:slug", authenticateToken, async (req, res) => {
  try {
    await query.run("DELETE FROM user_cart WHERE user_id = ? AND slug = ?", [
      req.user.id,
      req.params.slug,
    ]);
    const updatedItems = await query.all(
      "SELECT * FROM user_cart WHERE user_id = ? ORDER BY created_at ASC",
      [req.user.id],
    );
    res.json(updatedItems);
  } catch (err) {
    console.error("Delete cart item error:", err);
    res.status(500).json({ error: "Failed to remove cart item" });
  }
});

// Clear entire cart
router.delete("/cart", authenticateToken, async (req, res) => {
  try {
    await query.run("DELETE FROM user_cart WHERE user_id = ?", [req.user.id]);
    res.json({ success: true, items: [] });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// ----------------------------------------------------
// NOTIFICATIONS ENDPOINTS
// ----------------------------------------------------

// Get user notifications
router.get("/notifications", authenticateToken, async (req, res) => {
  try {
    const notifs = await query.all(
      "SELECT * FROM user_notifications WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id],
    );
    res.json(notifs);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Add notification
router.post("/notifications", authenticateToken, async (req, res) => {
  try {
    const { title, description, type = "booking" } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    const id = uuidv4();
    await query.run(
      `INSERT INTO user_notifications (id, user_id, title, description, type, unread)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [id, req.user.id, title, description, type],
    );

    const created = await query.get(
      "SELECT * FROM user_notifications WHERE id = ?",
      [id],
    );
    res.status(201).json(created);
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// Mark single notification as read
router.patch("/notifications/:id/read", authenticateToken, async (req, res) => {
  try {
    await query.run(
      "UPDATE user_notifications SET unread = 0 WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Mark notification read error:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// Mark all notifications as read
router.patch("/notifications/read-all", authenticateToken, async (req, res) => {
  try {
    await query.run(
      "UPDATE user_notifications SET unread = 0 WHERE user_id = ?",
      [req.user.id],
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Mark all read error:", err);
    res.status(500).json({ error: "Failed to mark all notifications read" });
  }
});

// Clear all notifications
router.delete("/notifications", authenticateToken, async (req, res) => {
  try {
    await query.run("DELETE FROM user_notifications WHERE user_id = ?", [
      req.user.id,
    ]);
    res.json({ success: true, notifications: [] });
  } catch (err) {
    console.error("Clear notifications error:", err);
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

export default router;
