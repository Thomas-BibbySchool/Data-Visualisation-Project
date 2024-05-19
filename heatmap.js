const colorScale = d3
    .scaleSequential()
    .interpolator(d3.interpolateBlues);

let isShowingDoctors = true; // Initial state is showing doctors

function toggle() {
  isShowingDoctors = !isShowingDoctors; // Toggle the state
  updateHeatmap(document.getElementById("yearSlider").value); // Update the heatmap with the current year
}

function handleCountryClick(countryName) {
  console.log("Country clicked:", countryName); // For debugging, remove or comment out later
}

function updateHeatmap(year) {
  document.getElementById("yearLabel").textContent = `Year: ${year}`; // Update the label text

  const width = 800;
  const height = 450;
  const svgContainer = d3.select("#heatmap");
  let svg = svgContainer.select("svg");
  let g;

  if (svg.empty()) {
    svg = svgContainer
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .call(zoom); // Add zoom behavior to the SVG

    g = svg.append("g"); // Create a group for the map paths
  } else {
    g = svg.select("g");
  }

  const tooltip = d3.select("#tooltip");
  const projection = d3.geoNaturalEarth1()
      .center([0, 0])
      .scale(width / 1.6 / Math.PI)
      .translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  const dataFile = `./data/${year}_country_${isShowingDoctors ? "per_doctors" : "gdp_per_capita"}.csv`;

  d3.json("./data/worldmap.json").then(function (world) {
    d3.csv(dataFile).then(function (countryValues) {
      const values = countryValues.map(d => +d.value).filter(v => !isNaN(v) && v > 0);
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);

      // Dynamically update the domain of the color scale to match data range
      colorScale.domain([minValue, maxValue]);

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
                  : "#808080" // Default color for missing or zero values
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

      // Update legend
      updateLegend(minValue, maxValue);
    });
  });
}

const zoom = d3.zoom()
    .scaleExtent([1, 8]) // Set the zoom scale extent
    .on("zoom", zoomed);

function zoomed(event) {
  const { transform } = event;
  d3.select("#heatmap g").attr("transform", transform);
  d3.selectAll("#heatmap g path").attr("stroke-width", 1 / transform.k); // Adjust stroke width based on zoom level
}

function updateLegend(minValue, maxValue) {
  const legendWidth = 300;
  const legendHeight = 20;

  const svg = d3.select("#legend");
  svg.selectAll("*").remove(); // Clear previous legend

  // Create gradient
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

  // Draw the rectangle and fill with gradient
  svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#linear-gradient)");

  // Create a scale for the legend
  const xScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([0, legendWidth]);

  // Create and position the legend axis
  const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickSize(-legendHeight);

  svg.append("g")
      .attr("class", "legend axis")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(xAxis)
      .select(".domain").remove(); // Remove axis line
}

window.onload = () => updateHeatmap(2018); // Initialize with 2018 data
