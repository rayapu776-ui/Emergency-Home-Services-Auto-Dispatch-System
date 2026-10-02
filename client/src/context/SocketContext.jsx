import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { playEmergencyAlertSound } from "../utils/audio";

const SocketContext = createContext(null);
let sharedSocket = null;
let activeSocketConsumers = 0;
let socketReleaseTimer = null;

function acquireSocket() {
  if (socketReleaseTimer) {
    window.clearTimeout(socketReleaseTimer);
    socketReleaseTimer = null;
  }
  if (!sharedSocket) {
    sharedSocket = io(window.location.origin, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      timeout: 20000,
    });
  }
  activeSocketConsumers += 1;
  return sharedSocket;
}

function releaseSocket(socket) {
  activeSocketConsumers = Math.max(0, activeSocketConsumers - 1);
  if (activeSocketConsumers === 0) {
    socketReleaseTimer = window.setTimeout(() => {
      if (activeSocketConsumers === 0 && sharedSocket === socket) {
        socket.disconnect();
        sharedSocket = null;
      }
      socketReleaseTimer = null;
    }, 0);
  }
}

function getSocketAuthToken(fallbackToken, room = "") {
  if (room === "role_admin" || window.location.pathname.startsWith("/admin")) {
    return (
      localStorage.getItem("argent_admin_token") ||
      sessionStorage.getItem("argent_admin_token") ||
      fallbackToken
    );
  }
  if (
    room === "role_technician" ||
    window.location.pathname.startsWith("/technician")
  ) {
    return (
      localStorage.getItem("argent_technician_token") ||
      sessionStorage.getItem("argent_technician_token") ||
      fallbackToken
    );
  }
  return localStorage.getItem("emergency_token") || fallbackToken;
}

function getActiveSessionToken(fallbackToken, currentPath) {
  if (currentPath.startsWith("/admin")) {
    return (
      localStorage.getItem("argent_admin_token") ||
      sessionStorage.getItem("argent_admin_token")
    );
  }
  if (currentPath.startsWith("/technician")) {
    return (
      localStorage.getItem("argent_technician_token") ||
      sessionStorage.getItem("argent_technician_token")
    );
  }
  return localStorage.getItem("emergency_token") || fallbackToken;
}

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [pendingOffer, setPendingOffer] = useState(null);
  const [sessionToken, setSessionToken] = useState(() =>
    getActiveSessionToken(token, location.pathname),
  );

  useEffect(() => {
    const syncSession = () =>
      setSessionToken(getActiveSessionToken(token, location.pathname));
    window.addEventListener("argent:session-changed", syncSession);
    window.addEventListener("storage", syncSession);
    syncSession();
    return () => {
      window.removeEventListener("argent:session-changed", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, [location.pathname, token]);

  useEffect(() => {
    if (!sessionToken) {
      setSocket(null);
      setConnected(false);
      setPendingOffer(null);
      return undefined;
    }
    const newSocket = acquireSocket();
    setSocket(newSocket);

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleOffer = (offerData) => {
      playEmergencyAlertSound();
      setPendingOffer(offerData);
    };
    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("emergency_dispatch_offer", handleOffer);

    if (newSocket.connected) setConnected(true);

    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("emergency_dispatch_offer", handleOffer);
      releaseSocket(newSocket);
    };
  }, [sessionToken]);

  // Join rooms when user or socket changes
  useEffect(() => {
    if (socket && connected && user) {
      const currentPath = window.location.pathname;
      if (
        (currentPath.startsWith("/technician") && user.role !== "technician") ||
        (currentPath.startsWith("/admin") && user.role !== "admin")
      ) {
        return;
      }
      const authToken = getSocketAuthToken(token, `user_${user.id}`);
      const userRoom = `user_${user.id}`;
      // Join personal room
      socket.emit("join_room", { room: userRoom, token: authToken });
      // Join role room
      const roleRoom = `role_${user.role}`;
      socket.emit("join_room", {
        room: roleRoom,
        token: getSocketAuthToken(token, roleRoom),
      });
      console.log(`[Socket] Joined user_${user.id} and role_${user.role}`);
      return () => {
        socket.emit("leave_room", { room: userRoom });
        socket.emit("leave_room", { room: roleRoom });
      };
    }
    return undefined;
  }, [socket, connected, location.pathname, sessionToken, user, token]);

  const joinRoom = useCallback(
    (room) => {
      if (socket && connected) {
        socket.emit("join_room", {
          room,
          token: getSocketAuthToken(token, room),
        });
      }
    },
    [connected, socket, token],
  );

  const leaveRoom = useCallback(
    (room) => {
      if (socket && connected) {
        socket.emit("leave_room", { room });
      }
    },
    [connected, socket],
  );

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
