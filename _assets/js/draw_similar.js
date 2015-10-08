"use strict";

var SIMDATA = 'data/correlations.csv';
var SIMCONTAINER = "#similar-barchart-view"
var CONDDESCRIPTIONDATA ="data/conddescription.csv"
var condition = "1_1";
var showncondition = 50;
var aspectRatio = 1.5;

var simsvg = d3.select(SIMCONTAINER).append("svg")
// .attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
// .attr('preserveAspectRatio','xMinYMin')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "simchartsvg")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// function createBarchart(data, parentContainer){
var xsim = d3.scale.linear()
    .range([0, width]);
var ysim = d3.scale.ordinal()
    .rangeRoundBands([0, height], .2);
var xsimAxis = d3.svg.axis()
    .scale(xsim)
    .orient("top");


d3.csv(SIMDATA, function(error, data) {
    var data = $.map(data, function (d){return {"condition":d.condition,"activity":d["cond_" + condition], "label":d.label};});
        
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
    data = data.slice(1,(showncondition/2)).concat(data.slice(data.length - (showncondition/2) , data.length))
    test = data
    xsim.domain(d3.extent(data, function(d) { return d.activity; })).nice();
    ysim.domain(data.map(function(d) { return d.condition; }));

    var bar = simsvg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", function(d) { return d.activity < 0 ? "bar negative" : "bar positive"; })
        .attr("x", function(d) { xsim(Math.min(0, d.activity)) })
        .attr("transform", function(d, i) { return "translate("+xsim(Math.min(0, d.activity))+"," + ysim(d.condition) + ")"; })
        .on("click", similarClick);

    var rect = bar.append("rect")
        .attr("height", ysim.rangeBand())
        .attr("width",  function(d) { return Math.abs(xsim(d.activity) - xsim(0)) });    

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
    // simsvg.append("g")
    //     .attr("class", "y axis")
    // // .call(yAxis)
    //     .append("line")
    //     .attr("x1", xsim(0))
    //     .attr("x2", xsim(0))
    //     .attr("y2", height);
    simsvg.append("g")
        .attr("class","halfaxis")
        .append("line")
        .attr("x1",  xsim(Math.min.apply(Math, $.map(test, function (d){return d.activity}))))
        .attr("x2",  xsim(Math.max.apply(Math, $.map(data, function (d){return d.activity}))))
        .attr("y1", height/2 - (ysim.rangeBand()/2))
        .attr("y2", height/2 - (ysim.rangeBand()/2));    
    
});    


// ** Update data section (Called from the onclick)
function updateSimData(condition) {
    // Get the data again
    d3.csv(SIMDATA, function(error, data) {
        var data = $.map(data, function (d){return {"condition":d.condition,"activity":d["cond_" + condition], "label":d.label};});
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
        data = data.slice(1,(showncondition/2)).concat(data.slice(data.length - (showncondition/2) , data.length))

        // Scale the range of the data again 
        xsim.domain(d3.extent(data, function(d) { return d.activity; })).nice();
        ysim.domain(data.map(function(d) { return d.condition; }));

        // Select the section we want to apply our changes to
        var chart = d3.select(SIMCONTAINER).transition();
        
        simsvg.selectAll(".y.axis").remove()
            .transition()
            .duration(500)

        simsvg.selectAll(".bar").remove()
            .transition()
            .duration(500)
        
        simsvg.selectAll(".barlabels").remove()
            .transition()
            .duration(500)
        
        
        var bar = simsvg.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", function(d) { return d.activity < 0 ? "bar negative" : "bar positive"; })
            .attr("x", function(d) { xsim(Math.min(0, d.activity)) })
            .attr("transform", function(d, i) { return "translate("+xsim(Math.min(0, d.activity))+"," + ysim(d.condition) + ")"; })
            .on("click", similarClick);

        var rect = bar.append("rect")
            .attr("height", ysim.rangeBand())
            .attr("width",  function(d) { return Math.abs(xsim(d.activity) - xsim(0)) });    

        bar.append("text")
            .attr("class", "barlabels")
            .attr("text-anchor", function(d) { return d.activity > 0 ? "end" : "start" })
            .attr("x", function(d) { return d.activity > 0 ? Math.abs(xsim(d.activity) - xsim(0)) - 3 : 3 })
            .attr("y", ysim.rangeBand() / 2)
            .attr("dy", ".35em")
            .style("font-size", function(d) { return ysim.rangeBand() + "px"; })
            .text(function(d, i) { return d.label });

        simsvg.append("g")
            .attr("class", "y axis")
            .append("line")
            .attr("x1", xsim(0))
            .attr("x2", xsim(0))
            .attr("y2", height);
        
        chart.select(".x.axis") // change the x axis
            .duration(500)
            .call(xsimAxis);

    });
}

function similarClick(d){
    d3.selectAll('[highlighted=true]').style("fill", function(d) { return d3.rgb(d.color) });
    d3.selectAll('[highlighted=true]').attr("highlighted",false);
    d3.selectAll(".node[main^=cond_"+d.condition+"]").style("fill","yellow");
    d3.selectAll(".node[main^=cond_"+d.condition+"]").attr("highlighted",true);

    createDescriptionDiv(d3.selectAll('.node[main^=cond_'+ d.condition +']').data()[0], "#descriptionTable");
    updateKinaseData(d.condition);
    updateCplxData(d.condition);
    updateSimData(d.condition);
}


// function updateBarChartWindow(){
//     thewidth = $(ACTCONTAINER).width();
//     theheight = thewidth * 1.2;
//     $("#simchartsvg").attr("width", thewidth + margin.left + margin.right)
//         .attr("height", theheight + margin.top + margin.bottom);
//     // Check this to make it responsive in the future
//     // http://animateddata.co.uk/articles/d3/responsive/
// }




