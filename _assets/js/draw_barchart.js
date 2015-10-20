"use strict";

var ACTDATA = 'data/activities.csv';
var ACTCONTAINER = "#activities-barchart-view"
var condition = "1_1";
var aspectRatio = 2.5;

var margin = {top: 60, right: 30, bottom: 10, left: 30},
    width = $(ACTCONTAINER).width() - margin.left - margin.right,
    height = width * aspectRatio;

var barResizeFactor = 3;
    
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
        .attr('main', function(d) {return d.kinase})
        .attr("class", function(d) { return d.activity < 0 ? "bar negative" : "bar positive"; })
        .attr("x", function(d) { x(Math.min(0, d.activity)) })
        .attr("transform", function(d, i) { return "translate("+x(Math.min(0, d.activity))+"," + y(d.kinase) + ")"; })
        .on("click", barClick)
    
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
            .attr('main', function(d) {return d.kinase})
            .attr("class", function(d) { return d.activity < 0 ? "bar negative" : "bar positive"; })
            .attr("x", function(d) { x(Math.min(0, d.activity)) })
            .attr("transform", function(d, i) { return "translate("+x(Math.min(0, d.activity))+"," + y(d.kinase) + ")"; })
            .on("click", barClick)
            .on("mouseover", upSize)
            .on("mouseout", downSize)
        
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
        if( $(".selectbox").select2("val") != ""){
            d3.selectAll(".bar[main^="+ $(".selectbox").select2("val") +"]").style("fill", "green");
            d3.selectAll(".bar[main^="+ $(".selectbox").select2("val") +"]").attr("barhighlighted",true);
        }
    });
}


function barClick(d, i){
    // clear
    d3.selectAll('[barhighlighted=true]').style("fill",null)
    d3.selectAll('[barhighlighted=true]').attr("barhighlighted",false);
    
    d3.select(this).attr("barhighlighted", true)
    d3.select(this).style("fill","green");
    $(".selectbox").val(d.kinase).trigger("change");;
}


d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function upSize(d, i){
    var sel = d3.select(this);
    sel.moveToFront()  //move to front
    //y coordinate changed
    sel.attr("transform", function(d, i) { return "translate("+x(Math.min(0, d.activity))+"," + (y(d.kinase)-y.rangeBand() / barResizeFactor) + ")"; })
    sel.select("rect").attr("height", y.rangeBand() * barResizeFactor) //resize rect
    sel.select("text").style("font-size", function(d) {return y.rangeBand()*barResizeFactor + "px"}) //resize text
    sel.select("text").attr("y", (y.rangeBand() * barResizeFactor) / 2)    
}
function downSize(d,i){
    var sel = d3.select(this);
    sel.attr("transform", function(d, i) { return "translate("+x(Math.min(0, d.activity))+"," + y(d.kinase) + ")"; })
    sel.select("rect").attr("height", y.rangeBand())
    sel.select("text").style("font-size", function(d) {return y.rangeBand() + "px"})
    sel.select("text").attr("y", y.rangeBand() / 2)

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




