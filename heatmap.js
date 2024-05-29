const colorScale = d3.scaleSequential().interpolator(d3.interpolateBlues);

let isShowingDoctors = true;
let svg;
const width = 800;
const height = 450;

let minValue = Number.POSITIVE_INFINITY;
let maxValue = Number.NEGATIVE_INFINITY;

const years = [2018, 2019, 2020, 2021];
let datasetsLoaded = 0;

function calculateGlobalMinMax() {
  years.forEach(year => {
    const dataFile = `./data/${year}_country_${isShowingDoctors ? "per_doctors" : "gdp_per_capita"}.csv`;
    d3.csv(dataFile).then(function (countryValues) {
      const values = countryValues.map(d => +d.value).filter(v => !isNaN(v) && v > 0);
      const yearMaxValue = Math.max(...values);
      const yearMinValue = Math.min(...values);
      if (yearMaxValue > maxValue) maxValue = yearMaxValue;
      if (yearMinValue < minValue) minValue = yearMinValue;

      datasetsLoaded++;
      if (datasetsLoaded === years.length) {
        colorScale.domain([minValue, maxValue]);
        updateHeatmap(2018); // Initialize with 2018 data
      }
    });
  });
}

function toggle() {
  isShowingDoctors = !isShowingDoctors;
  datasetsLoaded = 0;
  minValue = Number.POSITIVE_INFINITY;
  maxValue = Number.NEGATIVE_INFINITY;
  updateHeatmapTitle(); // Update title
  calculateGlobalMinMax();
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
  const dataFile = `./data/${year}_country_${isShowingDoctors ? "per_doctors" : "gdp_per_capita"}.csv`;

  d3.json("./data/worldmap.json").then(function (world) {
    d3.csv(dataFile).then(function (countryValues) {
      world.features.forEach(function (feature) {
        const countryData = countryValues.find(d => d.country === feature.properties.name);
        feature.properties.value = countryData ? +countryData.value : undefined;
      });

      const paths = g.selectAll("path").data(world.features);
      paths
          .enter()
          .append("path")
          .merge(paths)
          .attr("d", path)
          .style("fill", d =>
              d.properties.value !== undefined
                  ? colorScale(d.properties.value)
                  : "#808080"
          )
          .style("stroke", "#fff")
          .on("mouseover", function (event, d) {
            tooltip
                .style("visibility", "visible")
                .style("opacity", 1)
                .html(d.properties.name + "<br/>" + (d.properties.value || "No data"))
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

      updateLegend(minValue, maxValue);
      updateHeatmapTitle(); // Update title
    });
  });
}

function updateHeatmapTitle() {
  const titleElement = document.getElementById("heatmap-title");
  if (isShowingDoctors) {
    titleElement.textContent = "Percentage of foreign-trained doctors";
  } else {
    titleElement.textContent = "GDP per capita";
  }
}

const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

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
        { offset: "0%", color: colorScale(minValue) },
        { offset: "100%", color: colorScale(maxValue) }
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

window.onload = () => calculateGlobalMinMax();
