import bzBond from "@beezwax/bzbond-js";
import Chart from 'chart.js/auto';

const init = async() => {
  const plots = [];
  const PLOT_MAP = [
    null,
    "Simple Historgram",
    "Historgram With Average Line????"
  ];

  const section = document.querySelector("[data-section='chartJs']");
  const chart = document.createElement("div");
  const canvas = document.createElement("canvas");
  const selector = document.createElement("select");
  selector.setAttribute("data-selector", "chartJs");
  PLOT_MAP.forEach(plot => {
    const option = document.createElement("option");
    if(plot === null) {
      option.value = "";
      option.disabled = true;
      option.selected = true;
      option.textContent = "Select visualization to display";
    } else {
      option.value = option.textContent = plot;
    }
    selector.appendChild(option);
  });
  selector.addEventListener("change", (e) => {
    const plotIndex = PLOT_MAP.findIndex(plot => plot === e.target.value);
    const canvas = section.querySelector("canvas");
    canvas.textContent = "";
    plots[plotIndex]()
  });
  section.appendChild(selector);
  section.appendChild(chart);
  chart.appendChild(canvas);

  const fmResult = await bzBond.PerformScript("Get Innovation Development Time Data");

  const innovations = fmResult.response.data.map(fmDapiRecord =>
    Object.keys(fmDapiRecord.fieldData).reduce(
      (plotRecord, fmDapiField) => 
      ({...plotRecord, ...{[fmDapiField]: fmDapiRecord.fieldData[fmDapiField]}}),
      {}
    )
  );

  let jsChart;

  const maxDevTime = Math.max(...innovations.map(innovation => innovation.DEVELOPMENT_TIME));
  const labels = []
  for (let index = 0; index <= maxDevTime; index++) {
    labels.push(index)
  }

  plots[1] = () => {
    const counts = labels.map(label => 0);
    if (jsChart) {
      jsChart.destroy()
    }
    jsChart = new Chart(
      document.querySelector("canvas"),
      {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Count',
              data: innovations.reduce((acc, curr) => {
                const newArray = [...acc];
                newArray[curr.DEVELOPMENT_TIME]++
                return newArray;
              }, counts),
              xAxisID: 'xAxis',
              yAxisID: 'yAxis'
            }
          ]
        },
        options: {
          plugins: {
            tooltip: {
              enabled: true
            }
          },
          scales: {
            xAxis: {
              title: {
                text: "Years in Development",
                display: true
              }
            },
            yAxis: {
              title: {
                text: "Innovation Count",
                display: true
              }
            }
          }
        }
      }
    );
  }

  plots[2] = () => {
    const counts = labels.map(label => 0);
    if (jsChart) {
      jsChart.destroy()
    }
    jsChart = new Chart(
      document.querySelector("canvas"),
      {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Count',
              data: innovations.reduce((acc, curr) => {
                const newArray = [...acc];
                newArray[curr.DEVELOPMENT_TIME]++
                return newArray;
              }, counts),
              xAxisID: 'xAxis',
              yAxisID: 'yAxis'
            },
            {
              label: 'Average',
              data: [null,null,null,null,null, 100],
              xAxisID: 'xAxis',
              yAxisID: 'yAxis',
              type: "line"
            }
          ]
        },
        options: {
          plugins: {
            tooltip: {
              enabled: true
            }
          },
          scales: {
            xAxis: {
              title: {
                text: "Development Time",
                display: true
              }
            },
            yAxis: {
              title: {
                text: "Innovation Count",
                display: true
              }
            }
          }
        }
      }
    );
  }
}

export default init;