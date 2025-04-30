let datos = [];
let graficoPastel, graficoBarras, graficoDetalle;

async function cargarDatos() {
  const respuesta = await fetch('data.json');
  datos = await respuesta.json();
  actualizarGraficos();
}

function obtenerFiltros() {
  const edades = Array.from(document.querySelectorAll('.filtroEdad:checked')).map(e => e.value);
  const incluirNulos = document.getElementById('incluirNulos').checked;
  return { edades, incluirNulos };
}

function filtrarDatos() {
  const { edades, incluirNulos } = obtenerFiltros();
  return datos.filter(item =>
    (item.edad === null && incluirNulos) || edades.includes(item.edad)
  );
}

function contarColores(dataFiltrada) {
  const conteo = {};
  dataFiltrada.forEach(({ color }) => {
    conteo[color] = (conteo[color] || 0) + 1;
  });
  return conteo;
}

function contarColorEdad(dataFiltrada) {
  const resultado = {};
  dataFiltrada.forEach(({ color, edad }) => {
    if (!resultado[color]) resultado[color] = {};
    resultado[color][edad] = (resultado[color][edad] || 0) + 1;
  });
  return resultado;
}

function generarColores(n) {
  const base = ['#e63946', '#f1fa8c', '#90be6d', '#577590', '#f4a261', '#9b5de5'];
  return Array.from({ length: n }, (_, i) => base[i % base.length]);
}

function actualizarGraficos() {
  const dataFiltrada = filtrarDatos();
  const porColor = contarColores(dataFiltrada);
  const porColorEdad = contarColorEdad(dataFiltrada);

  const colores = Object.keys(porColor);
  const cantidades = Object.values(porColor);
  const coloresHex = generarColores(colores.length);

  // Pastel
  if (graficoPastel) graficoPastel.destroy();
  graficoPastel = new Chart(document.getElementById('graficoPastel'), {
    type: 'pie',
    data: {
      labels: colores,
      datasets: [{
        data: cantidades,
        backgroundColor: coloresHex
      }]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed} votos`
          }
        }
      },
      onClick: (e, elementos) => {
        if (elementos.length > 0) {
          const index = elementos[0].index;
          const color = colores[index];
          mostrarDetalle(color, porColorEdad[color]);
        }
      }
    }
  });

  // Barras
  const rangos = ["18-25", "26-35", "36-45", "46+"];
  const datasets = rangos.map((rango, i) => ({
    label: rango,
    data: colores.map(c => porColorEdad[c]?.[rango] || 0),
    backgroundColor: generarColores(rangos.length)[i]
  }));

  if (graficoBarras) graficoBarras.destroy();
  graficoBarras = new Chart(document.getElementById('graficoBarras'), {
    type: 'bar',
    data: {
      labels: colores,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true }
      }
    }
  });

  document.getElementById('detalleColorBox').style.display = 'none';
}

function mostrarDetalle(color, detalle) {
  const edades = Object.keys(detalle);
  const cantidades = Object.values(detalle);

  if (graficoDetalle) graficoDetalle.destroy();
  graficoDetalle = new Chart(document.getElementById('graficoDetalleColor'), {
    type: 'bar',
    data: {
      labels: edades,
      datasets: [{
        label: `Votos por edad`,
        data: cantidades,
        backgroundColor: '#6a4c93'
      }]
    }
  });

  document.getElementById('colorSeleccionado').textContent = color;
  document.getElementById('detalleColorBox').style.display = 'block';
}

document.querySelectorAll('.filtroEdad, #incluirNulos').forEach(el =>
  el.addEventListener('change', actualizarGraficos)
);

cargarDatos();
