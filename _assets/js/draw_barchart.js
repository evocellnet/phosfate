"use strict";

var ACTDATA = 'data/activities.csv';
var ACTCONTAINER = "#activities-barchart-view"

var margin = {top: 60, right: 10, bottom: 10, left: 30},
    width = $(ACTCONTAINER).width() - margin.left - margin.right,
    height = width * 1.2;

function createBarchart(datapath, parentElement, condition){

    var svg = d3.select(ACTCONTAINER).append("svg")
        // .attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
    // .attr('preserveAspectRatio','xMinYMin')
        .attr("width", width + margin.left + margin.right)
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
    var yAxis = d3.svg.axis()
        .scale(x)
        .orient("left");

    d3.csv(datapath, function(error, data) {

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


        x.domain(d3.extent(data, function(d) { return d.activity; })).nice();
        y.domain(data.map(function(d) { return d.kinase; }));

        var bar = svg.selectAll(".bar")
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
            .attr("text-anchor", function(d) { return d.activity > 0 ? "end" : "start" })
            .attr("x", function(d) { return d.activity > 0 ? Math.abs(x(d.activity) - x(0)) - 3 : 3 })
            .attr("y", y.rangeBand() / 2)
            .attr("dy", ".35em")
            .style("font-size", function(d) { return y.rangeBand() + "px"; })
            .text(function(d, i) { return d.kinase });

        svg.append("g")
            .attr("class", "x axis")
          .append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", width/2)
            .attr("y", -30)
            .text("Kinase Activities");
        svg.append("g")
            .attr("class", "y axis")
            // .call(yAxis)
            .append("line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y2", height);

        d3.select("input").on("change", change);

        var sortTimeout = setTimeout(function() {
            d3.select("input").property("checked", true).each(change);
        }, 2000);

        function barClick(d, i){
            $("#kinaseselector").val(d.kinase).change();            
        }
        
        function change() {
            clearTimeout(sortTimeout);

            // Copy-on-write since tweens are evaluated after a delay.
            var y0 = y.domain(data.sort(this.checked
                ? function(a, b) { return b.activity - a.activity; }
                : function(a, b) { return d3.ascending(a.kinase, b.kinase); })
                .map(function(d) { return d.kinase; }))
                .copy();

            svg.selectAll(".bar").sort(function(a, b) { return y0(a.kinase) - y0(b.kinase); });

            var transition = svg.transition().duration(500),
                delay = function(d, i) { return i * 10; };

            transition.selectAll(".bar")
                .delay(delay)
                .attr("transform", function(d, i) { return "translate("+x(Math.min(0, d.activity))+"," +  y0(d.kinase) + ")"; });
                // .attr("y", function(d) { return y0(d.kinase); });

            transition.select(".x.axis")
                .call(xAxis)
              .selectAll("g")
                .delay(delay);
        }
        change()
    });    
}


function updateBarChartWindow(){
    thewidth = $(ACTCONTAINER).width();
    theheight = thewidth * 1.2;
    $("#chartsvg").attr("width", thewidth + margin.left + margin.right)
        .attr("height", theheight + margin.top + margin.bottom);
    // Check this to make it responsive in the future
    // http://animateddata.co.uk/articles/d3/responsive/
}




