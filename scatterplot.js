function initScatterplot() {
    var w = 550;
    var h = 300;
    var paddingXScale = 60;
    var paddingYScale = 60;
    var paddingTextX = 10;


    //generating a random dataset to prove the chart is scalable
    // var dataset = [];
    // var amountOfDataInDataset = 10;
    // //the Math.random(), generates a random number between 0 and 1 and then multiplies by 1000, so the range that will be present will be from 0 to 1000
    // var xDataRange = Math.random()*1000;
    // var yDataRange = Math.random()*1000;
    // var zDataRange = Math.random()*5; //creates a range from 0 to 5
    // for(var i = 0; i < amountOfDataInDataset; i++) {
    //     //will generate a random number between 0 and 1000 and Math.floor() will round the number to a whole number
    //     var newDataPointX = Math.floor(Math.random()*xDataRange);
    //     var newDataPointY = Math.floor(Math.random()*yDataRange);
    //     var newDataPointZ = 2 + Math.floor(Math.random()*zDataRange); //"2 + " is added so that the radius value is large enough to be visible
    //     dataset.push([newDataPointX, newDataPointY, newDataPointZ]); //pushes the randomly generated data values into the dataset array
    // }

    d3.csv("%foreign_only_data2.csv").then(function(data) {
        foreign_data = data.map(function(d) {
            return {
                COU: d.COU,
                Country: d.Country,
                Year: +d.Year,
                Value: +d.Value
            };
        });

        var yScale = d3.scaleLinear() //creating a scale for the vertical direction
            .domain([0, //domain is created from the 0 to the maximum y value
                d3.max(foreign_data, function(d) {
                    return d.Value;
                })])
            .range([h - paddingYScale, paddingYScale]);

        d3.csv("healthcare_performance_only_data2.csv").then(function(data) {
            foreign_data = data.map(function (d) {
                return {
                    COU: d.COU,
                    Country: d.Country,
                    Year: +d.Year,
                    Value: +d.Value
                };
            });
        });

        var xScale = d3.scaleLinear() //creating a scale for the horizontal direction
            .domain([0, //domain is created from the 0 to the maximum x value
                d3.max(dataset, function(d) {
                    return d[0];
                })])
            .range([paddingXScale, w - paddingXScale]);

        var xAxis = d3.axisBottom() //creating the x-axis
            .ticks(5)
            .scale(xScale); //scale according to the scale function we created for the horizontal direction

        var yAxis = d3.axisLeft() //creating the y-axis
            .ticks(5)
            .scale(yScale); //scales according to the scale function we created for the vertical direction

        //creating a svg element
        var svg = d3.select("#scatterplot")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        //creating a circle for each data point
        svg.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("cx", function(d, i) {
                return xScale(d[0]); //x-coordinate
            })
            .attr("cy", function(d) {
                return yScale(d[1]); //y-coordinate
            })
            .attr("r", function(d) {
                return d[2]*2; //sets the radius
            })
            .attr("fill", function(d) {
                if(d[0]>300 && d[1]>40) //condition for coloring and highlighting the circles
                {
                    return "red";
                }
                else
                {
                    return "black";
                }
            });

        //adds text labels for each circle drawn
        svg.selectAll("text")
            .data(dataset)
            .enter()
            .append("text")
            .text(function(d) {
                return d[0] + "," + d[1]; //displays the coordinate values
            })
            .attr("x", function(d, i) {
                return xScale(d[0])+paddingTextX; //x-coordinate
            })
            .attr("y", function(d) {
                return (yScale(d[1])); //y-coordinate
            });

        //g tag allows to transform all the items within the g tag
        //creating the x-axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0, " + (h - paddingYScale) + ")") //translating the x-axis to the placement position
            .call(xAxis);

        //creating the y-axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + paddingXScale + ", 0)") //translating the y-axis to the placement position
            .call(yAxis);
    });
}




window.onload = initScatterplot;