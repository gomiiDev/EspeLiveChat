// --- Socket connection (depends on ui.js loaded first) ---
const socket = io();

const currentUser = getCurrentUser();
const send = document.querySelector("#send-message");
const messageInput = document.querySelector("#message");

// --- Typing debounce ---
let isTyping = false;
let typingTimeout = null;

messageInput.addEventListener("input", () => {
  if (!isTyping) {
    isTyping = true;
    socket.emit("typing");
  }
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping = false;
    socket.emit("stopTyping");
  }, 1500);
});

// --- Send message ---
send.addEventListener("click", () => {
  if (isTyping) {
    isTyping = false;
    clearTimeout(typingTimeout);
    socket.emit("stopTyping");
  }
  socket.emit("message", messageInput.value);
  messageInput.value = "";
});

// --- Receive: new message ---
socket.on("message", ({ user, message, date }) => {
  appendMessage({ user, message, date, isOwn: user === currentUser });
});

// --- Receive: typing indicators ---
socket.on("typing", ({ user }) => {
  addTypingUser(user);
});

socket.on("stopTyping", ({ user }) => {
  removeTypingUser(user);
});
