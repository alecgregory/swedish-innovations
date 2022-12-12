import bzBond from "@beezwax/bzbond-js";
import * as Plot from "@observablehq/plot";

const init = async() => {
  const plots = [];
  const PLOT_MAP = [
    null,
    "Simple Historgram",
    "Historgram With Average Rule",
    "Historgram With Count Labels",
    "Historgram With Proportion Labels",
    "Historgram With Percentage Labels",
    "Facet Example: Development complexity"
  ];

  const section = document.querySelector("[data-section='observablePlot']");
  const chart = document.createElement("div");
  const selector = document.createElement("select");
  selector.setAttribute("data-selector", "observablePlot");
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
    const chart = section.querySelector("div");
    chart.textContent = "";
    chart.appendChild(plots[plotIndex])
    if(plotIndex === 5) {
      const propotionLabels = document.querySelectorAll('[font-variant="tabular-nums"]')[1];
      propotionLabels.querySelectorAll("text:not([data-converted])").forEach(proportion => {
        const percentage = +proportion.textContent * 100;
        proportion.textContent = `${percentage.toFixed(0)}%`;
        proportion.setAttribute("data-converted", "");
      })
    }
    if(plotIndex === 6) {
      const facets = document.querySelectorAll('[aria-label="facet"]');
      facets.forEach(facet => {
        const propotionLabels = facet.querySelectorAll('[font-variant="tabular-nums"]')[0];
        propotionLabels.querySelectorAll("text:not([data-converted])").forEach(proportion => {
          const percentage = +proportion.textContent * 100;
          proportion.textContent = `${percentage.toFixed(0)}%`;
          proportion.setAttribute("data-converted", "");
        })}
      )
    }
  });
  section.appendChild(selector);
  section.appendChild(chart);

  const fmResult = await bzBond.PerformScript("Get Innovation Development Time Data");

  const innovations = fmResult.response.data.map(fmDapiRecord => fmDapiRecord.fieldData);

  plots[1] = Plot.plot({
    x: {
      label: "Years in development"
    },
    y: {
      label: "Innovation Count"
    },
    marks: [
      Plot.barY(
        innovations,
        Plot.groupX(
          { y: "count" },
          { x: "DEVELOPMENT_TIME", fill: "goldenrod" }
        )
      )
    ]
  });

  plots[2] = Plot.plot({
    x: {
      label: "Years in development"
    },
    y: {
      label: "Innovation Count"
    },
    marks: [
      Plot.barY(
        innovations,
        Plot.groupX(
          { y: "count" },
          { x: "DEVELOPMENT_TIME", fill: "goldenrod" }
        )
      ),
      Plot.ruleX(
        [getAverageDevelopmentTime(innovations)],
        {stroke: "red"}
      ),
      Plot.text(
        [getAverageDevelopmentTime(innovations)],
        {
          x: getAverageDevelopmentTime(innovations),
          y: 150,
          text: [`Average: ${getAverageDevelopmentTime(innovations)}`],
          dx: 30
        }
      )
    ]
  });

  plots[3] = Plot.plot({
    x: {
      label: "Years in development"
    },
    y: {
      label: "Innovation Count"
    },
    marks: [
      Plot.barY(
        innovations,
        groupByDevelopmentTime(null, { fill: "goldenrod" })
      ),
      Plot.ruleX(
        [getAverageDevelopmentTime(innovations)],
        {stroke: "red"}
      ),
      Plot.text(
        [getAverageDevelopmentTime(innovations)],
        {
          x: getAverageDevelopmentTime(innovations),
          y: 150,
          text: [`Average: ${getAverageDevelopmentTime(innovations)}`],
          dx: 30
        }
      ),
      Plot.text(
        innovations,
        groupByDevelopmentTime({ "text": "count" }, { dy: -5 })
      )
    ]
  });

  plots[4] = Plot.plot({
    x: {
      label: "Years in development"
    },
    y: {
      label: "Innovation Count"
    },
    marks: [
      Plot.barY(
        innovations,
        groupByDevelopmentTime( null, { fill: "goldenrod" })
      ),
      Plot.ruleX(
        [getAverageDevelopmentTime(innovations)],
        {stroke: "red"}
      ),
      Plot.text(
        [getAverageDevelopmentTime(innovations)],
        {
          x: getAverageDevelopmentTime(innovations),
          y: 150,
          text: [`Average: ${getAverageDevelopmentTime(innovations)}`],
          dx: 30
        }
      ),
      Plot.text(
        innovations,
        groupByDevelopmentTime ( {"text": "proportion"}, { dy: -5 })
      )
    ]
  });

  plots[5] = Plot.plot({
    x: {
      label: "Years in development"
    },
    y: {
      label: "Innovation Count"
    },
    marks: [
      Plot.barY(
        innovations,
        groupByDevelopmentTime( null, { fill: "goldenrod" })
      ),
      Plot.ruleX(
        [getAverageDevelopmentTime(innovations)],
        {stroke: "red"}
      ),
      Plot.text(
        [getAverageDevelopmentTime(innovations)],
        {
          x: getAverageDevelopmentTime(innovations),
          y: 150,
          text: [`Average: ${getAverageDevelopmentTime(innovations)}`],
          dx: 30
        }
      ),
      Plot.text(
        innovations,
        groupByDevelopmentTime ( { "text": "proportion" }, { dy: -5 })
      )
    ]
  });

  plots[6] = Plot.plot({
    x: {
      label: "Years in development"
    },
    y: {
      label: "Innovation Count"
    },
    fy: {
      label: "Developmental complexity"
    },
    facet: {
      data: innovations,
      y: "DEVELOPMENTAL_COMPLEXITY"
    },
    marks: [
      Plot.barY(
        innovations,
        groupByDevelopmentTime( null, { fill: "DEVELOPMENTAL_COMPLEXITY" })
      ),
      Plot.text(
        [getAverageDevelopmentTime(innovations)],
        {
          x: getAverageDevelopmentTime(innovations),
          y: 150,
          text: [`Average: ${getAverageDevelopmentTime(innovations)}`],
          dx: 30
        }
      ),
      Plot.text(
        innovations,
        groupByDevelopmentTime ( { "text": "proportion-facet" }, { dy: -5 })
      )
    ]
  });
}

const getAverageDevelopmentTime = (innovations) =>
  Math.round(
    innovations.reduce(
      (acc, curr) => acc + curr.DEVELOPMENT_TIME, 0)
        / innovations.length
  )

const groupByDevelopmentTime = (outputs, options) => {
  return Plot.groupX(
    { y: "count", ...outputs },
    { x: "DEVELOPMENT_TIME", ...options }
  );
}

const transformAverageDevTime = (data, facets) => {
  return {
    data,
    facets: facets.map(facet => facet.reduce(
      (acc, curr) => acc + data[curr].DEVELOPMENTAL_COMPLEXITY, 0))
  };
}

export default init;