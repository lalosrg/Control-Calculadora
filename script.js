document.addEventListener("DOMContentLoaded", () => {
  const amountInput = document.getElementById("amountInput");
  const qtyInputs = document.querySelectorAll(".qty-input");
  const totalCells = document.querySelectorAll(".total-cell");

  const totalBillsEl = document.getElementById("totalBills");
  const changeEl = document.getElementById("change");
  const remainingEl = document.getElementById("remaining");

  const totalBillsCard = document.getElementById("totalBillsCard");
  const changeCard = document.getElementById("changeCard");
  const remainingCard = document.getElementById("remainingCard");
  const totalBillsIcon = document.getElementById("totalBillsIcon");

  const statusText = document.getElementById("statusText");
  const payButton = document.getElementById("payButton");
  const resetButton = document.getElementById("resetButton");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const themeToggle = document.getElementById("themeToggle");

  const successSound = document.getElementById("successSound");

  // ---------- MODO OSCURO ----------
  const savedTheme = localStorage.getItem("calc-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const current = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("calc-theme", current);
  });

  // ---------- HELPER ----------
  function parseNumber(value) {
    const n = parseFloat(String(value).replace(",", "."));
    return isNaN(n) ? 0 : n;
  }

  let paymentCoveredPreviously = false;

  // ---------- CÁLCULO PRINCIPAL ----------
  function updateTotals() {
    const amount = parseNumber(amountInput.value);
    let totalBills = 0;

    qtyInputs.forEach((input, index) => {
      const denom = parseNumber(input.dataset.denom);
      const qty = Math.max(0, parseNumber(input.value));
      input.value = qty; // evitando negativos

      const rowTotal = denom * qty;
      totalBills += rowTotal;

      const cell = totalCells[index];
      if (cell) {
        cell.textContent = "$" + rowTotal.toLocaleString("es-AR");
      }
    });

    totalBillsEl.textContent = "$" + totalBills.toLocaleString("es-AR");

    let change = 0;
    let remaining = 0;

    if (amount > 0) {
      if (totalBills >= amount) {
        change = totalBills - amount;
      } else {
        remaining = amount - totalBills;
      }
    }

    changeEl.textContent = "$" + change.toLocaleString("es-AR");
    remainingEl.textContent = "$" + remaining.toLocaleString("es-AR");

    // reset estados visuales
    totalBillsCard.classList.remove("ok");
    changeCard.classList.remove("change");
    totalBillsIcon.classList.remove("visible");
    payButton.classList.remove("success");

    const paymentCoveredNow = amount > 0 && remaining === 0 && totalBills > 0;

    if (paymentCoveredNow) {
      totalBillsCard.classList.add("ok");
      totalBillsIcon.classList.add("visible");

      // sonido solo al pasar de "no cubierto" a "cubierto"
      if (!paymentCoveredPreviously) {
        if (successSound) {
          successSound.currentTime = 0;
          successSound.play().catch(() => {});
        }
      }
    }

    if (change > 0) {
      changeCard.classList.add("change");
    }

    if (!amount && totalBills === 0) {
      statusText.textContent = "Esperando datos…";
    } else if (remaining > 0) {
      statusText.textContent =
        "Faltan $" + remaining.toLocaleString("es-AR") + " para completar el pago.";
    } else if (paymentCoveredNow) {
      statusText.textContent =
        "Pago cubierto. Vuelto: $" + change.toLocaleString("es-AR");
    } else {
      statusText.textContent = "Revise los datos ingresados.";
    }

    paymentCoveredPreviously = paymentCoveredNow;

    return { amount, totalBills, change, remaining, paymentCoveredNow };
  }

  // Eventos de actualización
  amountInput.addEventListener("input", updateTotals);
  qtyInputs.forEach(input => {
    input.addEventListener("input", () => {
      updateTotals();
    });
  });

  // ---------- ENTER = RECALCULAR ----------
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      updateTotals();
    }
  });

  // ---------- BOTÓN PAGADO ----------
  payButton.addEventListener("click", () => {
    const { amount, totalBills, change, remaining, paymentCoveredNow } = updateTotals();

    if (!amount) {
      alert("Ingrese primero el monto a pagar.");
      return;
    }

    if (totalBills === 0) {
      alert("Ingrese al menos un billete.");
      return;
    }

    if (remaining > 0) {
      alert(
        "El pago todavía no está completo.\n" +
        "Faltan: $" + remaining.toLocaleString("es-AR")
      );
      return;
    }

    // Éxito: animación + sonido + mensaje
    payButton.classList.add("success");
    if (successSound && !paymentCoveredPreviously) {
      successSound.currentTime = 0;
      successSound.play().catch(() => {});
    }

    const mensaje =
      "Pago registrado.\n\n" +
      "Monto a pagar: $" + amount.toLocaleString("es-AR") + "\n" +
      "Total billetes: $" + totalBills.toLocaleString("es-AR") + "\n" +
      "Vuelto: $" + change.toLocaleString("es-AR");

    alert(mensaje);
  });

  // ---------- RESET ----------
  resetButton.addEventListener("click", () => {
    const confirmar = confirm(
      "⚠ ¿Seguro que querés resetear todos los valores?\nEsta acción no se puede deshacer."
    );
    if (!confirmar) return;

    amountInput.value = "";
    qtyInputs.forEach(input => (input.value = 0));
    totalCells.forEach(cell => (cell.textContent = "$0"));

    totalBillsEl.textContent = "$0";
    changeEl.textContent = "$0";
    remainingEl.textContent = "$0";

    totalBillsCard.classList.remove("ok");
    changeCard.classList.remove("change");
    totalBillsIcon.classList.remove("visible");
    payButton.classList.remove("success");
    paymentCoveredPreviously = false;

    statusText.textContent = "Valores reseteados.";
  });

  // ---------- PANTALLA COMPLETA ----------
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // cálculo inicial
  updateTotals();
});
