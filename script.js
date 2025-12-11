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
  const themeToggle = document.getElementById("themeToggle");

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

  // ---------- UTIL ----------
  function parseNumber(value) {
    const n = parseFloat(String(value).replace(",", "."));
    return isNaN(n) ? 0 : n;
  }

  // ---------- CÁLCULOS ----------
  function updateTotals() {
    const amount = parseNumber(amountInput.value);
    let totalBills = 0;

    qtyInputs.forEach((input, index) => {
      const denom = parseNumber(input.dataset.denom);
      const qty = parseNumber(input.value);
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

    // ----- Resaltar tarjetas -----
    totalBillsCard.classList.remove("ok");
    changeCard.classList.remove("change");
    totalBillsIcon.classList.remove("visible");

    if (amount > 0 && totalBills >= amount) {
      // Total cubre el monto
      totalBillsCard.classList.add("ok");
      totalBillsIcon.classList.add("visible");
    }

    if (change > 0) {
      // Hay vuelto
      changeCard.classList.add("change");
    }

    // ----- Texto de estado y botón -----
    if (!amount && totalBills === 0) {
      statusText.textContent = "Esperando datos…";
      payButton.classList.remove("success", "warning");
    } else if (remaining > 0) {
      statusText.textContent =
        "Faltan $" + remaining.toLocaleString("es-AR") + " para completar el pago.";
      payButton.classList.add("warning");
      payButton.classList.remove("success");
    } else if (amount > 0 && remaining === 0) {
      statusText.textContent =
        "Pago cubierto. Vuelto: $" + change.toLocaleString("es-AR");
      payButton.classList.add("success");
      payButton.classList.remove("warning");
    } else {
      statusText.textContent = "Revise los datos ingresados.";
      payButton.classList.remove("success", "warning");
    }

    return { amount, totalBills, change, remaining };
  }

  // Eventos de actualización
  amountInput.addEventListener("input", updateTotals);
  qtyInputs.forEach(input => {
    input.addEventListener("input", () => {
      if (input.value < 0) input.value = 0;
      updateTotals();
    });
  });

  // ---------- BOTÓN PAGADO ----------
  payButton.addEventListener("click", () => {
    const { amount, totalBills, change, remaining } = updateTotals();

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
          "Faltan: $" +
          remaining.toLocaleString("es-AR")
      );
      return;
    }

    const mensaje =
      "Pago registrado.\n" +
      "Monto a pagar: $" +
      amount.toLocaleString("es-AR") +
      "\nTotal de billetes: $" +
      totalBills.toLocaleString("es-AR") +
      "\nVuelto: $" +
      change.toLocaleString("es-AR");

    alert(mensaje);
  });

  // Cálculo inicial
  updateTotals();
});
