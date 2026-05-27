const form = document.querySelector("#form");
const loginButton = document.querySelector("#login");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.querySelector("#username").value.trim();

  if (!username) {
    alert("Por favor ingresa un nombre de usuario");
    return;
  }

  loginButton.disabled = true;

  try {
    const response = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Error al registrarse");
      return;
    }

    document.location.href = "/";
  } catch {
    alert("No se pudo conectar con el servidor");
  } finally {
    loginButton.disabled = false;
  }
});
