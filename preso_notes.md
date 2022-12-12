# Open source tools for FileMaker data visualization

## Introduction

- My name is Alec Gregory. I'm a Senior Engineering Manager at Beezwax. I've been working with FileMaker for around 15 years, often mixing in web technologies.
- Over the last few years I have worked on a lot FileMaker web integrations and helped develop tools for making them easier.
- The intention of this presentation is to provide a roadmap for doing open source data visualization in FileMaker 19+.
- This will be a detailed, informal presentation, questions are encouraged and I'm happy to enter into discussion.

### Structure

- We will briefly go over the built-in FileMaker tools that we can use to do the visualizations.
- We will briefly look at tool selection, comparing d3, Observable/Plot, and chart JS.
- In the main part of the presentation we will walk through creating visualizations based on the Swedish Innovations data that Frank has provided

## The FileMaker tools

There are three key tools that support FileMaker 19 web integrations
- The [`FileMaker.PerformScripWithOption`](https://help.claris.com/en/pro-help/content/scripting-javascript-in-web-viewers.html) function available in FileMaker web viewers
- The [`Perform JavaScript in Web Viewer`](https://help.claris.com/en/pro-help/content/perform-javascript-in-web-viewer.html?Highlight=perform%20javascript%20in%20web%20viewer) script step
- The [`Execute FileMaker Data API`](https://help.claris.com/en/pro-help/content/execute-filemaker-data-api.html?Highlight=Execute%20FileMaker%20Data%20API) script step

## Tool selection

### D3

The most well-known open source tool for data visualization is [d3](https://d3js.org/). While this is a powerful tool, it has been criticized for being difficult to learn and engage with casually. Additinally it has multiple versions and this can make finding up to date learning materials difficult. As the official tutorials page states: 

> Many tutorials ... use older versions of D3.

So, for people who are not full-time web developers or who don't have a large learning budget D3 may not be ideal. However, things are improving with the "new" (D3 tutorials)[https://observablehq.com/collection/@d3/learn-d3] 

### Observable/Plot

In the words of its creator [Obversable Plot](https://observablehq.com/@observablehq/plot) is a free, open-source JavaScript library to help you quickly visualize tabular data.

- Build by the creator of D3, Mike Bostock
- Uses D3 under the hood
- A more focused set of features than D3.

For me, observable plot is a good fit because it

- Has a gentler learning curve than D3
- Requires the developer to write less JavaScript code (key concept: just enough JavaScript)
- Includes D3, allowing you to dip into more advanced features if necessary
- Has a [helpful community forum](https://talk.observablehq.com/) that  provides support.

#### Observable/Plot technical notes

- Generates svgs which you can then render in the DOM (And, as we will see, manipulate)

### Chart JS

Chart JS is the big fish. It's by far the most popular charting library for JavaScript developers.

- It's well maintained
- It's so popular you can just Google questions/issues
- Like d3, it has gone through several versions, so finding up to date answers/learning materials is sometimes challenging

#### Chart JS technical notes

- Binds to a pre-existing canvas element in the DOM
- Canvas does not allow the same element based manipulation as svg, so "hacking" a visualization is a little harder and styling is done through configuration rather than css.
- Plugin-based architecture to handle custom charts and styles

## Creating visualizations with Observable/Plot

- In this main section of the talk we will build a visualizations with FileMaker and Observable Plot.
- You will see a lot of FileMaker and JavaScript patterns and concepts in this section. If you find something interesting (or unclear), feel free to stop me and I'll go into more detail.
- The main focus areas are
  - The management of data flow between FileMaker and the web viewer
  - How to use and learn Observable/Plot
  - Management of integrations in general

### First things first: data

- I am using the Swedish Innovations database provided by Frank. This is not my field of expertise but I have found an angle that interests me: development time.
- There is a field for development start time and commericalization.
- The difference between these two fields I am calling development time.
- Note: There is no DEVELOPMENT_TIME field in the raw data. As I have full access to the FileMaker file, I can create it easily using a FileMaker calculation, and I have done so. If I didn't have this ability or didn't want to pollute the schema, I could use JavaScript to create the field 

### Transforming FileMaker data for use in Plot

- Before we can start creating visualizations, our FileMaker web viewer needs to be able to get data from our FileMaker tables
- There are many ways we could do this. I am using a technique that I call "self-contained layout"
- The core of this technique is the `Execute FileMaker Data API` script step. This converts FileMaker data into JSON which can be easily handled by JavaScript functions.

#### Self-contained layout technique

- Choose context (easy in this case)
- Create layout
- Add fields (and portals if needed)
- (Optional) name field objects to support robust field handling
- Create a data retrival script that leverages `Execute FileMaker Data API`
  - We can build a find request in JavaScript but it's more robust to do it in FileMaker
  - The scripting is lightweight: two 3-line scripts (key concept: just enough FileMaker).
- Call data retrival script from web viewer
  - (why not call the web viewer from FileMaker with a payload?: FileMaker object availability, and web viewer freezing). Basically by intiating things from the web viewer we get a smoother experience and our code ends up being structured more like a standard web app, which is good, because web standards are good.
- Return raw result as it is faster to process it in JavaScript than in FileMaker.

#### Integration and data processing

An example raw result from the FileMaker Data API is:
```
{
	"messages" : 
	[
		{
			"code" : "0",
			"message" : "OK"
		}
	],
	"response" : 
	{
		"data" : 
		[
			{
				"fieldData" : 
				{
					"ARTIFACTUAL_COMPLEXITY" : 2,
					"COMMERCIALIZATION_YEAR" : 1970,
					"DEVELOPMENTAL_COMPLEXITY" : 1,
					"DEVELOPMENT_START_YEAR" : 1966,
					"DEVELOPMENT_TIME" : 4,
					"NAME_ENGLISH" : "",
					"NAME_SWEDISH" : "ALUH",
					"PROTOTYPE_YEAR" : "",
					"SINNO_ID" : 6475001
				},
				"modId" : "2",
				"portalData" : {},
				"recordId" : "2"
			}
		]
  }
}
```
- Observable/Plot can handle data in various formats. We will be using an array of simple JSON objects.
```
[
  {"fieldName1" : "value1", "fieldName2" : "value2"},
  {"fieldName1" : "value3", "fieldName2" : "value4"},
  {"fieldName1" : "value5", "fieldName2" : "value6"}
]
```

- So our first task is to get the FileMaker Data API formatted data into our web app. The second is to convert it to a format observable/plot will understand.
- Below is the JavaScript code that accomplishes those two tasks
```
bzBond.PerformScript("Get Innovation Timeline Data").then(result => {
  const innovations = result.response.data.map(fmDapiRecord =>
    Object.keys(fmDapiRecord.fieldData).reduce(
      (plotRecord, fmDapiField) => 
      ({...plotRecord, ...{[fmDapiField]: fmDapiRecord.fieldData[fmDapiField]}}),
      {}
    )
  );
```
- Let's look at the data processing code first
- The key techniques here are the functions [`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) and [`reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) which are available on all JavaScript arrays.
- They are iterating functions which perform the same operation on each item in an array. They are similar to FileMaker script loops or the `While` function.
- But they are faster, more powerful, and their syntax is more expressive. In the example above the transform is handled by two nested one-line functions, supported by various JavaScript shorthands (just enough JavaScript).
- map and reduce take a little practice but they are really useful and there are plenty of good tutorials and execises out there. For example the [javascript.info array methods page](https://javascript.info/array-methods).

#### bzBond

- Now let's look at how we are getting the data into our app.
- You may have noticed that we aren't calling `FileMaker.PerformScriptWithOption` in that code. We are calling `bzBond.PerformScript`.
- So what is bzBond? It's an open source toolset that
  - Manages interactions between web viewers and FileMaker
  - Handles project setup and code deployment
  - And more
  - Check it out at [github.com/beezwax/bzbond](https://github.com/beezwax/bzbond)
- I used bzbond to bootstrap my FileMaker app and associated web code.
- Here's a demo of create-bzbond-app to show quickly we can get a web project started
- We get from zero (ish, you do need node/npm and git) to integrated pretty quickly
- And let's just show that we can edit in VSCode.
  - Here's an X-wing
  - Here's a Tie Fighter
  - And here's the death star
- Any brief questions on bzBond? We can look at it in more detail later.

### Initial Exploration: Histogram

- So now we have our data ready to visualize, let's do some initial exploration.
- To get a feel for the data, I'd like to plot innovation development time on a histogram.
- In observable/plot we do this by displaying channels on a scale. Channels are a combination or geometric shapes (marks) and data that display on a scale.
- We will build up channels in our histogram to see this in action.

#### Simple histogram

- According to the documentation we shoud use a group transformation to generate our histogram.
- Let's look at the function we are using to create the histogram.

```
Plot.plot({
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
        { y: "count" },
        { x: "DEVELOPMENT_TIME", fill: "goldenrod" }
      )
    )
  ]
});
```
- In plain English calling the function this way is saying:
"Plot on a y-axis labelled 'Innovation Count' and an x-axis labelled 'Years in Development' vertical bars based on data in the `innovations` variable. Group the X axis by development time and show the count of each group on the y axis. The bar fill color should be the html color 'goldenrod'".
- The bars are the first channel in our histogram, lets add a couple more channels

#### Show the average

- We have a good sense of the data distribution now, but let's add the average.
- As we will be referencing the average in multiple channels, we use a function to calculate it. Most JavaScript projects end up with a few supporting or "utility" functions. These can be stored in a separate file and imported if there are lots of them

#### Add counts

- The histrogram is looking good, but what if we want to add counts
- We can add a "text" channel which plots text instead of drawing bars.
- I want to mention here that I struggled with this part. Initially I ended up manually calculating the counts and putting them in new variables, not very efficient!
- So I asked on the observable forum and Mike Bostock pointed me in the right direction. In the same way we used the group transformation to group the bars, we can also use it to group the text.
- We are simply adding another channel, driven by the same data as the bars.
- Finally, Mike suggested I create a utility function for the grouping transformation to prevent repetition (DRY principle).
- You can see the forum thread [here](https://talk.observablehq.com/t/observable-plot-best-way-show-histogram-count-labels/7358)

#### Final tweaks

- Let's change the counts to proportions. It's easy to do this by changing our group transformation from a `"count"` to a `"proportion"`.
- This is more useful, but there's a problem, the proportions are too long and bleed into each other. Ideally we'd like to show them as a percentage.
- I have asked about this on the forum, but haven't had a response yet, so for now we fix the issue with manual DOM manipulation. It gets the job done but hopefully I'll find a better way. Such is the life of the explorer!

### Further exploration: complexity effect

- We have got some interesting insights from our data, so let's bring in another dimension.
- There is an artifactual complexity field. We can hyptothesize that the greater the artifactual complexity the longer an innovation will take to develop.
- We can test this by showing

## Creating visualizations with Chart JS

- I want to also bring in chart js here, as a point of comparison. I'm afriad it will get a bit of a raw deal from me as I've not spent as much time in it as observable/plot, but I think it's big enough to handle itself.
- So let's see what we need to change if we want to achieve a similar data visualization in Chart JS. As I say, I have not got as far with this library but we will see the key differences, which will hopefully help you to build a decision making roadmap for your own work.
- The good news is that we can use exactly the same data as we did for observable plot and go straight into the specifics of chart JS

### Chart JS Histogram

#### Simple histogram

- The first thing to say is that the is no obvious path for generating a histogram from our data as it is formatted. However, with data manipulation we can get what we need:

```
const labels = Array.from(
  new Set(innovations.map(inno => inno.DEVELOPMENT_TIME))
).sort((a, b) => {
  if (a > b) {
    return 1;
  } else if (a < b) {
    return -1;
  } else {
    return 0;
  }
});
const counts = labels.map(label => 0);
const data = innovations.reduce((acc, curr) => {
  const newArray = [...acc];
  const position = labels.findIndex(label => label === curr.DEVELOPMENT_TIME);
  newArray[position]++;
  return newArray;
}, counts);
```

- While creating the data was not too difficult, the fact that we have to do it all suggests to me that data structure is perhaps a little less integral to chart js, and therefore your structure is more likely to require handling outside the library. Data processing is often necessary but it seems to have some in earlier with chart js than observable/plot.

- The code below generates the visualuation. It is a little more verbose than for observable/plot. Chart JS is highly configurable, and its config handling follows good practices. However even our basic case needs quite a lot of config.

```
() => {
  jsChart = new Chart(
    document.querySelector("canvas"),
    {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Count',
            data,
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
```
- The other thing to mention is that we have already spent quite a few lines of code defining our data above, which reduces the amount of code that we need in the chart generating function below. 
- Note that one area that doesn't necessarily need to be here but I wanted to highlight: `options.plugins.tooltip.enabled`. The tooltip is enabled by default, but unintuitively the toggle is under the `options.plugins` property. This shows that they are serious when they say have a plugin-base architecture.
- In general I've found that libraries based on plugins tend to favor more experienced devs who can understand and author plugins. For those less-experienced, having a largely self-contained ecosystem can be reassuring 

#### Chart JS additional details: Running out of road?

- As you can see from this next example, I did not manage to show a rule with the average in chart js. I expect it is possible but I did not have as much time with chart js and wasn't able to find out how in the docs or online.
- That being said, the "channel" concept in observable/plot did help guide me so that's probably a +1 for observable/plot

## Conclusions

There are key concepts and techniques that will help you on your FileMaker data visualization journey whichever library you decide to use:

### FileMaker

- Execute Data API
- Web code management (bzBond can help)
- Just enough FileMaker

### JavaScript

- Array methods, especially `map` and `reduce`
- Just enough JavaScript