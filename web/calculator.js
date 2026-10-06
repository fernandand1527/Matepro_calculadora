const form = document.querySelector("#calculator-form");

if (form) {
  const firstInput = document.querySelector("#num1");
  const secondInput = document.querySelector("#num2");
  const resultOutput = document.querySelector("#result");
  const expressionOutput = document.querySelector("#expression");
  const feedback = document.querySelector("#feedback");
  const historyEntry = document.querySelector("#history-entry");
  const historyCount = document.querySelector("#history-count");
  const operationButtons = [...document.querySelectorAll(".operation-button")];
  let selectedOperator = "+";
  let calculationCount = 0;

  const labels = { "+": "Sumar", "-": "Restar", "*": "Multiplicar", "/": "Dividir", "%": "Módulo", "**": "Potencia" };
  const symbols = { "*": "×", "/": "÷", "-": "−", "**": "^" };
  const formatNumber = (number) => new Intl.NumberFormat("es-CO", { maximumSignificantDigits: 12 }).format(number);

  operationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedOperator = button.dataset.operator;
      operationButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const rawFirst = firstInput.value.trim();
    const rawSecond = secondInput.value.trim();

    if (!rawFirst || !rawSecond) {
      feedback.textContent = "Completa los dos valores para calcular.";
      feedback.classList.add("has-error");
      (rawFirst ? secondInput : firstInput).focus();
      return;
    }

    const first = Number(rawFirst);
    const second = Number(rawSecond);
    if (!Number.isFinite(first) || !Number.isFinite(second)) {
      feedback.textContent = "Ingresa valores numéricos válidos.";
      feedback.classList.add("has-error");
      return;
    }

    if ((selectedOperator === "/" || selectedOperator === "%") && second === 0) {
      feedback.textContent = "No se puede dividir entre cero.";
      feedback.classList.add("has-error");
      secondInput.focus();
      return;
    }

    const operations = {
      "+": () => first + second,
      "-": () => first - second,
      "*": () => first * second,
      "/": () => first / second,
      "%": () => first % second,
      "**": () => first ** second,
    };
    const result = operations[selectedOperator]();

    if (!Number.isFinite(result)) {
      feedback.textContent = "El resultado está fuera del rango calculable.";
      feedback.classList.add("has-error");
      return;
    }

    const expression = `${formatNumber(first)} ${symbols[selectedOperator] || selectedOperator} ${formatNumber(second)}`;
    resultOutput.textContent = formatNumber(result);
    expressionOutput.textContent = expression;
    feedback.textContent = `${labels[selectedOperator]} · cálculo correcto`;
    feedback.classList.remove("has-error");
    historyEntry.textContent = `${expression} = ${formatNumber(result)}`;
    calculationCount += 1;
    historyCount.textContent = String(calculationCount).padStart(2, "0");
    resultOutput.classList.remove("is-updated");
    requestAnimationFrame(() => resultOutput.classList.add("is-updated"));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      firstInput.value = "";
      secondInput.value = "";
      firstInput.focus();
    }
  });
}