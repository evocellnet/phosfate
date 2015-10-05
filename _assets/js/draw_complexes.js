"use strict";

var CPLXDATA = 'data/complexes.csv';
var CPLXCONTAINER = "#complexes-barchart-view"
var condition = "1_1";
var showncomplexes = 70;


var margin = {top: 60, right: 10, bottom: 10, left: 30},
    width = $(CPLXCONTAINER).width() - margin.left - margin.right,
    height = width * 1.2;

var cplxsvg = d3.select(CPLXCONTAINER).append("svg")
// .attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
// .attr('preserveAspectRatio','xMinYMin')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "cplxchartsvg")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// function createBarchart(data, parentContainer){
var xcplx = d3.scale.linear()
    .range([0, width]);
var ycplx = d3.scale.ordinal()
    .rangeRoundBands([0, height], .2);
var xcplxAxis = d3.svg.axis()
    .scale(xcplx)
    .orient("top");

d3.csv(CPLXDATA, function(error, data) {
    var data = $.map(data, function (d){return {"complex":d.complex,"activity":d["cond_" + condition],"corum_id":d.id};});
    
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
    data = data.slice(1,(showncomplexes/2)).concat(data.slice(data.length - (showncomplexes/2) , data.length))
    xcplx.domain(d3.extent(data, function(d) { return d.activity; })).nice();
    ycplx.domain(data.map(function(d) { return d.complex; }));

    var bar = cplxsvg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", function(d) { return d.activity < 0 ? "bar negative" : "bar positive"; })
        .attr("x", function(d) { xcplx(Math.min(0, d.activity)) })
        .attr("transform", function(d, i) { return "translate("+xcplx(Math.min(0, d.activity))+"," + ycplx(d.complex) + ")"; })
        .on("click", cplxClick)

    var rect = bar.append("rect")
        .attr("height", ycplx.rangeBand())
        .attr("width",  function(d) { return Math.abs(xcplx(d.activity) - xcplx(0)) });    

    bar.append("text")
        .attr("class", "barlabels")
        .attr("text-anchor", function(d) { return d.activity > 0 ? "end" : "start" })
        .attr("x", function(d) { return d.activity > 0 ? Math.abs(xcplx(d.activity) - xcplx(0)) - 3 : 3 })
        .attr("y", ycplx.rangeBand() / 2)
        .attr("dy", ".35em")
        .style("font-size", function(d) { return ycplx.rangeBand() + "px"; })
        .text(function(d, i) { return d.complex });
    
    cplxsvg.append("g")
        .attr("class", "x axis")
        .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", -30)
        .text("Complex Regulation");
    cplxsvg.append("g")
        .attr("class", "y axis")
    // .call(yAxis)
        .append("line")
        .attr("x1", xcplx(0))
        .attr("x2", xcplx(0))
        .attr("y2", height);
    cplxsvg.append("g")
        .attr("class","halfaxis")
        .append("line")
        .attr("x1",  xcplx(Math.min.apply(Math, $.map(test, function (d){return d.activity}))))
        .attr("x2",  xcplx(Math.max.apply(Math, $.map(data, function (d){return d.activity}))))
        .attr("y1", height/2 - (ycplx.rangeBand()/2))
        .attr("y2", height/2 - (ycplx.rangeBand()/2));    
    
});    


// ** Update data section (Called from the onclick)
function updateCplxData(condition) {

    // Get the data again
    d3.csv(CPLXDATA, function(error, data) {
        var data = $.map(data, function (d){return {"complex":d.complex,"activity":d["cond_" + condition],"corum_id":d.id};});
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
        data = data.slice(1,(showncomplexes/2)).concat(data.slice(data.length - (showncomplexes/2) , data.length))

        // Scale the range of the data again 
        xcplx.domain(d3.extent(data, function(d) { return d.activity; })).nice();
        ycplx.domain(data.map(function(d) { return d.complex; }));

        // Select the section we want to apply our changes to
        var chart = d3.select(CPLXCONTAINER).transition();
        
        cplxsvg.selectAll(".y.axis").remove()
            .transition()
            .duration(500)

        cplxsvg.selectAll(".bar").remove()
            .transition()
            .duration(500)
        
        cplxsvg.selectAll(".barlabels").remove()
            .transition()
            .duration(500)
        
        
        var bar = cplxsvg.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", function(d) { return d.activity < 0 ? "bar negative" : "bar positive"; })
            .attr("x", function(d) { xcplx(Math.min(0, d.activity)) })
            .attr("transform", function(d, i) { return "translate("+xcplx(Math.min(0, d.activity))+"," + ycplx(d.complex) + ")"; })
            .on("click", cplxClick)

        var rect = bar.append("rect")
            .attr("height", ycplx.rangeBand())
            .attr("width",  function(d) { return Math.abs(xcplx(d.activity) - xcplx(0)) });    

        bar.append("text")
            .attr("class", "barlabels")
            .attr("text-anchor", function(d) { return d.activity > 0 ? "end" : "start" })
            .attr("x", function(d) { return d.activity > 0 ? Math.abs(xcplx(d.activity) - xcplx(0)) - 3 : 3 })
            .attr("y", ycplx.rangeBand() / 2)
            .attr("dy", ".35em")
            .style("font-size", function(d) { return ycplx.rangeBand() + "px"; })
            .text(function(d, i) { return d.complex });

        cplxsvg.append("g")
            .attr("class", "y axis")
            .append("line")
            .attr("x1", xcplx(0))
            .attr("x2", xcplx(0))
            .attr("y2", height);
        
        chart.select(".x.axis") // change the x axis
            .duration(500)
            .call(xcplxAxis);

    });
}

function cplxClick(d){
    var url = "http://mips.helmholtz-muenchen.de/genre/proj/corum/complexdetails.html?id="
    window.open(url + d.corum_id,'_blank');
}
// function updateBarChartWindow(){
//     thewidth = $(ACTCONTAINER).width();
//     theheight = thewidth * 1.2;
//     $("#cplxchartsvg").attr("width", thewidth + margin.left + margin.right)
//         .attr("height", theheight + margin.top + margin.bottom);
//     // Check this to make it responsive in the future
//     // http://animateddata.co.uk/articles/d3/responsive/
// }




