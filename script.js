let rawData = [];
let includeNull = true;
let selectedAges = ["18-25", "26-35", "36-45", "46+"];
const colores = ["Rojo", "Azul", "Verde", "Amarillo", "Naranja", "Morado"];
const edades = ["18-25", "26-35", "36-45", "46+"];

const barChartCtx = document.getElementById("barChart").getContext("2d");
const pieChartCtx = document.getElementById("pieChart").getContext("2d");

let barChart;
let pieChart;

fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    rawData = data;
    initControls();
    renderBarChart();
    renderPieChart("Azul"); // Valor por defecto para la segunda gráfica
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

function renderBarChart() {
  const data = getFilteredData();
  const conteo = colores.map(
    (color) => data.filter((d) => d.color === color).length
  );

  if (barChart) barChart.destroy();

  barChart = new Chart(barChartCtx, {
    type: "bar",
    data: {
      labels: colores,
      datasets: [
        {
          label: "Cantidad de personas por color",
          data: conteo,
          backgroundColor: colores.map(getColor),
        },
      ],
    },
    options: {
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const colorIndex = elements[0].index;
          renderPieChart(colores[colorIndex]);
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw}`;
            },
          },
        },
      },
    },
  });
}

function renderPieChart(colorSeleccionado) {
  const data = getFilteredData().filter((d) => d.color === colorSeleccionado);
  const porEdad = edades.map(
    (rango) => data.filter((d) => d.edad === rango).length
  );

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(pieChartCtx, {
    type: "pie",
    data: {
      labels: edades,
      datasets: [
        {
          label: `Preferencias de ${colorSeleccionado} por edad`,
          data: porEdad,
          backgroundColor: edades.map(getColorForAge),
        },
      ],
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const edad = context.label;
              const cantidad = context.raw;
              return `Edad ${edad}: ${cantidad} personas`;
            },
          },
        },
        title: {
          display: true,
          text: `Preferencias de ${colorSeleccionado} por edad`,
        },
      },
    },
  });
}

function updateCharts() {
  renderBarChart();
  const colorActual = pieChart?.data?.datasets?.[0]?.label?.split(" ")[2] || "Azul";
  renderPieChart(colorActual);
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

function getColorForAge(edad) {
  const map = {
    "18-25": "#A3E4DB",
    "26-35": "#F9A825",
    "36-45": "#F06292",
    "46+": "#BA68C8",
  };
  return map[edad] || "#ddd";
}
