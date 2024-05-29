const colorScale = d3.scaleSequential(d3.interpolateBlues);
const outflowColorScale = d3.scaleSequential(d3.interpolateReds);
const gdpColorScale = d3.scaleSequential(d3.interpolateGreens);

let isShowingDoctors = true;
let showBoth = false;
let isShowingOutflow = false;
let isShowingGDP = false;
let svg;
const width = 800;
const height = 450;

let minValue = Number.POSITIVE_INFINITY;
let maxValue = Number.NEGATIVE_INFINITY;
let outflowMinValue = Number.POSITIVE_INFINITY;
let outflowMaxValue = Number.NEGATIVE_INFINITY;
let gdpMinValue = Number.POSITIVE_INFINITY;
let gdpMaxValue = Number.NEGATIVE_INFINITY;

const years = [2018, 2019, 2020, 2021];
let datasetsLoaded = 0;

const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on("zoom", zoomed);

function calculateGlobalMinMax() {
  datasetsLoaded = 0; // Reset datasetsLoaded
  years.forEach(year => {
    const dataFile = `./data/${year}_country_${isShowingDoctors ? "per_doctors" : (isShowingOutflow ? "doctor_outflow" : "gdp_per_capita")}.csv`;
    d3.csv(dataFile).then(function (countryValues) {
      const values = countryValues.map(d => +d.value).filter(v => !isNaN(v) && v > 0);
      const yearMaxValue = Math.max(...values);
      const yearMinValue = Math.min(...values);
      if (isShowingDoctors || showBoth) {
        if (yearMaxValue > maxValue) maxValue = yearMaxValue;
        if (yearMinValue < minValue) minValue = yearMinValue;
      }
      if (isShowingOutflow || showBoth) {
        if (yearMaxValue > outflowMaxValue) outflowMaxValue = yearMaxValue;
        if (yearMinValue < outflowMinValue) outflowMinValue = yearMinValue;
      }
      if (isShowingGDP) {
        if (yearMaxValue > gdpMaxValue) gdpMaxValue = yearMaxValue;
        if (yearMinValue < gdpMinValue) gdpMinValue = yearMinValue;
      }

      datasetsLoaded++;
      if (datasetsLoaded === years.length) {
        if (isShowingDoctors || showBoth) colorScale.domain([minValue, maxValue]);
        if (isShowingOutflow || showBoth) outflowColorScale.domain([outflowMinValue, outflowMaxValue]);
        if (isShowingGDP) gdpColorScale.domain([gdpMinValue, gdpMaxValue]);
        updateHeatmap(2018); // Initialize with 2018 data
      }
    });

    if (isShowingOutflow || showBoth) {
      const outflowFile = `./data/${year}_country_doctor_outflow.csv`;
      d3.csv(outflowFile).then(function (outflowValues) {
        const values = outflowValues.map(d => +d.value).filter(v => !isNaN(v) && v > 0);
        const yearMaxValue = Math.max(...values);
        const yearMinValue = Math.min(...values);
        if (yearMaxValue > outflowMaxValue) outflowMaxValue = yearMaxValue;
        if (yearMinValue < outflowMinValue) outflowMinValue = yearMinValue;

        datasetsLoaded++;
        if (datasetsLoaded === years.length * 2) {
          if (isShowingDoctors || showBoth) colorScale.domain([minValue, maxValue]);
          if (isShowingOutflow || showBoth) outflowColorScale.domain([outflowMinValue, outflowMaxValue]);
          updateHeatmap(2018); // Initialize with 2018 data
        }
      });
    }
  });
}

function showDoctorsData() {
  document.getElementById('yearSlider').value = 2018;
  document.getElementById('yearLabel').textContent = 'Year: 2018';
  isShowingDoctors = true;
  isShowingOutflow = false;
  showBoth = false;
  isShowingGDP = false;
  datasetsLoaded = 0;
  minValue = Number.POSITIVE_INFINITY;
  maxValue = Number.NEGATIVE_INFINITY;
  outflowMinValue = Number.POSITIVE_INFINITY;
  outflowMaxValue = Number.NEGATIVE_INFINITY;
  updateHeatmapTitle(); // Update title
  calculateGlobalMinMax();
  enableRadioButtons(); // Enable radio buttons
}

function showOutflowData() {
  document.getElementById('yearSlider').value = 2018;
  document.getElementById('yearLabel').textContent = 'Year: 2018';
  isShowingDoctors = false;
  isShowingOutflow = true;
  showBoth = false;
  isShowingGDP = false;
  datasetsLoaded = 0;
  minValue = Number.POSITIVE_INFINITY;
  maxValue = Number.NEGATIVE_INFINITY;
  outflowMinValue = Number.POSITIVE_INFINITY;
  outflowMaxValue = Number.NEGATIVE_INFINITY;
  updateHeatmapTitle(); // Update title
  calculateGlobalMinMax();
  enableRadioButtons(); // Enable radio buttons
}

function showBothData() {
  document.getElementById('yearSlider').value = 2018;
  document.getElementById('yearLabel').textContent = 'Year: 2018';
  isShowingDoctors = true;
  isShowingOutflow = false;
  showBoth = true;
  isShowingGDP = false;
  datasetsLoaded = 0;
  minValue = Number.POSITIVE_INFINITY;
  maxValue = Number.NEGATIVE_INFINITY;
  outflowMinValue = Number.POSITIVE_INFINITY;
  outflowMaxValue = Number.NEGATIVE_INFINITY;
  calculateGlobalMinMax();
  enableRadioButtons(); // Enable radio buttons
}

function toggle() {
  document.getElementById('yearSlider').value = 2018;
  document.getElementById('yearLabel').textContent = 'Year: 2018';
  if (isShowingDoctors || isShowingOutflow || showBoth) {
    isShowingDoctors = false;
    isShowingOutflow = false;
    showBoth = false;
    isShowingGDP = true;
    disableRadioButtons();
  } else {
    isShowingDoctors = true;
    isShowingOutflow = false;
    showBoth = false;
    isShowingGDP = false;
    enableRadioButtons();
  }
  datasetsLoaded = 0;
  minValue = Number.POSITIVE_INFINITY;
  maxValue = Number.NEGATIVE_INFINITY;
  outflowMinValue = Number.POSITIVE_INFINITY;
  outflowMaxValue = Number.NEGATIVE_INFINITY;
  gdpMinValue = Number.POSITIVE_INFINITY;
  gdpMaxValue = Number.NEGATIVE_INFINITY;
  updateHeatmapTitle(); // Update title
  calculateGlobalMinMax();
  // Reset the radio button to "Country Doctors Data"
  document.getElementById("showDoctors").checked = true;
}

function updateHeatmap(year) {
  document.getElementById("yearLabel").textContent = `Year: ${year}`;
  const svgContainer = d3.select("#heatmap");
  let g;

  if (svgContainer.select("svg").empty()) {
    svg = svgContainer
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .call(zoom);

    g = svg.append("g");
  } else {
    svg = svgContainer.select("svg");
    g = svg.select("g");
  }

  const tooltip = d3.select("#heatmap-tooltip");
  const projection = d3.geoNaturalEarth1()
      .center([0, 0])
      .scale(width / 1.6 / Math.PI)
      .translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);
  const dataFile = `./data/${year}_country_${isShowingDoctors ? "per_doctors" : (isShowingOutflow ? "doctor_outflow" : "gdp_per_capita")}.csv`;
  const outflowFile = `./data/${year}_country_doctor_outflow.csv`;

  d3.json("./data/worldmap.json").then(function (world) {
    d3.csv(dataFile).then(function (countryValues) {
      d3.csv(outflowFile).then(function (outflowValues) {
        world.features.forEach(function (feature) {
          const countryData = countryValues.find(d => d.country === feature.properties.name);
          const outflowData = outflowValues.find(d => d.country === feature.properties.name);
          feature.properties.value = countryData ? +countryData.value : undefined;
          feature.properties.outflowValue = outflowData ? +outflowData.value : undefined;
        });

        const paths = g.selectAll("path").data(world.features);
        paths
            .enter()
            .append("path")
            .merge(paths)
            .attr("d", path)
            .style("fill", function(d) {
              if (showBoth) {
                // Check if both values are present
                if (d.properties.value !== undefined && d.properties.outflowValue !== undefined) {
                  return colorScale(d.properties.value); // Prioritize doctors data for coloring
                } else if (d.properties.outflowValue !== undefined) {
                  return outflowColorScale(d.properties.outflowValue);
                } else if (d.properties.value !== undefined) {
                  return colorScale(d.properties.value);
                }
                return "#808080"; // Default color when no data is available
              } else if (isShowingOutflow) {
                return d.properties.outflowValue !== undefined
                  ? outflowColorScale(d.properties.outflowValue)
                  : "#808080"; // No outflow data color
              } else if (isShowingGDP) {
                return d.properties.value !== undefined
                  ? gdpColorScale(d.properties.value)
                  : "#808080"; // No GDP data color
              } else {
                return d.properties.value !== undefined
                  ? colorScale(d.properties.value)
                  : "#808080"; // No doctor data color
              }
            })
            .style("stroke", "#fff")
            .on("mouseover", function (event, d) {
              let valueText;
              if (showBoth) {
                valueText = d.properties.name + "<br/>";
                if (d.properties.value !== undefined) {
                  valueText += `Foreign-trained Doctors: ${d.properties.value}%<br/>`;
                }
                if (d.properties.outflowValue !== undefined) {
                  valueText += `Doctors Emigrated: ${d.properties.outflowValue}`;
                }
              } else if (isShowingDoctors) {
                valueText = `${d.properties.name}<br/>${
                  d.properties.value !== undefined ? `Foreign-trained Doctors: ${d.properties.value}%` : "No data"
                }`;
              } else if (isShowingOutflow) {
                valueText = `${d.properties.name}<br/>${
                  d.properties.outflowValue !== undefined ? `Doctors Emigrated: ${d.properties.outflowValue}` : "No data"
                }`;
              } else if (isShowingGDP) {
                valueText = `${d.properties.name}<br/>${
                  d.properties.value !== undefined ? `$${d.properties.value} GDP Per Capita` : "No data"
                }`;
              }
              tooltip
                  .style("visibility", "visible")
                  .style("opacity", 1)
                  .html(valueText)
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
              tooltip.style("visibility", "hidden").style("opacity", 0);
            })
            .on("click", function (event, d) {
              handleCountryClick(d.properties.name);
            });
        paths.exit().remove();

        const min = isShowingOutflow ? outflowMinValue : (isShowingGDP ? gdpMinValue : minValue);
        const max = isShowingOutflow ? outflowMaxValue : (isShowingGDP ? gdpMaxValue : maxValue);

        updateLegend(min, max);
        updateHeatmapTitle(); // Update title
      });
    });
  });
}

function updateHeatmapTitle() {
  const titleElement = document.getElementById("heatmap-title");
  if (isShowingDoctors) {
    if (showBoth) {
      titleElement.textContent = "Country Doctors Data and Outflow";
    } else {
      titleElement.textContent = "Percentage of foreign-trained doctors";
    }
  } else if (isShowingOutflow) {
    titleElement.textContent = "Doctors Emigrated";
  } else {
    titleElement.textContent = "GDP per capita";
  }
}

function zoomed(event) {
  const { transform } = event;
  d3.select("#heatmap g").attr("transform", transform);
  d3.selectAll("#heatmap g path").attr("stroke-width", 1 / transform.k);
}

function updateLegend(minValue, maxValue) {
  const legendWidth = 300;
  const legendHeight = 20;

  const svg = d3.select("#legend");
  svg.selectAll("*").remove();

  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");

  linearGradient.selectAll("stop")
      .data([
        { offset: "0%", color: isShowingOutflow ? outflowColorScale(minValue) : (isShowingGDP ? gdpColorScale(minValue) : colorScale(minValue)) },
        { offset: "100%", color: isShowingOutflow ? outflowColorScale(maxValue) : (isShowingGDP ? gdpColorScale(maxValue) : colorScale(maxValue)) }
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

  svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#linear-gradient)");

  const xScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([0, legendWidth]);

  const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickSize(-legendHeight);

  svg.append("g")
      .attr("class", "legend axis")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(xAxis)
      .select(".domain").remove();
}

function zoomToNorthAmerica() {
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity.translate(width / 2, height / 2).scale(3).translate(-width / 4, -height / 4)
  );
}

function zoomToEurope() {
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity.translate(width / 2.3, height / 0.7).scale(3).translate(-width / 2, -height / 2)
  );
}

function zoomToOceanic() {
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity.translate(width / 12, height / 3).scale(3).translate(-width / 1.3, -height / 1.75)
  );
}

function resetZoom() {
  svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
}

function disableRadioButtons() {
  document.getElementById("showDoctors").disabled = true;
  document.getElementById("showOutflow").disabled = true;
  document.getElementById("showBoth").disabled = true;
}

function enableRadioButtons() {
  document.getElementById("showDoctors").disabled = false;
  document.getElementById("showOutflow").disabled = false;
  document.getElementById("showBoth").disabled = false;
}

window.onload = () => calculateGlobalMinMax();