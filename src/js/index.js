import "../scss/app.scss";
import initObservablePlot from "./observable_plot.js";
import initChartJs from "./chart_js.js";

let section, heading;

heading = document.createElement("h1");
heading.textContent = "Open Source Data Visualization with FileMaker";

document.body.appendChild(heading);

section = document.createElement("section");
section.setAttribute("data-section", "observablePlot");
heading = document.createElement("h2");
heading.textContent = "Observable Plot";
section.appendChild(heading);
document.body.appendChild(section);

section = document.createElement("section");
section.setAttribute("data-section", "chartJs");
heading = document.createElement("h2");
heading.textContent = "Chart JS";
section.appendChild(heading);
document.body.appendChild(section);

initObservablePlot();