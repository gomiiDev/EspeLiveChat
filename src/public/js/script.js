const socket = io();

const send = document.querySelector("#send-message");
const allMessages = document.querySelector("#all-messages");
const messageInput = document.querySelector("#message");
const typingIndicator = document.querySelector("#typing-indicator");

// --- Read current user from cookie ---
const currentUser = document.cookie
  .split("; ")
  .find((row) => row.startsWith("username="))
  ?.split("=")[1] || "";

// --- Avatar: deterministic color derived from username ---
function getAvatarColor(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return { bg: `hsl(${hue}, 60%, 45%)`, text: "#ffffff" };
}

function buildAvatar(username) {
  const { bg, text } = getAvatarColor(username);
  const letter = username.charAt(0).toUpperCase();
  return `<div class="avatar" style="background-color:${bg};color:${text};">${letter}</div>`;
}

// --- Typing indicator state ---
const typingUsers = new Set();

function updateTypingIndicator() {
  if (typingUsers.size === 0) {
    typingIndicator.textContent = "";
    return;
  }
  const names = Array.from(typingUsers);
  if (names.length === 1) {
    typingIndicator.textContent = `${names[0]} está escribiendo...`;
  } else if (names.length === 2) {
    typingIndicator.textContent = `${names[0]} y ${names[1]} están escribiendo...`;
  } else {
    typingIndicator.textContent = "Varios usuarios están escribiendo...";
  }
}

// --- Emit typing events with debounce ---
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

// --- Receive messages ---
socket.on("message", ({ user, message, date }) => {
  const isOwn = user === currentUser;
  const msg = document.createRange().createContextualFragment(`
    <div class="message ${isOwn ? "own" : "other"}">
      <div class="image-container">
        ${buildAvatar(user)}
      </div>
      <div class="message-body">
        <div class="user-info">
          <span class="username">${user}</span>
          <span class="time">${date}</span>
        </div>
        <p>${message}</p>
      </div>
    </div>
  `);
  allMessages.append(msg);
  allMessages.scrollTop = allMessages.scrollHeight;
});

// --- Receive typing events from other users only (server uses broadcast) ---
socket.on("typing", ({ user }) => {
  typingUsers.add(user);
  updateTypingIndicator();
});

socket.on("stopTyping", ({ user }) => {
  typingUsers.delete(user);
  updateTypingIndicator();
});
