const form = document.querySelector("#form");
const submitBtn = document.querySelector("#submit-btn");
const formError = document.querySelector("#form-error");

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function clearError() {
  formError.hidden = true;
  formError.textContent = "";
}

function getFormValues() {
  return {
    username: document.querySelector("#username").value.trim(),
    password: document.querySelector("#password").value,
  };
}

function validateForm({ username, password }) {
  if (!username) return "El nombre de usuario es obligatorio";
  if (!password) return "La contraseña es obligatoria";
  return null;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const values = getFormValues();
  const validationError = validateForm(values);

  if (validationError) {
    showError(validationError);
    return;
  }

  submitBtn.disabled = true;

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || "Error al iniciar sesión");
      return;
    }

    document.location.href = "/";
  } catch {
    showError("No se pudo conectar con el servidor");
  } finally {
    submitBtn.disabled = false;
  }
});
