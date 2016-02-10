
// Adding responsiveness to the elements
$(window).on("resize", function() {
    console.log("resize");
    thepwidth = Math.max($(ACTCONTAINER).width(),$(CPLXCONTAINER).width(),$(SIMCONTAINER).width());
    thepwidth = thepwidth - margin.left - margin.right;
    thepheight =$(ACTCONTAINER).height();
    thepheight = thepheight - margin.top - margin.bottom;

    updateBarChartWindow(thepwidth,thepheight)
    updateBarCplxWindow(thepwidth,thepheight)
    updateBarSimWindow(thepwidth,thepheight)    
}).trigger("resize");