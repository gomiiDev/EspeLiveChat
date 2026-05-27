// --- DOM references ---
const allMessages = document.querySelector("#all-messages");
const typingIndicator = document.querySelector("#typing-indicator");
const chatUserCount = document.querySelector("#chat-user-count");
const emojiToggle = document.querySelector("#emoji-toggle");
const emojiPicker = document.querySelector("#emoji-picker");

const EMOJIS = ["😀", "😂", "😍", "😎", "🤝", "🔥", "🎉", "🦖", "🌊", "💬"];

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

function buildTextElement(tagName, className, value) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = value;
  return element;
}

// --- Append a new message to the chat ---
function appendMessage({ user, message, date, isOwn }) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${isOwn ? "own" : "other"}`;

  const imageContainer = document.createElement("div");
  imageContainer.className = "image-container";
  imageContainer.innerHTML = buildAvatar(user);

  const messageBody = document.createElement("div");
  messageBody.className = "message-body";

  const userInfo = document.createElement("div");
  userInfo.className = "user-info";

  const username = buildTextElement("span", "username", user);
  const time = buildTextElement("span", "time", date);
  const paragraph = buildTextElement("p", "", message);

  userInfo.append(username, time);
  messageBody.append(userInfo, paragraph);
  wrapper.append(imageContainer, messageBody);

  allMessages.append(wrapper);
  requestAnimationFrame(() => {
    wrapper.scrollIntoView({ behavior: "smooth", block: "end" });
  });
}

function renderUserCount(total) {
  chatUserCount.textContent = `Usuarios conectados: ${total}`;
}

function insertAtCursor(input, value) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const currentValue = input.value;

  input.value = `${currentValue.slice(0, start)}${value}${currentValue.slice(end)}`;
  input.focus();

  const newCursorPosition = start + value.length;
  input.setSelectionRange(newCursorPosition, newCursorPosition);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function closeEmojiPicker() {
  emojiPicker.hidden = true;
}

function positionEmojiPicker() {
  const rect = emojiToggle.getBoundingClientRect();
  const pickerWidth = emojiPicker.offsetWidth || 232;
  const gap = 10;
  let left = rect.left;
  let bottom = window.innerHeight - rect.top + gap;

  // Clamp so picker doesn't overflow the right edge
  if (left + pickerWidth > window.innerWidth - 8) {
    left = window.innerWidth - pickerWidth - 8;
  }
  if (left < 8) left = 8;

  emojiPicker.style.left = `${left}px`;
  emojiPicker.style.bottom = `${bottom}px`;
}

function toggleEmojiPicker() {
  emojiPicker.hidden = !emojiPicker.hidden;
  if (!emojiPicker.hidden) {
    positionEmojiPicker();
  }
}

function renderEmojiPicker(messageInput) {
  emojiPicker.replaceChildren();

  EMOJIS.forEach((emoji) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "emoji-option";
    button.textContent = emoji;
    button.setAttribute("aria-label", `Insertar ${emoji}`);
    button.addEventListener("click", () => {
      insertAtCursor(messageInput, emoji);
      closeEmojiPicker();
    });
    emojiPicker.append(button);
  });
}

function initializeEmojiPicker(messageInput) {
  // Move picker to body so it's never clipped by parent overflow rules
  document.body.append(emojiPicker);

  renderEmojiPicker(messageInput);

  emojiToggle.addEventListener("click", () => {
    toggleEmojiPicker();
  });

  document.addEventListener("click", (event) => {
    if (emojiPicker.hidden) {
      return;
    }

    if (!emojiPicker.contains(event.target) && !emojiToggle.contains(event.target)) {
      closeEmojiPicker();
    }
  });
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

// --- System notification (e.g. user left) ---
function appendSystemNotification(text) {
  const notice = document.createElement("p");
  notice.className = "system-notification";
  notice.textContent = text;
  allMessages.append(notice);
  requestAnimationFrame(() => {
    notice.scrollIntoView({ behavior: "smooth", block: "end" });
  });
}
