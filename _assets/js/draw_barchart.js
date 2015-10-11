"use strict";

var ACTDATA = 'data/activities.csv';
var ACTCONTAINER = "#activities-barchart-view"
var condition = "1_1";
var aspectRatio = 2.5;

var margin = {top: 60, right: 30, bottom: 10, left: 30},
    width = $(ACTCONTAINER).width() - margin.left - margin.right,
    height = width * aspectRatio;
    
var kinsvg = d3.select(ACTCONTAINER).append("svg")
// .attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
// .attr('preserveAspectRatio','xMinYMin')
    .attr("width", width - margin.left - margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "chartsvg")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// function createBarchart(data, parentContainer){
var x = d3.scale.linear()
    .range([0, width]);
var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], .2);
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top");


d3.csv(ACTDATA, function(error, data) {
    var data = $.map(data, function (d){return {"kinase":d.kinase,"activity":d["cond_" + condition]};});

    data = $.grep(data, function(d) {
        return d.activity != "NA";
    });

    data.forEach(function(d) {
        if(d.activity == "NA"){
            d.activity = 0;
        }else{
            d.activity = +d.activity;
        }
    });

    data = data.sort(function(a,b) {return b.activity - a.activity});

    x.domain(d3.extent(data, function(d) { return d.activity; })).nice();
    y.domain(data.map(function(d) { return d.kinase; }));

    var bar = kinsvg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", function(d) { return d.activity < 0 ? "bar negative" : "bar positive"; })
        .attr("x", function(d) { x(Math.min(0, d.activity)) })
        .attr("transform", function(d, i) { return "translate("+x(Math.min(0, d.activity))+"," + y(d.kinase) + ")"; })
        .on("click", barClick);

    bar.append("rect")
        .attr("height", y.rangeBand())
        .attr("width",  function(d) { return Math.abs(x(d.activity) - x(0)) })

    bar.append("text")
        .attr("class", "barlabels")
        .attr("text-anchor", function(d) { return d.activity > 0 ? "end" : "start" })
        .attr("x", function(d) { return d.activity > 0 ? Math.abs(x(d.activity) - x(0)) - 3 : 3 })
        .attr("y", y.rangeBand() / 2)
        .attr("dy", ".35em")
        .style("font-size", function(d) { return y.rangeBand() + "px"; })
        .text(function(d, i) { return d.kinase });
    
    kinsvg.append("g")
        .attr("class", "x axis")
        .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", -30)
        .text("Kinase Activities");

    // kinsvg.append("g")
    //     .attr("class", "y axis")
    // // .call(yAxis)
    //     .append("line")
    //     .attr("x1", x(0))
    //     .attr("x2", x(0))
    //     .attr("y2", height);  
});    


// ** Update data section (Called from the onclick)
function updateKinaseData(condition) {    
    // Get the data again
    d3.csv(ACTDATA, function(error, data) {
        var data = $.map(data, function (d){return {"kinase":d.kinase,"activity":d["cond_" + condition]};});
        data = $.grep(data, function(d) {
            return d.activity != "NA";
        });
        data.forEach(function(d) {
            if(d.activity == "NA"){
                d.activity = 0;
            }else{
                d.activity = +d.activity;
            }
        });

        data = data.sort(function(a,b) {return b.activity - a.activity});

        // Scale the range of the data again 
        x.domain(d3.extent(data, function(d) { return d.activity; })).nice();
        y.domain(data.map(function(d) { return d.kinase; }));

        // Select the section we want to apply our changes to
        var chart = d3.select(ACTCONTAINER).transition();
        kinsvg.selectAll(".y.axis").remove()
            .transition()
            .duration(500)

        kinsvg.selectAll(".bar").remove()
            .transition()
            .duration(500)

        kinsvg.selectAll(".barlabels").remove()
            .transition()
            .duration(500)
        
        var bar = kinsvg.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", function(d) { return d.activity < 0 ? "bar negative" : "bar positive"; })
            .attr("x", function(d) { x(Math.min(0, d.activity)) })
            .attr("transform", function(d, i) { return "translate("+x(Math.min(0, d.activity))+"," + y(d.kinase) + ")"; })
            .on("click", barClick);

        // var y0 = y.domain(data.sort( function(a, b) { return b.activity - a.activity })
        //                   .map(function(d) { return d.kinase; }))
        //     .copy();
        
        // svg.selectAll(".bar").sort(function(a, b) { return y0(a.kinase) - y0(b.kinase); });

        // bar.transition()
        //     .delay(function(d, i) { return i * 10; })
        //     .duration(200)
        //     .attr("transform", function(d, i) { return "translate("+x(Math.min(0, d.activity))+"," +  y0(d.kinase) + ")"; });

        bar.append("rect")
            .attr("height", y.rangeBand())
            .attr("width",  function(d) { return Math.abs(x(d.activity) - x(0)) })

        bar.append("text")
            .attr("class", "barlabels")
            .attr("text-anchor", function(d) { return d.activity > 0 ? "end" : "start" })
            .attr("x", function(d) { return d.activity > 0 ? Math.abs(x(d.activity) - x(0)) - 3 : 3 })
            .attr("y", y.rangeBand() / 2)
            .attr("dy", ".35em")
            .style("font-size", function(d) { return y.rangeBand() + "px"; })
            .text(function(d, i) { return d.kinase });

        kinsvg.append("g")
            .attr("class", "y axis")
            .append("line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y2", height);

        chart.select(".x.axis") // change the x axis
            .duration(500)
            .call(xAxis);
    });
}


function barClick(d, i){
    $(".selectbox").val(d.kinase).trigger("change");;
}

function updateBarChartWindow(){    
  
    var thischart = $("#chartsvg");
  
    x.range([0,thepwidth - margin.left])
    y.rangeRoundBands([0, thepheight - margin.top], .2);
  
    // svg element
    thischart.parent().attr("width", thepwidth + margin.left)
    thischart.parent().attr("height", thepheight + margin.top)
    
    d3.select(ACTCONTAINER).selectAll(".barlabels")
            .attr("x", function(d) { return d.activity > 0 ? Math.abs(x(d.activity) - x(0)) - 3 : 3 })
            .style("font-size", function(d) { return y.rangeBand() + "px"; })
            .attr("y", y.rangeBand() / 2)

    d3.select(ACTCONTAINER).selectAll(".bar rect")
      .attr("width", function(d) { return Math.abs(x(d.activity) - x(0)) })
      .attr("height", y.rangeBand())

    d3.select(ACTCONTAINER).selectAll(".bar")
            .attr("x", function(d) { x(Math.min(0, d.activity)) })
            .attr("transform", function(d, i) { return "translate("+x(Math.min(0, d.activity))+"," + y(d.kinase) + ")"; })
    //Axis    
    d3.select(ACTCONTAINER).select(".x.axis").call(xAxis);    
    d3.select(ACTCONTAINER).select(".x.label").attr("x", thepwidth/2)
    $("#chartsvg .y.axis line").attr("x1",x(0));
    $("#chartsvg .y.axis line").attr("x2",x(0));
    $("#chartsvg .y.axis line").attr("y2",thepheight);
}




