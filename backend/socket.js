/**
 Socket.io signaling + matchmaking logic
 - Maintains a queue for random pairing
 - Emits signaling events between paired sockets
*/
import { randomUUID } from 'crypto';

let waitingQueue = []; // array of socket ids
const pairs = new Map(); // socketId -> partnerSocketId

export function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('find_stranger', () => {
      console.log('find_stranger from', socket.id);
      // If queue empty, add and wait
      if (waitingQueue.length === 0) {
        waitingQueue.push(socket.id);
        socket.emit('searching');
      } else {
        // pair with first in queue (avoid same socket)
        const partnerId = waitingQueue.shift();
        if (!partnerId || partnerId === socket.id) {
          waitingQueue.push(socket.id);
          socket.emit('searching');
          return;
        }
        // create room
        const roomId = randomUUID();
        pairs.set(socket.id, partnerId);
        pairs.set(partnerId, socket.id);
        // join rooms for convenience
        socket.join(roomId);
        io.to(partnerId).socketsJoin(roomId);
        // tell both they are matched and their partner id
        socket.emit('matched', { roomId, partnerId });
        io.to(partnerId).emit('matched', { roomId, partnerId: socket.id });
        // ready to start handshake
        io.to(roomId).emit('ready');
      }
    });

    socket.on('signal', ({ to, type, data }) => {
      // Forward signaling data to partner
      if (!to) return;
      io.to(to).emit('signal', { from: socket.id, type, data });
    });

    socket.on('message', ({ roomId, text }) => {
      io.to(roomId).emit('message', { from: socket.id, text });
    });

    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('typing', { from: socket.id, isTyping });
    });

    socket.on('skip', ({ roomId }) => {
      // notify partner and cleanup room
      socket.to(roomId).emit('skipped');
      // attempt to remove both from pairs
      const partner = pairs.get(socket.id);
      if (partner) {
        pairs.delete(partner);
        pairs.delete(socket.id);
      }
      // leave room
      try { socket.leave(roomId); } catch(e){}
    });

    socket.on('disconnect', (reason) => {
      console.log('disconnect', socket.id, reason);
      // If socket was waiting, remove it
      waitingQueue = waitingQueue.filter(sid => sid !== socket.id);
      const partner = pairs.get(socket.id);
      if (partner) {
        // notify partner
        io.to(partner).emit('partner_disconnected');
        pairs.delete(partner);
        pairs.delete(socket.id);
      }
    });

    // allow manual leave
    socket.on('leave', ({ roomId }) => {
      const partner = pairs.get(socket.id);
      if (partner) {
        io.to(partner).emit('partner_left');
        pairs.delete(partner);
        pairs.delete(socket.id);
      }
      try { socket.leave(roomId); } catch(e){}
    });
  });
}
