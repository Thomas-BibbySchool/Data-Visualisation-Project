document.addEventListener('DOMContentLoaded', function initScatterplot() {
    var w = 550;
    var h = 300;
    var paddingXScale = 60;
    var paddingYScale = 60;

    // Load CSV data directly
    d3.csv("./data/scatterplot_datatset2.csv").then(function(data) {
        if (!data.length) {
            console.error("Data is empty or not loaded correctly");
            return;
        }

        // Tooltip div setup
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("padding", "10px")
            .style("background", "white")
            .style("border", "1px solid #000")
            .style("border-radius", "5px")
            .style("pointer-events", "none"); // To prevent mouse events on the tooltip itself

        // Function to draw the scatterplot for a given year
        function drawScatterPlot(year) {
            // Filter the data for the selected year
            var yearData = data.filter(d => +d.Year === year);

            // Map the data to extract relevant fields and convert strings to numbers
            var dataset = yearData.map(function(d) {
                return {
                    Country: d.Country,
                    COU: d.COU,
                    Year: +d.Year,
                    ForeignPercent: +d['Foreign_%_Value'],
                    HealthPerformance: +d['Health_Performance_Value']
                };
            });

            // Define the scales for x and y axes
            var xScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, d => d.ForeignPercent)])
                .range([paddingXScale, w - paddingXScale]);

            var yScale = d3.scaleLinear()
                .domain([0, d3.max(dataset, d => d.HealthPerformance)])
                .range([h - paddingYScale, paddingYScale]);

            // Clear previous SVG content
            d3.select("#scatterplot svg").remove();

            // Create the SVG element
            var svg = d3.select("#scatterplot")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

            // Create circles for each data point
            var circles = svg.selectAll("circle")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("cx", d => xScale(d.ForeignPercent))
                .attr("cy", d => yScale(d.HealthPerformance))
                .attr("r", 5)
                .attr("fill", "blue")
                .on("mouseover", function(event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html("Country: " + d.Country + "<br/>" +
                        "% Foreign-trained doctors: " + d.ForeignPercent.toFixed(2) + "%" + "<br/>" +
                        "Health Performance (% of all patients waiting more than 3 months): " + d.HealthPerformance.toFixed(2))
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            // Create text labels for each data point
            svg.selectAll("text.data-label")
                .data(dataset)
                .enter()
                .append("text")
                .attr("class", "data-label")
                .attr("x", d => xScale(d.ForeignPercent) + 10)
                .attr("y", d => yScale(d.HealthPerformance) + 5)
                .text(d => d.COU)
                .attr("font-size", "10px")
                .attr("fill", "grey");

            // Create axes
            var xAxis = d3.axisBottom(xScale).ticks(5);
            var yAxis = d3.axisLeft(yScale).ticks(5);

            svg.append("g")
                .attr("class", "axis")
                .attr("transform", `translate(0,${h - paddingYScale})`)
                .call(xAxis);

            svg.append("g")
                .attr("class", "axis")
                .attr("transform", `translate(${paddingXScale},0)`)
                .call(yAxis);

            // Adding labels for the axes
            // X-axis label
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", w / 2 + 130)
                .attr("y", h - 10)
                .text("Percentage of foreign-trained doctors");

            // Y-axis label
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", 20)
                .attr("x", -h / 2 + paddingYScale)
                .text("Healthcare Performance");
        }

        // Initial plot
        drawScatterPlot(2018);

        // Update the plot when the slider value changes
        document.getElementById('yearSliderScatter').addEventListener('input', function() {
            var selectedYear = +this.value;
            document.getElementById('yearDisplay').textContent = selectedYear;
            drawScatterPlot(selectedYear);
        });
    }).catch(function(error) {
        console.error("Error loading or parsing the data:", error);
    });
});
