import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token || !user) return;

    const socket = io('http://10.110.158.175:5000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('[Socket] Connected:', socket.id);
      // Join user's village room
      if (user?.village) socket.emit('join-village', user.village);
      // Join user's personal room
      socket.emit('join-user', user?.id);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('[Socket] Disconnected');
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
  }, [token, user?.id, user?.village]);

  return (
    <SocketContext.Provider value={{ connected }}>
      {children}
    </SocketContext.Provider>
  );
};
