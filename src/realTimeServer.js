module.exports = (httpServer) => {
  const { Server } = require("socket.io");
  const io = new Server(httpServer);

  const normalizeMessage = (message) => {
    if (typeof message !== "string") {
      return "";
    }

    return message.trim();
  };

  io.on("connection", (socket) => {
    const getUser = () => {
      const cookie = socket.request.headers.cookie || "";
      return cookie.split("=").pop();
    };

    socket.on("message", (message) => {
      const user = getUser();
      const cleanMessage = normalizeMessage(message);

      if (!user || !cleanMessage) {
        return;
      }

      io.emit("message", {
        user,
        message: cleanMessage,
        date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    });

    socket.on("typing", () => {
      const user = getUser();
      socket.broadcast.emit("typing", { user });
    });

    socket.on("stopTyping", () => {
      const user = getUser();
      socket.broadcast.emit("stopTyping", { user });
    });
  });
};
