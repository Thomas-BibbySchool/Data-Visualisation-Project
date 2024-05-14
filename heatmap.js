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
  const width = 800;
  const height = 450;
  const svgContainer = d3.select("#heatmap");
  let svg = svgContainer.select("svg");
  if (svg.empty()) {
    svg = svgContainer
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);
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

      const paths = svg.selectAll("path").data(world.features);
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
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden").style("opacity", 0);
        })
        .on("click", function (event, d) {
          handleCountryClick(d.properties.name);
        });
      paths.exit().remove();
    });
  });
}

window.onload = () => updateHeatmap(2018); // Initialize with 2018 data
