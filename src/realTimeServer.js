const Message = require("./models/Message");

const HISTORY_LIMIT = 50;

module.exports = (httpServer) => {
  const { Server } = require("socket.io");
  const io = new Server(httpServer);

  const normalizeMessage = (message) => {
    if (typeof message !== "string") {
      return "";
    }

    return message.trim();
  };

  const emitUserCount = () => {
    io.emit("userCount", { total: io.engine.clientsCount });
  };

  io.on("connection", async (socket) => {
    const getUser = () => {
      const cookie = socket.request.headers.cookie || "";
      return cookie.split("=").pop();
    };

    emitUserCount();

    try {
      const recentMessages = await Message.find()
        .sort({ createdAt: 1 })
        .limit(HISTORY_LIMIT)
        .lean();

      const history = recentMessages.map((doc) => ({
        user: doc.username,
        message: doc.message,
        date: new Date(doc.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      socket.emit("history", history);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }

    socket.on("message", async (message) => {
      const user = getUser();
      const cleanMessage = normalizeMessage(message);

      if (!user || !cleanMessage) {
        return;
      }

      const date = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      try {
        await Message.create({ username: user, message: cleanMessage });
      } catch (error) {
        console.error("Error al guardar mensaje:", error);
      }

      io.emit("message", {
        user,
        message: cleanMessage,
        date,
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

    socket.on("disconnect", () => {
      emitUserCount();
    });
  });
};

