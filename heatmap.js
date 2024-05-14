// Define the color scale for the heatmap
const colorScale = d3.scaleSequential()
                     .interpolator(d3.interpolateBlues) 
                     .domain([0, 35]); // Adjust the domain as needed

// Initialize the visualization
function init() {
    // Define the dimensions for the SVG container
    const width = 1060;
    const height = 600;

    // Define the map projection
    const projection = d3.geoNaturalEarth1()
                         .center([0, 0]) // Set the center of the projection
                         .scale((width - 1) / 2 / Math.PI);

    // Define the path generator for the projection
    const path = d3.geoPath()
                   .projection(projection);

    // Create the SVG container
    const svg = d3.select("#heatmap").append("svg")
                  .attr("width", width)
                  .attr("height", height);

    // Load the world GeoJSON data
    d3.json("./data/worldmap.json").then(function(world) {
        // Load country values from CSV file
        d3.csv("./data/2018_country_per_doctors.csv").then(function(countryValues) {
            // Merge country values with GeoJSON data
            world.features.forEach(function(feature) {
                // Find corresponding value in the CSV data
                const countryData = countryValues.find(function(d) {
                    return d.country === feature.properties.name; 
                });
                if (countryData) {
                    feature.properties.value = +countryData.value; 
                }
            });

            // Bind the GeoJSON data to the SVG and create one path per GeoJSON feature
            svg.selectAll("path")
               .data(world.features)
               .enter()
               .append("path")
               .attr("d", path)
               .style("fill", d => {
                   // Assuming each feature has a properties.value that holds the data for the heatmap
                   return d.properties.value !== undefined ? colorScale(d.properties.value) : "#808080"; // Use black color if no value is found
               })
               .style("stroke", "#fff");
        });
    });
}

window.onload = init;
