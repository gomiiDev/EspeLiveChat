const socket = io();

const send = document.querySelector("#send-message");
const allMessages = document.querySelector("#all-messages");
const messageInput = document.querySelector("#message");
const typingIndicator = document.querySelector("#typing-indicator");

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
  const msg = document.createRange().createContextualFragment(`
    <div class="message">
      <div class="image-container">
        <img src="/img/paulo.png" alt="" />
      </div>
      <div class="message-body">
        <div class="user-info">
          <span class="username">${user}</span>
          <span class="time">${date}</span>
          <p>
            ${message}
          </p>
        </div>
      </div>
    </div>
  `);
  allMessages.append(msg);
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
