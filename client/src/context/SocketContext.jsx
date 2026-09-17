import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { playEmergencyAlertSound } from "../utils/audio";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [pendingOffer, setPendingOffer] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Create socket instance
    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("[Socket] Connected with ID:", newSocket.id);
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("[Socket] Disconnected");
      setConnected(false);
    });

    // Technician incoming emergency dispatch offer
    newSocket.on("emergency_dispatch_offer", (offerData) => {
      console.log("[Socket] Received emergency dispatch offer:", offerData);
      playEmergencyAlertSound();
      setPendingOffer(offerData);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join rooms when user or socket changes
  useEffect(() => {
    if (socket && connected && user) {
      // Join personal room
      socket.emit("join_room", { room: `user_${user.id}` });
      // Join role room
      socket.emit("join_room", { room: `role_${user.role}` });
      console.log(`[Socket] Joined user_${user.id} and role_${user.role}`);
    }
  }, [socket, connected, user]);

  const joinRoom = (room) => {
    if (socket && connected) {
      socket.emit("join_room", { room });
    }
  };

  const leaveRoom = (room) => {
    if (socket && connected) {
      socket.emit("leave_room", { room });
    }
  };

  const clearPendingOffer = () => {
    setPendingOffer(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinRoom,
        leaveRoom,
        pendingOffer,
        clearPendingOffer,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
