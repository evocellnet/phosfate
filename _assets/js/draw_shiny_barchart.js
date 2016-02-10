
var ACTCONTAINER = "#kinaseActBarplot"
var aspectRatio = 2.5;
var margin = {top: 60, right: 10, bottom: 10, left: 10};

var barResizeFactor = 3;

var margin = {top: 60, right: 30, bottom: 10, left: 30},
    width = (($(window).width()-100) / 2) - margin.left - margin.right,
    height = width * aspectRatio;

var x = d3.scale.linear()
    .range([0, width - margin.left*2 - margin.right*2]);
var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], .2);
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top");

var kinaseActBinding = new Shiny.OutputBinding();
$.extend(kinaseActBinding, {
    find: function(scope) {
        return $(scope).find(ACTCONTAINER);
    },
    renderValue: function(el, data) {
        var kinsvg = d3.select(el).append("svg")
            .attr("width", width - margin.left - margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("id", "chartsvg")
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

        // data = data.sort(function(a,b) {return b.activity - a.activity});

        x.domain(d3.extent(data, function(d) { return d.activity; })).nice();
        y.domain(data.map(function(d) { return d.kinase; }));

        var bar = kinsvg.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr('main', function(d) {return d.kinase})
            .attr("class", function(d) { return d.activity < 0 ? "bar negative" : "bar positive"; })
            .attr("x", function(d) { x(Math.min(0, d.activity)) })
            .attr("transform", function(d, i) { return "translate("+x(Math.min(0, d.activity))+"," + y(d.kinase) + ")"; })
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
            .attr("class", "x axis")
            .append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", width/2)
            .attr("y", -30)
            .text("Kinase Activities");

        kinsvg.append("g")
            .attr("class", "y axis")
            .append("line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y2", height);
        
        kinsvg.select(".x.axis") // change the x axis
            .call(xAxis);

        
    }
});
updateBarChartWindow();
Shiny.outputBindings.register(kinaseActBinding, 'kinaseActBinding.networkbinding');


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

function updateBarChartWindow(thepwidth,thepheight){
    
    var thischart = $("#chartsvg");
    x.range([0,thepwidth - margin.left*2 -margin.right*2])
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




