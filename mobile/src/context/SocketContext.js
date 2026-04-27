import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { getApiBaseUrl } from '../config/api';

export const SocketContext = createContext();

// Derive socket URL from the API base URL (strip /api suffix)
const getSocketUrl = () => {
  const base = getApiBaseUrl(); // e.g. https://smart-panchayat-api.onrender.com/api
  return base.replace('/api', '');  // → https://smart-panchayat-api.onrender.com
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token || !user) return;

    const socketUrl = getSocketUrl();

    const socket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('[Socket] Connected:', socket.id, '→', socketUrl);
      if (user?.village) socket.emit('join-village', user.village);
      socket.emit('join-user', user?.id || user?._id);
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.log('[Socket] Connection error:', err.message);
    });

    socket.on('new-complaint', (complaint) => {
      console.log('[Socket] New complaint:', complaint.title);
    });

    socket.on('complaint-updated', (complaint) => {
      console.log('[Socket] Complaint updated:', complaint.title);
    });

    socket.on('new-announcement', (announcement) => {
      console.log('[Socket] New announcement:', announcement.title);
    });

    socket.on('notification', (notification) => {
      console.log('[Socket] Notification:', notification.title);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user?.id, user?._id, user?.village]);

  return (
    <SocketContext.Provider value={{ connected, socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};
