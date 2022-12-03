import bzBond from "@beezwax/bzbond-js";
import "../scss/app.scss";
import * as Plot from "@observablehq/plot";

bzBond.PerformScript("Get Innovation Timeline Data").then(result => {
  const innovations = result.response.data.map(record =>
    Object.keys(record.fieldData).reduce(
      (accumulator, currentValue) => 
      ({...accumulator, ...{[currentValue]: record.fieldData[currentValue]}}),
      {}
    )
  );

  // Simple historgram showing development time for innovations
  const histFmCalc = Plot.plot({
    y: {
      label: "Innovation Count"
    },
    x: {
      label: "Years in development"
    },
    marks: [
      Plot.barY(
        innovations,
        groupByDevelopmentTime(null, {fill: "goldenrod"})
      ),
      Plot.text(
        innovations,
        groupByDevelopmentTime({text: "count"}, {dy: -5})
      )
    ]
  });

  const rectplot = Plot.barY(
    innovations,
    Plot.binX(
      {y: "count"},
      {
        x: d => d.COMMERCIALIZATION_YEAR - d.DEVELOPMENT_START_YEAR,
        fill: "DEVELOPMENTAL_COMPLEXITY"
      }
    )
  )
    .plot({color: {legend: true, type: "categorical"}});

  const rectplotSep = Plot.plot({
    grid: true,
    facet: {
      data: innovations,
      y: "DEVELOPMENTAL_COMPLEXITY"
    },
    marks:[
      Plot.barY(
        innovations,
        Plot.binX(
          {y: "count"},
          {x: "DEVELOPMENT_TIME", fill: "DEVELOPMENTAL_COMPLEXITY"}
        )
      )
    ]
  });

  document.body.appendChild(histFmCalc);

  document.body.appendChild(rectplot);
  document.body.appendChild(rectplotSep);
});

const groupByDevelopmentTime = (outputs, options) => {
  return Plot.groupX(
    { y: "count", ...outputs },
    { x: "DEVELOPMENT_TIME", ...options }
  );
}