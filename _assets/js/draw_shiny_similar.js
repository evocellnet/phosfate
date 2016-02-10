"use strict";

var SIMCONTAINER = "#kinaseSimBarplot"
var showncondition = 80;
var aspectRatio = 2.5;
var margin = {top: 60, right: 30, bottom: 10, left: 30},
    width = (($(window).width()-100) / 2) - margin.left - margin.right,
    height = width * aspectRatio;
var barResizeFactor = 3;

var xsim = d3.scale.linear()
    .range([0, width - margin.left*2 - margin.right*2]);
var ysim = d3.scale.ordinal()
    .rangeRoundBands([0, height], .2);
var xsimAxis = d3.svg.axis()
    .scale(xsim)
    .orient("top");

var kinaseSimBinding = new Shiny.OutputBinding();
$.extend(kinaseSimBinding, {
    find: function(scope) {
        return $(scope).find(SIMCONTAINER);
    },
    renderValue: function(el, data) {
        var simsvg = d3.select(el).append("svg")
            .attr("width", width - margin.left - margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("id", "simchartsvg")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        data = $.parseJSON(data);
        
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

        data = data.slice(1,(showncondition/2)).concat(data.slice(data.length - (showncondition/2) , data.length))
        var test = data
        xsim.domain(d3.extent(data, function(d) { return d.activity; })).nice();
        ysim.domain(data.map(function(d) { return d.condition; }));
                
        
        var bar = simsvg.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr('main', function(d) {return d.condition})
            .attr("class", function(d) { return d.activity < 0 ? "bar negative" : "bar positive"; })
            .attr("x", function(d) { xsim(Math.min(0, d.activity)) })
            .attr("transform", function(d, i) { return "translate("+xsim(Math.min(0, d.activity))+"," + ysim(d.condition) + ")"; })
        
        bar.append("rect")
            .attr("height", ysim.rangeBand())
            .attr("width",  function(d) { return Math.abs(xsim(d.activity) - xsim(0)) })


        bar.append("text")
            .attr("class", "barlabels")
            .attr("text-anchor", function(d) { return d.activity > 0 ? "end" : "start" })
            .attr("x", function(d) { return d.activity > 0 ? Math.abs(xsim(d.activity) - xsim(0)) - 3 : 3 })
            .attr("y", ysim.rangeBand() / 2)
            .attr("dy", ".35em")
            .style("font-size", function(d) { return ysim.rangeBand() + "px"; })
            .text(function(d, i) { return d.label });

        simsvg.append("g")
            .attr("class", "x axis")
            .append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", width/2)
            .attr("y", -30)
            .text("Correlated Conditions");

        simsvg.append("g")
            .attr("class", "y axis")
            .append("line")
            .attr("x1", xsim(0))
            .attr("x2", xsim(0))
            .attr("y2", height);

        simsvg.append("g")
            .attr("class","halfaxis")
            .append("line")
            .attr("x1",  xsim(Math.min.apply(Math, $.map(test, function (d){return d.activity}))))
            .attr("x2",  xsim(Math.max.apply(Math, $.map(data, function (d){return d.activity}))))
            .attr("y1", height/2 - (ysim.rangeBand()/2))
            .attr("y2", height/2 - (ysim.rangeBand()/2));    

        simsvg.select(".x.axis") // change the x axis
            .call(xsimAxis);

    }
});
Shiny.outputBindings.register(kinaseSimBinding, 'kinaseSimBinding.networkbinding');



function updateBarSimWindow(thepwidth,thepheight){
        
    var thischart = $("#simchartsvg");
  
    xsim.range([0,thepwidth - margin.left*2 - margin.right*2])
    ysim.rangeRoundBands([0, thepheight - margin.top], .2);
  
    // svg element
    thischart.parent().attr("width", thepwidth + margin.left)
    thischart.parent().attr("height", thepheight + margin.top)
      
    d3.select(SIMCONTAINER).selectAll(".barlabels")
            .attr("x", function(d) { return d.activity > 0 ? Math.abs(xsim(d.activity) - xsim(0)) - 3 : 3 })
            .style("font-size", function(d) { return ysim.rangeBand() + "px"; })
            .attr("y", ysim.rangeBand() / 2)
    
    d3.select(SIMCONTAINER).selectAll(".bar rect")
      .attr("width", function(d) { return Math.abs(xsim(d.activity) - xsim(0)) })
      .attr("height", ysim.rangeBand())
    
    d3.select(SIMCONTAINER).selectAll(".bar")
            .attr("x", function(d) { xsim(Math.min(0, d.activity)) })
            .attr("transform", function(d, i) { return "translate("+xsim(Math.min(0, d.activity))+"," + ysim(d.condition) + ")"; })
    //Axis    
    d3.select(SIMCONTAINER).select(".x.axis").call(xsimAxis);    
    d3.select(SIMCONTAINER).select(".x.label").attr("x", thepwidth/2)
    $("#simchartsvg .y.axis line").attr("x1",xsim(0));
    $("#simchartsvg .y.axis line").attr("x2",xsim(0));
    $("#simchartsvg .y.axis line").attr("y2",thepheight);
}




