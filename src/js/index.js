import bzBond from "@beezwax/bzbond-js";
import "../scss/app.scss";
import * as Plot from "@observablehq/plot";

bzBond.PerformScript("Get Innovation Timeline Data")
  .then(result => {
    const innovations = result.response.data.map(record =>
      Object.keys(record.fieldData).reduce(
        (accumulator, currentValue) => 
        ({...accumulator, ...{[currentValue]: record.fieldData[currentValue]}}),
        {}
      )
    );

    const innoHist = innovations.reduce((acc, curr) => {
      const newAcc = acc;
      if(newAcc[curr.DEVELOPMENT_TIME]) {
        newAcc[curr.DEVELOPMENT_TIME]++
      } else {
        newAcc[curr.DEVELOPMENT_TIME] = 1
      }
      return newAcc;
    },
    []);

    const innoHistIndex = innoHist.map((value, index, array) => index);

    console.log(innoHistIndex);

    console.log(innoHist);

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
          Plot.groupX(
            {y: "count"},
            {
              x: "DEVELOPMENT_TIME",
              fill: "goldenrod"
            },
          )
        ),
        Plot.text(innoHist, {x: innoHistIndex, y: innoHist, dy: -5})
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
  })

