module.exports = (httpServer) => {
  const { Server } = require("socket.io");
  const io = new Server(httpServer);
  io.on("connection", (socket) => {
    socket.on("message", (message) => {
      const cookie = socket.request.headers.cookie;
      const user = cookie.split("=").pop();

      io.emit("message", {
        user,
        message,
        date: new Date().toLocaleTimeString(),
      });
    });
  });
};