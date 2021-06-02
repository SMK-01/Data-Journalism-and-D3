var svgWidth = 960;
var svgHeight = 500;
var margin = {top: 20, right: 40, bottom: 80, left: 100};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("body")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
                    .attr("transform", 
                          `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
                       .domain([.95*d3.min(data, d => d[chosenXAxis]),
                       1.05*d3.max(data, d => d[chosenXAxis])])
                      .range([0, width]);

return xLinearScale;

}


// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {

  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(newXScale, chosenXAxis, circlesGroup) {
  circlesGroup.transition()
              .duration(1000)
              .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "poverty:";
  }
  else {
    label = "# income:";
  }

  var toolTip = d3.tip()
                  .attr("class", "tooltip")
                  .offset([80, -60])
                  .html(function(d) {
                    return (`${d.rockband}<br>${label} ${d[chosenXAxis]}`);
                  });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", toolTip.show)
              .on("mouseout", toolTip.hide);

  return circlesGroup;
}
function renderPage(data) {

}


// Retrieve data from the CSV file and execute everything below
d3.csv("../data/data.csv").then(function(data) {
  // parse data
    data.forEach(function(data) {
    data.poverty= parseFloat(data.poverty);
    data.healthcare = parseFloat(data.healthcare);
  
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
                        .domain([0, d3.max(data, d => d.healthcare)])
                        .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
                        .classed("x-axis", true)
                        .attr("transform", `translate(0, ${height})`)
                        .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
            .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
                                .data(data)
                                .enter()
                                .append("circle")
                                .attr("cx", d => xLinearScale(d[chosenXAxis]))
                                .attr("cy", d => yLinearScale(d.healthcare))
                                .attr("r", 20)
                                .attr("fill", "blue")
                                .attr("opacity", ".08");

  var circlesTextGroup = chartGroup.selectAll("text.state")
                                .data(data)
                                .enter()
                                .append("text")
                                .classed("state",true)
                                .attr("x", d => xLinearScale(d[chosenXAxis])-10)
                                .attr("y", d => yLinearScale(d.healthcare))
                                .text(d=>d.abbr);

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
                              .attr("transform", 
                                    `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
                                    .attr("x", 0)
                                    .attr("y", 20)
                                    .attr("value", "poverty") // value to grab for event listener
                                    .classed("active", true)
                                    .text("poverty (%)");


  // append y axis
  chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .classed("axis-text", true)
            .attr("opacity", "1")
            .text("healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  // append y axis

  // x axis labels event listener
  labelsGroup.selectAll("text")
              .on("click", function() {
                  // get value of selection
                  var selectedValue = d3.select(this).attr("value");
                  if (selectedValue !== chosenXAxis) {

                    

                    // functions here found above csv import
                    // updates x scale for new data
                    xLinearScale = xScale(data, selectedValue);

                    // updates x axis with transition
                    xAxis = renderAxes(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(xLinearScale, selectedValue, circlesGroup);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(selectedValue, circlesGroup);

                    // changes classes to change bold text
                    if (selectedValue === "healthcare") {
                      albumsLabel
                        .classed("active", true)
                        .classed("inactive", false);
                      hairLengthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    }
                    else {
                         povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    }

                    // replaces chosenXAxis with value
                    chosenXAxis = selectedValue;

                  }
                });
});
