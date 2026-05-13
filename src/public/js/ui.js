// --- DOM references ---
const allMessages = document.querySelector("#all-messages");
const typingIndicator = document.querySelector("#typing-indicator");

// --- Current user (from cookie) ---
function getCurrentUser() {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("username="))
      ?.split("=")[1] || ""
  );
}

// --- Avatar helpers ---
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

// --- Append a new message to the chat ---
function appendMessage({ user, message, date, isOwn }) {
  const fragment = document.createRange().createContextualFragment(`
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
  allMessages.append(fragment);
  allMessages.scrollTop = allMessages.scrollHeight;
}

// --- Typing indicator ---
const typingUsers = new Set();

function addTypingUser(user) {
  typingUsers.add(user);
  renderTypingIndicator();
}

function removeTypingUser(user) {
  typingUsers.delete(user);
  renderTypingIndicator();
}

function renderTypingIndicator() {
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
