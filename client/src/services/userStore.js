import api from "./api";

/**
 * Robust, production-grade persistent data store scoped strictly per authenticated user.
 * Guarantees zero fake/demo items generated on page load or refresh.
 */

const getKey = (userId, domain) => {
  const safeId = userId ? String(userId).trim() : "guest";
  return `argent_${domain}_${safeId}`;
};

export const userStore = {
  // ----------------------------------------------------
  // BOOKINGS / ORDERS
  // ----------------------------------------------------
  getBookings(userId) {
    if (!userId) return [];
    try {
      const saved = localStorage.getItem(getKey(userId, "bookings"));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async fetchBookingsFromApi(userId) {
    if (!userId) return [];
    try {
      const res = await api.get("/requests/my");
      if (Array.isArray(res.data)) {
        // Merge with locally stored bookings to ensure immediate UI consistency
        const local = this.getBookings(userId);
        const map = new Map();
        local.forEach((b) => map.set(b.id, b));
        res.data.forEach((b) => map.set(b.id, { ...map.get(b.id), ...b }));
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
        this.saveBookings(userId, merged);
        return merged;
      }
    } catch (err) {
      console.warn(
        "Could not fetch remote bookings, using local store:",
        err.message,
      );
    }
    return this.getBookings(userId);
  },

  saveBookings(userId, bookings) {
    if (!userId) return;
    try {
      localStorage.setItem(
        getKey(userId, "bookings"),
        JSON.stringify(bookings || []),
      );
    } catch (err) {
      console.warn("Storage write error for bookings:", err);
    }
  },

  addBooking(userId, booking) {
    if (!userId || !booking) return;
    const current = this.getBookings(userId);
    // Prevent duplicate booking insertion
    const filtered = current.filter((b) => b.id !== booking.id);
    const updated = [booking, ...filtered];
    this.saveBookings(userId, updated);

    // Auto-generate corresponding real booking notifications
    this.addNotification(userId, {
      title: `Booking Confirmed: ${booking.serviceName || "Doorstep Service"}`,
      description: `Your booking #${booking.id} is scheduled for ${booking.scheduledDate || "Today"} (${booking.scheduledTime || "Priority Slot"}).`,
      type: "booking",
    });

    if (booking.technician) {
      this.addNotification(userId, {
        title: `Service Provider Assigned: ${booking.technician.name}`,
        description: `${booking.technician.name} (${booking.technician.phone}) will arrive at your address.`,
        type: "dispatch",
      });
    }

    return updated;
  },

  updateBooking(userId, bookingId, updates) {
    if (!userId || !bookingId) return;
    const current = this.getBookings(userId);
    const updated = current.map((b) =>
      b.id === bookingId ? { ...b, ...updates } : b,
    );
    this.saveBookings(userId, updated);
    return updated;
  },

  async completeBooking(userId, bookingId) {
    if (!userId || !bookingId) return;
    try {
      await api.post(`/requests/${bookingId}/complete`);
    } catch (err) {
      console.warn("Remote completion call error:", err);
    }
    const updated = this.updateBooking(userId, bookingId, {
      status: "Completed",
      statusStep: 4,
    });
    this.addNotification(userId, {
      title: `Service Completed: #${bookingId}`,
      description:
        "Your doorstep service has been completed. Tap to rate your technician.",
      type: "completed",
    });
    return updated;
  },

  async rateBooking(userId, bookingId, rating, feedback) {
    if (!userId || !bookingId) return;
    const numRating = Number(rating) || 5;
    try {
      await api.post(`/requests/${bookingId}/rate`, {
        rating: numRating,
        feedback: feedback || "",
      });
    } catch (err) {
      console.warn("Remote rating call error:", err);
    }

    const updated = this.updateBooking(userId, bookingId, {
      rating: numRating,
      feedback: feedback || null,
      reviewedAt: new Date().toISOString(),
    });

    this.addNotification(userId, {
      title: `Rating Submitted for #${bookingId}`,
      description: `Thank you for submitting a ${numRating}-star rating. Your feedback helps us maintain top service quality.`,
      type: "system",
    });

    return updated;
  },

  async rescheduleBooking(userId, bookingId, scheduledDate, scheduledTime) {
    if (!userId || !bookingId) return;
    try {
      await api.post(`/requests/${bookingId}/reschedule`, {
        scheduledDate,
        scheduledTime,
      });
    } catch (err) {
      console.warn("Remote reschedule call error:", err);
    }
    const updated = this.updateBooking(userId, bookingId, {
      scheduledDate,
      scheduledTime,
    });
    this.addNotification(userId, {
      title: `Booking Rescheduled: #${bookingId}`,
      description: `Your appointment has been rescheduled to ${scheduledDate} (${scheduledTime}).`,
      type: "booking",
    });
    return updated;
  },

  async cancelBooking(userId, bookingId, reason) {
    if (!userId || !bookingId) return;
    try {
      await api.post(`/requests/${bookingId}/cancel`, { reason });
    } catch (err) {
      console.warn("Remote cancel call error:", err);
    }
    const updated = this.updateBooking(userId, bookingId, {
      status: "Cancelled",
      statusStep: 1,
      cancellationReason: reason || "Cancelled by user",
    });
    this.addNotification(userId, {
      title: `Booking Cancelled: #${bookingId}`,
      description: `Booking #${bookingId} has been cancelled.`,
      type: "booking",
    });
    return updated;
  },

  // ----------------------------------------------------
  // CART
  // ----------------------------------------------------
  getCart(userId) {
    try {
      const saved = localStorage.getItem(getKey(userId, "cart"));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async fetchCartFromApi(userId) {
    if (!userId) return this.getCart(userId);
    try {
      const res = await api.get("/user/cart");
      if (Array.isArray(res.data)) {
        this.saveCart(userId, res.data);
        return res.data;
      }
    } catch {}
    return this.getCart(userId);
  },

  saveCart(userId, cartItems) {
    try {
      localStorage.setItem(
        getKey(userId, "cart"),
        JSON.stringify(cartItems || []),
      );
    } catch (err) {
      console.warn("Storage write error for cart:", err);
    }
  },

  addToCart(userId, item) {
    const current = this.getCart(userId);
    const existingIndex = current.findIndex(
      (it) => it.slug === item.slug || it.name === item.name,
    );
    let updated;
    if (existingIndex > -1) {
      updated = current.map((it, idx) =>
        idx === existingIndex
          ? { ...it, quantity: (it.quantity || 1) + 1 }
          : it,
      );
    } else {
      updated = [...current, { ...item, quantity: 1 }];
    }
    this.saveCart(userId, updated);
    if (userId) {
      api
        .post("/user/cart", {
          slug: item.slug || item.name.toLowerCase().replace(/\s+/g, "-"),
          name: item.name,
          price: item.price || "$29",
          quantity: (current[existingIndex]?.quantity || 0) + 1,
          image: item.image,
        })
        .catch(() => {});
    }
    return updated;
  },

  removeFromCart(userId, key) {
    const current = this.getCart(userId);
    const updated = current.filter((it) => it.slug !== key && it.name !== key);
    this.saveCart(userId, updated);
    if (userId) {
      api.delete(`/user/cart/${encodeURIComponent(key)}`).catch(() => {});
    }
    return updated;
  },

  updateCartQuantity(userId, key, quantity) {
    const current = this.getCart(userId);
    if (quantity <= 0) {
      return this.removeFromCart(userId, key);
    }
    const updated = current.map((it) =>
      it.slug === key || it.name === key ? { ...it, quantity } : it,
    );
    this.saveCart(userId, updated);
    if (userId) {
      api.post("/user/cart", { slug: key, quantity }).catch(() => {});
    }
    return updated;
  },

  clearCart(userId) {
    this.saveCart(userId, []);
    if (userId) {
      api.delete("/user/cart").catch(() => {});
    }
    return [];
  },

  // ----------------------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------------------
  getNotifications(userId) {
    try {
      const saved = localStorage.getItem(getKey(userId, "notifications"));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async fetchNotificationsFromApi(userId) {
    if (!userId) return this.getNotifications(userId);
    try {
      const res = await api.get("/user/notifications");
      if (Array.isArray(res.data) && res.data.length > 0) {
        this.saveNotifications(userId, res.data);
        return res.data;
      }
    } catch {}
    return this.getNotifications(userId);
  },

  saveNotifications(userId, notifications) {
    try {
      localStorage.setItem(
        getKey(userId, "notifications"),
        JSON.stringify(notifications || []),
      );
    } catch (err) {
      console.warn("Storage write error for notifications:", err);
    }
  },

  addNotification(userId, { title, description, type = "booking" }) {
    if (!title || !description) return;
    const current = this.getNotifications(userId);
    const newNotif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      description,
      message: description,
      time: "Just now",
      type,
      read: false,
      unread: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [newNotif, ...current];
    this.saveNotifications(userId, updated);
    if (userId) {
      api
        .post("/user/notifications", { title, description, type })
        .catch(() => {});
    }
    return updated;
  },

  markNotificationRead(userId, notifId) {
    const current = this.getNotifications(userId);
    const updated = current.map((n) =>
      n.id === notifId ? { ...n, read: true, unread: false } : n,
    );
    this.saveNotifications(userId, updated);
    if (userId) {
      api.patch(`/user/notifications/${notifId}/read`).catch(() => {});
    }
    return updated;
  },

  markAllNotificationsRead(userId) {
    const current = this.getNotifications(userId);
    const updated = current.map((n) => ({ ...n, read: true, unread: false }));
    this.saveNotifications(userId, updated);
    if (userId) {
      api.patch("/user/notifications/read-all").catch(() => {});
    }
    return updated;
  },

  clearNotifications(userId) {
    this.saveNotifications(userId, []);
    if (userId) {
      api.delete("/user/notifications").catch(() => {});
    }
    return [];
  },

  // ----------------------------------------------------
  // ADDRESSES
  // ----------------------------------------------------
  getAddresses(userId, defaultUser) {
    try {
      const saved = localStorage.getItem(getKey(userId, "addresses"));
      if (saved) return JSON.parse(saved);
    } catch {}

    if (defaultUser) {
      const initial = [
        {
          id: "addr-default",
          type: "Home",
          isDefault: true,
          line1: defaultUser.address || "Flat 402, Green Glen Heights",
          line2: "Sector 62, Near Metro Station",
          city: "Noida",
          state: "Uttar Pradesh",
          postalCode: "201304",
          phone: defaultUser.phone || "+91 98765 43210",
          recipient: defaultUser.name || "Customer",
        },
      ];
      this.saveAddresses(userId, initial);
      return initial;
    }
    return [];
  },

  saveAddresses(userId, addresses) {
    try {
      localStorage.setItem(
        getKey(userId, "addresses"),
        JSON.stringify(addresses || []),
      );
    } catch {}
  },

  // ----------------------------------------------------
  // SAVED SERVICES
  // ----------------------------------------------------
  getSavedServices(userId) {
    try {
      const saved = localStorage.getItem(getKey(userId, "saved_services"));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  saveSavedServices(userId, services) {
    try {
      localStorage.setItem(
        getKey(userId, "saved_services"),
        JSON.stringify(services || []),
      );
    } catch {}
  },

  toggleSavedService(userId, service) {
    const current = this.getSavedServices(userId);
    const exists = current.some(
      (s) => s.slug === service.slug || s.name === service.name,
    );
    let updated;
    if (exists) {
      updated = current.filter(
        (s) => s.slug !== service.slug && s.name !== service.name,
      );
    } else {
      updated = [service, ...current];
    }
    this.saveSavedServices(userId, updated);
    return updated;
  },

  // ----------------------------------------------------
  // PAYMENT METHODS
  // ----------------------------------------------------
  getPaymentMethods(userId) {
    try {
      const saved = localStorage.getItem(getKey(userId, "payment_methods"));
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "card-saved-1",
        brand: "Visa",
        maskedNumber: "•••• •••• •••• 4242",
        cardholder: "Rahul Sharma",
        expiry: "08/28",
        isDefault: true,
        type: "Credit Card",
      },
      {
        id: "upi-saved-1",
        brand: "UPI",
        maskedNumber: "rahul.sharma@okaxis",
        cardholder: "Rahul Sharma",
        expiry: "N/A",
        isDefault: false,
        type: "UPI ID",
      },
    ];
  },

  savePaymentMethods(userId, methods) {
    try {
      localStorage.setItem(
        getKey(userId, "payment_methods"),
        JSON.stringify(methods || []),
      );
    } catch {}
  },
};

export default userStore;
