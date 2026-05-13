// --- Socket connection (depends on ui.js loaded first) ---
const socket = io();

const currentUser = getCurrentUser();
const send = document.querySelector("#send-message");
const messageInput = document.querySelector("#message");

initializeEmojiPicker(messageInput);

function getCleanMessage() {
  return messageInput.value.trim();
}

function stopTyping() {
  if (!isTyping) {
    return;
  }

  isTyping = false;
  clearTimeout(typingTimeout);
  socket.emit("stopTyping");
}

// --- Typing debounce ---
let isTyping = false;
let typingTimeout = null;

function sendMessage() {
  const cleanMessage = getCleanMessage();

  if (!cleanMessage) {
    messageInput.value = "";
    stopTyping();
    return;
  }

  stopTyping();
  socket.emit("message", cleanMessage);
  messageInput.value = "";
}

messageInput.addEventListener("input", () => {
  if (!isTyping) {
    isTyping = true;
    socket.emit("typing");
  }
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    stopTyping();
  }, 1500);
});

// --- Send message ---
send.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.shiftKey) {
    return;
  }

  event.preventDefault();
  sendMessage();
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

socket.on("userCount", ({ total }) => {
  renderUserCount(total);
});
