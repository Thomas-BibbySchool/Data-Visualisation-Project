document.addEventListener('DOMContentLoaded', function initLineGraph() {
    console.log("Initializing line graph...");

    var svgWidth = 600, svgHeight = 300;
    var margin = { top: 20, right: 20, bottom: 50, left: 70 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var svg = d3.select("#linegraph").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear().domain([2018, 2021]).range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var data, countryData;

    d3.csv("./data/linegraph_dataset2.csv").then(function(loadedData) {
        console.log("Data loaded:", loadedData);

        data = [];
        loadedData.forEach(function(d) {
            data.push({ country: d.country, year: 2018, percentage: +d.value_2018 });
            data.push({ country: d.country, year: 2019, percentage: +d.value_2019 });
            data.push({ country: d.country, year: 2020, percentage: +d.value_2020 });
            data.push({ country: d.country, year: 2021, percentage: +d.value_2021 });
        });

        console.log("Transformed Data:", data);

        countryData = d3.group(data, d => d.country);

        // Initialize with the first country
        var initialCountry = Array.from(countryData.keys())[0];
        updateGraph(initialCountry);
    }).catch(function(error) {
        console.error('Error loading or processing data:', error);
    });

    // Define updateGraph as a global function
    window.updateGraph = function(country) {
        console.log("Updating graph for:", country);
        var filteredData = countryData.get(country);

        if (!filteredData) {
            console.error("No data for country:", country);
            return;
        }

        console.log("Filtered Data:", filteredData);

        y.domain([0, d3.max(filteredData, function(d) { return d.percentage; })]);

        var valueline = d3.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.percentage); });

        svg.selectAll("*").remove();

        // Add the country name text
        svg.append("text")
            .attr("class", "country-name")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text(country);

        svg.append("path")
            .data([filteredData])
            .attr("class", "line")
            .attr("d", valueline)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", "2px");

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.format("d")).tickValues([2018, 2019, 2020, 2021]));

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("class", "x axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .text("Years");

        svg.append("text")
            .attr("class", "y axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 20)
            .text("% Foreign Doctors");
    }
});

// We need to ensure handleCountryClick is accessible and calls updateGraph
window.handleCountryClick = function(countryName) {
    console.log("Country clicked:", countryName);
    updateGraph(countryName); // We call the updateGraph function defined in linegraph.js
};
