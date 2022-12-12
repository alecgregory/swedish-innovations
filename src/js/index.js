import bzBond from "@beezwax/bzbond-js";
import "../scss/app.scss";
import * as Plot from "@observablehq/plot";

const PLOT_MAP = [
  null,
  "Simple Historgram",
  "Historgram With Average Rule",
  "Historgram With Count Labels",
  "Historgram With Proportion Labels",
  "Historgram With Percentage Labels"
]

bzBond.PerformScript("Get Innovation Development Time Data").then(result => {
  const innovations = result.response.data.map(fmDapiRecord =>
    Object.keys(fmDapiRecord.fieldData).reduce(
      (plotRecord, fmDapiField) => 
      ({...plotRecord, ...{[fmDapiField]: fmDapiRecord.fieldData[fmDapiField]}}),
      {}
    )
  );

  const plots = [];

  const plotSelector = document.createElement("select");
  PLOT_MAP.forEach(plot => {
    const option = document.createElement("option");
    if(plot === null) {
      option.value = ""
      option.textContent = "Select visualization to display"
    } else {
      option.value = option.textContent = plot;
    }
    plotSelector.appendChild(option);
  })
  plotSelector.addEventListener("change", (e) => {
    const plotIndex = PLOT_MAP.findIndex(plot => plot === e.target.value);
    const main = document.querySelector("main");
    main.textContent = "";
    main.appendChild(plots[plotIndex])
    if(plotIndex === 5) {
      const propotionLabels = document.querySelectorAll('[font-variant="tabular-nums"]')[1];
      propotionLabels.querySelectorAll("text:not([data-converted])").forEach(proportion => {
        const percentage = +proportion.textContent * 100;
        proportion.textContent = `${percentage.toFixed(0)}%`;
        proportion.setAttribute("data-converted", "");
      })
    }
  });
  document.body.appendChild(plotSelector)
  const main = document.createElement("main");
  document.body.appendChild(main);

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
      Plot.ruleX(
        innovations,
        {x: "DEVELOPMENT_TIME", stroke: "red", transform: transformAverageDevTime}
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
});

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