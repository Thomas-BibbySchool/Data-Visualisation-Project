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

    var parseYear = d3.timeParse("%Y");

    var data, countryData;

    d3.csv("./data/linegraph_dataset2.csv").then(function(loadedData) {
        console.log("Data loaded:", loadedData);

        data = loadedData.map(function(d) {
            return {
                country: d.country,
                year: parseYear(d.year),
                percentage: +d.value
            };
        });

        countryData = d3.group(data, d => d.country);

        var select = d3.select("#countrySelect");

        select.selectAll("option")
            .data(Array.from(countryData.keys()))
            .enter()
            .append("option")
            .text(d => d);

        select.on("change", function(event) {
            var selectedCountry = event.target.value;
            updateGraph(selectedCountry);
        });

        // Initialize with the first country
        var initialCountry = Array.from(countryData.keys())[0];
        updateGraph(initialCountry);
    }).catch(function(error) {
        console.error('Error loading or processing data:', error);
    });

    function updateGraph(country) {
        console.log("Updating graph for:", country);
        var filteredData = countryData.get(country);

        x.domain(d3.extent(filteredData, function(d) { return d.year; }));
        y.domain([0, d3.max(filteredData, function(d) { return d.percentage; })]);

        var valueline = d3.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.percentage); });

        svg.selectAll("*").remove();

        svg.append("path")
            .data([filteredData])
            .attr("class", "line")
            .attr("d", valueline)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", "2px");

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

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
