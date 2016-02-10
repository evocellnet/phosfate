"use strict";

var CPLXCONTAINER = "#complexesBarplot"
var showncomplexes = 80;
var aspectRatio = 2.5;
var margin = {top: 60, right: 30, bottom: 10, left: 30},
    width = (($(window).width()-100) / 2) - margin.left - margin.right,
    height = width * aspectRatio;
var barResizeFactor = 3;


var xcplx = d3.scale.linear()
    .range([0, width - margin.left*2 - margin.right*2]);
var ycplx = d3.scale.ordinal()
    .rangeRoundBands([0, height], .2);
var xcplxAxis = d3.svg.axis()
    .scale(xcplx)
    .orient("top");

var complexBinding = new Shiny.OutputBinding();
$.extend(complexBinding, {
    find: function(scope) {
        return $(scope).find(CPLXCONTAINER);
    },
    renderValue: function(el, data) {
        var cplxsvg = d3.select(el).append("svg")
            .attr("width", width - margin.left - margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("id", "cplxsvg")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        data = $.parseJSON(data);
        
        // var data = $.map(data, function (d){return {"complex":d.complex,"activity":d["cond_" + condition],"corum_id":d.id};});
        data = data.slice(1,(showncomplexes/2)).concat(data.slice(data.length - (showncomplexes/2) , data.length))
        var test = data
        xcplx.domain(d3.extent(data, function(d) { return d.activity; })).nice();
        ycplx.domain(data.map(function(d) { return d.corum_id; }));

        var bar = cplxsvg.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", function(d) { return d.activity < 0 ? "bar negative" : "bar positive"; })
            .attr("x", function(d) { xcplx(Math.min(0, d.activity)) })
            .attr("transform", function(d, i) { return "translate("+xcplx(Math.min(0, d.activity))+"," + ycplx(d.corum_id) + ")"; })
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
            .text("Regulated Complexes");
        
        cplxsvg.append("g")
            .attr("class", "y axis")
            .append("line")
            .attr("x1", xcplx(0))
            .attr("x2", xcplx(0))
            .attr("y2", height);
        
        cplxsvg.select(".x.axis") // change the x axis
            .call(xcplxAxis);

        cplxsvg.append("g")
            .attr("class","halfaxis")
            .append("line")
            .attr("x1",  xcplx(Math.min.apply(Math, $.map(test, function (d){return d.activity}))))
            .attr("x2",  xcplx(Math.max.apply(Math, $.map(data, function (d){return d.activity}))))
            .attr("y1", height/2 - (ycplx.rangeBand()/2))
            .attr("y2", height/2 - (ycplx.rangeBand()/2));    

        cplxsvg.select(".x.axis") // change the x axis
            .call(xcplxAxis);

    }
});
Shiny.outputBindings.register(complexBinding, 'complexBinding.networkbinding');


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


function updateBarCplxWindow(thepwidth,thepheight){    

    var thischart = $("#cplxsvg");

    xcplx.range([0,thepwidth - margin.left*2 -margin.right*2])
    ycplx.rangeRoundBands([0, thepheight - margin.top], .2);
    
    // svg element
    thischart.parent().attr("width", thepwidth + margin.left)
    thischart.parent().attr("height", thepheight + margin.top)

    d3.select(CPLXCONTAINER).selectAll(".barlabels")
            .attr("x", function(d) { return d.activity > 0 ? Math.abs(xcplx(d.activity) - xcplx(0)) - 3 : 3 })
            .style("font-size", function(d) { return ycplx.rangeBand() + "px"; })
            .attr("y", ycplx.rangeBand() / 2)

    d3.select(CPLXCONTAINER).selectAll(".bar rect")
      .attr("width", function(d) { return Math.abs(xcplx(d.activity) - xcplx(0)) })
      .attr("height", ycplx.rangeBand())

    d3.select(CPLXCONTAINER).selectAll(".bar")
            .attr("x", function(d) { xcplx(Math.min(0, d.activity)) })
            .attr("transform", function(d, i) { return "translate("+xcplx(Math.min(0, d.activity))+"," + ycplx(d.corum_id) + ")"; })

    //Axis
    d3.select(CPLXCONTAINER).select(".x.axis").call(xcplxAxis);
    d3.select(CPLXCONTAINER).select(".x.label").attr("x", thepwidth/2)
    $("#cplxsvg .y.axis line").attr("x1",xcplx(0));
    $("#cplxsvg .y.axis line").attr("x2",xcplx(0));
    $("#cplxsvg .y.axis line").attr("y2",thepheight);
}


