const { Server } = require('socket.io');

let io = null;

const initSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[SocketIO] Client connected: ${socket.id}`);

    // Join user's village room for broadcast updates
    socket.on('join-village', (village) => {
      if (village) {
        socket.join(`village:${village}`);
        console.log(`[SocketIO] ${socket.id} joined village room: ${village}`);
      }
    });

    // Join user-specific room for direct notifications
    socket.on('join-user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[SocketIO] ${socket.id} joined user room: ${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[SocketIO] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[SocketIO] Initialized successfully');
  return io;
};

// Emit new complaint to sarpanch of the village
const emitNewComplaint = (village, complaint) => {
  if (io) {
    io.to(`village:${village}`).emit('new-complaint', complaint);
  }
};

// Emit complaint status update to the complaint owner
const emitComplaintUpdate = (userId, complaint) => {
  if (io) {
    io.to(`user:${userId}`).emit('complaint-updated', complaint);
  }
};

// Emit new announcement to village
const emitNewAnnouncement = (village, announcement) => {
  if (io) {
    io.to(`village:${village}`).emit('new-announcement', announcement);
  }
};

// Emit notification to a specific user
const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
};

module.exports = { initSocketIO, emitNewComplaint, emitComplaintUpdate, emitNewAnnouncement, emitNotification };
