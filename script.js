let rawData = [];
let includeNull = true;
let selectedAges = ["18-25", "26-35", "36-45", "46+"];

const colores = ["Rojo", "Azul", "Verde", "Amarillo", "Naranja", "Morado"];
const edades = ["18-25", "26-35", "36-45", "46+"];

const pieChartCtx = document.getElementById("pieChart").getContext("2d");
const barChartCtx = document.getElementById("barChart").getContext("2d");

let pieChart;
let barChart;

fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    rawData = data;
    initControls();
    renderPieChart();
    renderBarChart("Azul"); // Inicial por defecto
  });

function initControls() {
  const container = document.querySelector(".filtros");
  edades.forEach((edad) => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${edad}" checked> ${edad}`;
    container.appendChild(label);
  });

  container.querySelectorAll("input[type=checkbox]").forEach((input) => {
    input.addEventListener("change", () => {
      selectedAges = Array.from(
        container.querySelectorAll("input:checked")
      ).map((el) => el.value);
      updateCharts();
    });
  });

  document
    .getElementById("toggleNulls")
    .addEventListener("change", (e) => {
      includeNull = e.target.checked;
      updateCharts();
    });
}

function getFilteredData() {
  return rawData.filter((d) => {
    if (!d.edad && !includeNull) return false;
    return !d.edad || selectedAges.includes(d.edad);
  });
}

function renderPieChart() {
  const data = getFilteredData();
  const conteo = colores.map(
    (color) => data.filter((d) => d.color === color).length
  );

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(pieChartCtx, {
    type: "pie",
    data: {
      labels: colores,
      datasets: [
        {
          label: "Preferencias por color",
          data: conteo,
          backgroundColor: colores.map(getColor),
        },
      ],
    },
    options: {
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const colorSeleccionado = colores[elements[0].index];
          renderBarChart(colorSeleccionado);
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.raw} personas`;
            },
          },
        },
        title: {
          display: true,
          text: "Preferencias por Color",
        },
      },
    },
  });
}

function renderBarChart(colorSeleccionado) {
  const data = getFilteredData().filter((d) => d.color === colorSeleccionado);
  const porEdad = edades.map(
    (rango) => data.filter((d) => d.edad === rango).length
  );

  if (barChart) barChart.destroy();

  barChart = new Chart(barChartCtx, {
    type: "bar",
    data: {
      labels: edades,
      datasets: [
        {
          label: `Preferencias de ${colorSeleccionado} por edad`,
          data: porEdad,
          backgroundColor: getTonosPorEdad(colorSeleccionado),
        },
      ],
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.raw} personas`;
            },
          },
        },
        title: {
          display: true,
          text: `Preferencias de ${colorSeleccionado} por Edad`,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          stepSize: 1,
          title: {
            display: true,
            text: 'Cantidad de personas'
          }
        },
      },
    },
  });
}

function updateCharts() {
  renderPieChart();
  const colorActual = barChart?.data?.datasets?.[0]?.label?.split(" ")[2] || "Azul";
  renderBarChart(colorActual);
}

function getColor(color) {
  const map = {
    Rojo: "#dc3545",
    Azul: "#007bff",
    Verde: "#28a745",
    Amarillo: "#ffc107",
    Naranja: "#fd7e14",
    Morado: "#6f42c1",
  };
  return map[color] || "#ccc";
}

function getTonosPorEdad(color) {
  const base = getColor(color);
  const hexToRGB = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return [bigint >> 16 & 255, bigint >> 8 & 255, bigint & 255];
  };

  const [r, g, b] = hexToRGB(base);
  const opacidades = [1, 0.8, 0.6, 0.4];
  return opacidades.map(op => `rgba(${r}, ${g}, ${b}, ${op})`);
}
