"use strict";

var NETDATA = 'data/net.json';
var NETCONTAINER = "#network-view";

var w = window,
    d = document,
    e = d.documentElement,
    g = NETCONTAINER,
    thewidth = $(NETCONTAINER).width(),
    theheight = 0.75 * thewidth;

var n = 100;
var r = 9;
var trans=[0,0];
var scale=1;
var color = d3.scale.category20();
var nodecolor = d3.scale.category10();
var previousd;
var counter=0;
var centerx;
var centery;

var mLinkNum = {};
var nodes = {};
var minLinks={};


// Node Colors
var colours = ["#67001F", "#B2182B", "#D6604D","#F4A582",
               "#FDDBC7", "#FFFFFF", "#D1E5F0", "#92C5DE",
               "#4393C3", "#2166AC", "#053061"];
var heatmapColour = d3.scale.linear()
    .domain(d3.range(-3, 3, 6 / (colours.length - 1)))
    .range(colours);


// Select for kinases
var theselect = document.createElement("select");
theselect.className = theselect.className + "form-control";
theselect.id = "kinaseselector"
var firstOption = document.createElement("option")
firstOption.innerHTML = "Select Kinase";
firstOption.disabled = true;
firstOption.selected = true;
theselect.appendChild(firstOption);

// Create dropdown menu
d3.csv("data/activities.csv", function(d){ return d.kinase },
       function(data){
           data.forEach(function(k){
               var anOption = document.createElement('option');
               anOption.value = k;
               anOption.innerHTML = k;
               theselect.appendChild(anOption);
           })
       });

$("#selectbox").append(theselect);

theselect.onchange = function () {
    console.log(this.value)
    var c;
    d3.csv("data/activities.csv")
        .row(function(d) { if(d.kinase == theselect.value) {return d }})
        .get(function(error, data) {
            data = data[0];
            var newdata = {};
            for (var d in data) {
                if(d != "kinase"){
                    if (data.hasOwnProperty(d)) {              
                        if(data[d] == "NA"){
                            newdata[d] = 0;
                        }else{
                            newdata[d] = +data[d];
                        }
                        
                    }
                }                
            }    
            // // dynamic bit...
            var c = d3.scale.linear()
                .domain([-3,0,3])
                .range(["red","white","blue"]);
            d3.selectAll(".node").style("stroke", function(d) { return d3.rgb(heatmapColour(newdata["cond_"+d.name])).darker() });
            d3.selectAll(".node").style("fill", function(d) { return d3.rgb(heatmapColour(newdata["cond_"+d.name])) });
        });

};


var test;
var zoom = d3.behavior.zoom()
    .scaleExtent([0.5, 10])
    .on("zoom", redraw);

var vis = d3.select(NETCONTAINER)
    .append("svg")
    .attr("id", "playgraph")
    .attr("viewBox", "0 0 " + thewidth + " " + theheight)
    .attr("preserveAspectRatio", "xMinYMin")
    .attr("pointer-events", "all")
    // .attr("transform", "translate(" + Math.min(thewidth,theheight) / 2 + "," + Math.min(theheight, thewidth) / 2 + ")")
    .call(zoom)
    .append('svg:g')
    .attr('width', thewidth)
    .attr('height', theheight)
    .append('svg:g');

var rect = vis.append('svg:rect')
    .attr('width', thewidth)
    .attr('height', theheight)
    .attr('fill', 'white').on("click", function(){
        // $(".pop-up").fadeOut(50);
        // previousd="";
        // // d3.selectAll('[highlighted=true]').style("fill", function(d) { return color(d.GO_ref); });
        // d3.selectAll('[highlighted=true]').style("fill", function(d) { return d3.rgb(d.color); });
        // d3.selectAll('[highlighted=true]').style("stroke", function(d) { return d3.rgb(d.color).darker(); });
        // d3.selectAll('[highlighted=true]').attr("highlighted",false);
    });


var force = d3.layout.force()
    .charge(-2500)
    .size([thewidth, theheight])

var drag = force.drag()
    .on("dragstart", function(){
        d3.event.sourceEvent.stopPropagation(); // silence other listeners   
    });

var link = vis.selectAll(".link"),
    gnodes = vis.selectAll(".node");

var groups;
var group;
var groupColors = {};
var groupFill = function(d, i) { return groupColors[d.key]; };
var groupPath = function(d) {    
    if(d.values.length > 2){
        return "M" + d3.geom.hull(d.values.map(function(i) { return [i.x, i.y]; })).join("L") + "Z"
    }
};

function dragstart(d, i) {
    $(".pop-up").fadeOut(50);
}
  
function updateNetWindow(){
    thewidth = $(NETCONTAINER).width();
    theheight = 0.7440 * thewidth;
    vis.attr("width", thewidth).attr("height", theheight);
    rect.attr("width", thewidth).attr("height", theheight);
}
	
function redraw() {
    $(".pop-up").fadeOut(50);
    previousd="";
    trans=d3.event.translate;
    scale=d3.event.scale;
    vis.attr("transform","translate(" + [thewidth/2 + trans[0] - centerx, theheight/2 + trans[1] - centery] + ")"+" scale(" + scale + ")");
}

$('#skipbutton').on('click',function(e){
    $("#loadingCon").fadeOut();
    $("#netCon").fadeIn();
    $("#sidebar").fadeIn();
    $("#mainpanel").fadeIn();
    $("#slide-panel").fadeIn();
})

$("#about").click(function() {
    $("#loadingCon").fadeIn();
});
  
function searchNodes(nodeNames){
    // deletee previous
    d3.selectAll('[highlighted=true]').style("fill", function(d) { return d3.rgb(d.nodecolor); });
    d3.selectAll('[highlighted=true]').attr("highlighted",false);
    if(nodeNames != ''){
        //mark this
        d3.selectAll('.node[main^='+nodeNames+']').style("fill","yellow");
        d3.selectAll('.node[main^='+nodeNames+']').attr("highlighted",true);
    }
}

function focusOnNode(nodeName){
    if(d3.selectAll('.node[main^='+nodeName+']').data().length == 1){
        $(".pop-up").fadeOut(50);
        d3.selectAll('.node[main^='+nodeName+']').attr("transform",
                                                       function(d) {
                                                           trans=[d.x*scale, d.y*scale];
                                                           zoom.translate([thewidth/2 - trans[0] - (thewidth/2 - centerx),theheight/2 - trans[1] - (theheight/2 - centery)])
                                                           zoom.scale(scale);
                                                       })
        vis.transition()
            .duration(1000)
            .attr("transform","translate(" + [thewidth/2 - trans[0],theheight/2 - trans[1]] + ")"+" scale(" + scale + ")");
        trans=zoom.translate();
        scale=zoom.scale();
    }
}


d3.json(NETDATA, function(error, graph) {
    //Backup network
    test = graph;
    // sort links first

    // Group colors vector
    for(var i=0;i < graph.nodes.length;i++){
        groupColors[graph.nodes[i].membership.toString()] = graph.nodes[i].color;
    }
    // Group memberships for nodes
    groups = d3.nest().key(function(d) {return d.membership}).entries(graph.nodes)
    group = vis.selectAll(".area")
        .data(groups)
        .attr("d",groupPath)
        .enter().insert("path", "circle")
        .attr("class", "area")
        .style("fill", groupFill)
        .style("stroke", groupFill)
        .style("stroke-width", 40)
        .style("stroke-linejoin", "round")
        .style("opacity", .2)
        .attr("d",groupPath)
    
    //Starting with the graph
    link = link.data(graph.links)
        .enter().append("svg:path")
        .attr("class", function(d) {
            var classes = "link";
            if(d.sign == 0){
                classes = classes + " negative ";
            }
            classes = classes + " " + d.membership;
            return(classes)
         })
        .style('stroke-width', 1.5)
        .attr("fill", "none")
        .attr("chromnet", function(d){ d.membership })
        // .attr("marker-end", "url(#end)")
        .attr("marker-end", function(d) {
            if(d.directed){
                return("url(#end)")
            }
        })
        .on("click",lover);
    gnodes = gnodes.data(graph.nodes)
        .enter()
        .append('g')
        .call(drag)
        .on("click",mover)
        .classed('gnode', true);

    var node = gnodes.append("path")
        .attr("class", "node")
        .attr("d", d3.svg.symbol()
              .size(function(d) { return parseInt("400");})
              .type(function(d) { return d3.svg.symbolTypes[parseInt("6")]; })
             )
        .attr('main', function(d) {return d.id})
        .style("stroke", function(d) { return d3.rgb(d.color).darker() })
        .style("fill", function(d,i) { return d3.rgb(d.color); })
    var labels = gnodes.append("text")
        .attr("dy", ".4em")
        .attr("text-anchor", "middle")
        .style("font-size","12px")
        .attr("cx", function(d) { return d.x=(d.x+(thewidth/2))*0.8 })
        .attr("cy", function(d) { return d.y=(d.y+theheight/10)*0.7 })
        .text(function(d) { return d.label; });


    // link.style("stroke", function(d) { return color(parseInt(d.state)) });
    node.append("title")
        .text(function(d) { return d.id; });

    force
        .links(graph.links)
        .nodes(graph.nodes)
        .on("tick", tick)	

    // Centering the network
    var yArray = force.nodes().map(function(d) {return d.y})
    var minY = d3.min(yArray)-(r*2);
    var maxY = d3.max(yArray)+(r*2);
    var xArray = force.nodes().map(function(d) {return d.x})
    var minX = d3.min(xArray)-(r*2);
    var maxX = d3.max(xArray)+(r*2);
    var scaleMin = Math.abs($(NETCONTAINER).width() / (maxX - minX));
    var startX = Math.abs(minX) * scaleMin;
    var startY = Math.abs(minY) * scaleMin;
    vis.attr("transform", "translate(" + [startX, startY] + ")scale(" + scaleMin + ")");
    // vis.attr("transform","translate(" + [thewidth/2 + trans[0] - centerx, theheight/2 + trans[1] - centery] + ")"+" scale(" + scale + ")");
    zoom.translate([startX, startY]);
    zoom.scale(scaleMin);
    zoom.scaleExtent([scaleMin, 4])
    vis.call(zoom);

    function tick() {
        //Nodes
        gnodes.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
        // Links
        link.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = 0,
                arc = 1;
            // get the total link numbers between source and target node
            var lTotalLinkNum = mLinkNum[d.source.index+ "," + d.target.index] || mLinkNum[d.target.index + "," + d.source.index];
            if(lTotalLinkNum > 1){
                dr = Math.sqrt(dx * dx + dy * dy);
                lTotalLinkNum = Math.round((lTotalLinkNum/2)-0.1)
                if(d.linkindex % 2 == 0){
                    arc=0;
                    // if there are multiple links between these two nodes, we need generate different dr for each path
                    dr = dr/(1 + ((1/lTotalLinkNum) * ((d.linkindex)/2 - 1)) - 0.2);
                }else{
                    dr = dr/(1 + ((1/lTotalLinkNum) * ((d.linkindex+1)/2 - 1)) - 0.2);
                }
            }
            // generate svg path
            return "M" + d.source.x + "," + d.source.y +
                "A" + dr + "," + dr + " 0 0 "+arc+ "," + d.target.x + "," + d.target.y +
                "A" + dr + "," + dr + " 0 0 "+(1-arc)+ "," + d.source.x + "," + d.source.y;
        });
        group.attr("d", groupPath);
    }

    function mover(d,i) {
        $(".well").remove();
        createDescriptionDiv(d, "#descriptionTable");
        updateKinaseData(d.name);
        updateCplxData(d.name);
        updateSimData(d.name);
        $(".barchart").fadeIn()
    }
    
    function lover(d,i) {
        $(".pop-up").fadeOut(50);
        var thisd = d.source.name + "-" + d.target.name + "-" + d.clu;
        if(thisd != previousd){
            previousd = thisd;
            $("#pop-up-link").fadeOut(100,function () {
                // Popup content
                $("#link-title").html(d.source.name + "-" + d.target.name);
                if(d.sign == 0){
                    $("#type").html("Negative");
                }else{
                    $("#type").html("Positive");
                }
                // Popup position
                // $("#state").html(d.state + " (" +d.stateType+ ")");
                $("#state").html(d.clu);
                if(d.clu == 0){
                    $("#chromnet").html('');
                }else{
                    $("#chromnet").html('');
                    $("#chromnet").html($("<div></div>")
                                         .append($("<span></span>").addClass("minititle").text("ChromNet: "))
                                         .append($("<span></span>").html(d.clu)))

                    // $("#chromnet").append($("<span></span>").addClass("minititle").text("Chromnet: "))
                    //     .append($("<span></span>").html(d.clu))
                }
                // $("#score").html(parseFloat(d.score).toFixed(3));
                // Popup position
                if(d.pubmedid[0] != "" | d.pubmedcentralid[0] != ""){
                    $("#pubmeds").html('');
                    $("#pubmeds").append($("<span></span>").addClass("minititle").text("Literature evidence: "))
                    if (d.pubmedid[0] != "") {
                        $.each(d.pubmedid, function(i,value){
                            var span = $("<span></span>").html($("<a></a>")
                                                               .attr('target', '_blank')
                                                               .attr('href', "http://www.ncbi.nlm.nih.gov/pubmed/"+value)
                                                               .text(value)
                                                              )
                            $("#pubmeds").append(span)
                            if(i != (d.pubmedid.length - 1)){
                                $("#pubmeds").append($("<span>, </span>"))
                            }
                        });
                    }
                    

                    if (d.pubmedcentralid[0] != "") {
                        if (d.pubmedid[0] != "") {
                            $("#pubmeds").append($("<span>, </span>"))
                        }
                        $.each(d.pubmedcentralid, function(i,value){
                            var span = $("<span></span>").html($("<a></a>")
                                                               .attr('target', '_blank')
                                                               .attr('href', "http://www.ncbi.nlm.nih.gov/pmc/articles/"+value)
                                                               .text(value)
                                                              )
                            $("#pubmeds").append(span)
                            if(i != (d.pubmedcentralid.length - 1)){
                                $("#pubmeds").append($("<span>, </span>"))
                            }
                        });
                    }

                }
                else{
                    $("#pubmeds").html('');
                }
                
                var popLeft = ((d.source.x + d.target.x)/2*scale)+trans[0];//lE.cL[0] + 20;
                var popTop = ((d.source.y + d.target.y)/2*scale)+trans[1];//lE.cL[1] + 70;
                // var popLeft = (((d.source.x + d.target.x)/2)*scale)+thewidth/2-centerx+trans[0];//lE.cL[0] + 20;
                // var popTop = (((d.source.y + d.target.y)/2)*scale)+theheight/2-centery+trans[1]+20;//lE.cL[1] + 70;
                $("#pop-up-link").css({"left":popLeft,"top":popTop});
                $("#pop-up-link").fadeIn(100);
            });
        }else{
            previousd = "";
        }
    }

    $(".tab-content .tab-pane .well").css("min-height",  $(NETCONTAINER).parent().width() + "px")
    $(".cntainr .well").css("min-height",
                            ($(".col-md-4").height() - $("#netandserch").height() - parseInt($("hr").css("marginBottom")) - parseInt($(".well").css("marginBottom"))) + "px")


    // Use a timeout to allow the rest of the page to load first.
    setTimeout(function() {
        centerx = thewidth/2;
        centery = theheight/2;
        gnodes.attr("transform", function(d) {
            d.x = (d.x * thewidth);
            d.y = (d.y * theheight);
        })
        $("#loadingDiv").fadeTo( 1000, 0 );
        $("#skipbutton").prop('disabled', false);
    }, 50);

    force.start()
    
});

function createDescriptionDiv(d,parentelement){
    $(parentelement).html('');
    var condesc = $('<dl></dl>').addClass('dl-horizontal');
    
    //Description
    var descriptiondt = $('<dt>Condition</dt>');
    var descriptiondd = $('<dd></dd>');
    descriptiondd.text(d.description);
    condesc.append(descriptiondt);
    condesc.append(descriptiondd);

    //Control
    var controldt = $('<dt>Control</dt>');
    var controldd = $('<dd></dd>');
    if($.inArray(d.control_description, ["Untreated","Control","vehicle"]) < 0){
        controldd.text(d.control_description);
        condesc.append(controldt);
        condesc.append(controldd);
    }

    //Control
    var controldt = $('<dt>Time</dt>');
    var controldd = $('<dd></dd>');
    if(d.time_min){
        controldd.text(d.time_min + "min");
        condesc.append(controldt);
        condesc.append(controldd);
    }
    
    // Sample
    var biodt = $('<dt>Sample</dt>');
    var biodd = $('<dd></dd>');
    biodd.text(d.biological_sample);
    condesc.append(biodt);
    condesc.append(biodd);
    $(parentelement).append(condesc);

    // Enrichment
    var enrichdt = $('<dt>Enrichment</dt>');
    var enrichdd = $('<dd></dd>');
    enrichdd.text(d.enrichment_method);
    condesc.append(enrichdt);
    condesc.append(enrichdd);
    $(parentelement).append(condesc);

    // Labelling
    var labdt = $('<dt>Labelling</dt>');
    var labdd = $('<dd></dd>');
    labdd.text(d.labelling_method);
    condesc.append(labdt);
    condesc.append(labdd);
    $(parentelement).append(condesc);

    //Journal
    var pubdt = $('<dt>Publication</dt>');
    var pubtitledd = $('<dd></dd>');
    var pubdd = $('<dd></dd>');
    pubtitledd.text(d.title)
    var year = new Date(d.publication_date).getFullYear()
    var link = $('<a></a>').attr("href","http://www.ncbi.nlm.nih.gov/pubmed/?term=" + d.pubmed_id).text(d.fauthor + " et al. (" + year +") " + d.journal)
    pubdd.append(link)
    // pubdd.text(d.fauthor + " et al. (" + year +") " + d.journal);
    condesc.append(pubdt);
    condesc.append(pubtitledd)
    condesc.append(pubdd);
    $(parentelement).append(condesc);
}
