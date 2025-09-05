// src/sockets/hub.js
let _io = null;

function _ensure() {
  if (!_io) throw new Error('[hub] Socket.IO not initialized. Call hub.init(io) first.');
  return _io;
}

module.exports = {
  // یک‌بار در server.js صدا بزن
  init(io) {
    _io = io;
  },

  // دسترسی مستقیم (اگر لازم شد)
  io() {
    return _ensure();
  },

  // معادل io.emit(...)
  emit(event, ...args) {
    return _ensure().emit(event, ...args);
  },

  // پاس‌تروهای پراستفاده:
  to(room) {
    // => BroadcastOperator
    return _ensure().to(room);
  },
  in(room) {
    // alias دقیقا مثل to
    return _ensure().in(room);
  },
  of(ns) {
    // => Namespace
    return _ensure().of(ns);
  },

  // میان‌برهای راحت (اختیاری):
  emitTo(room, event, payload) {
    return _ensure().to(room).emit(event, payload);
  },
  emitIn(room, event, payload) {
    return _ensure().in(room).emit(event, payload);
  },
  toNS(ns, room) {
    return _ensure().of(ns).to(room);
  },
  inNS(ns, room) {
    return _ensure().of(ns).in(room);
  },

  // چند یوتیلیتی کاربردی (اختیاری):
  async join(socketId, room) {
    const [sock] = await _ensure().in(socketId).fetchSockets();
    if (sock) await sock.join(room);
  },
  async leave(socketId, room) {
    const [sock] = await _ensure().in(socketId).fetchSockets();
    if (sock) await sock.leave(room);
  },
  async broadcastExcept(room, exceptIds = [], event, payload) {
    return _ensure().to(room).except(exceptIds).emit(event, payload);
  },
};
