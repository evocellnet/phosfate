
// Adding responsiveness to the elements
$(window).on("resize", function() {
    console.log("resize");
    thepwidth = Math.max($(ACTCONTAINER).width(),$(CPLXCONTAINER).width(),$(SIMCONTAINER).width());
    thepwidth = thepwidth - margin.left - margin.right;
    thepheight = $(NETCONTAINER).width();
    thepheight = thepheight - margin.top - margin.bottom;

    console.log(thepheight)

    updateNetWindow()
    updateBarChartWindow()
    updateBarCplxWindow()
    updateBarSimWindow()
    $(".tab-content .tab-pane .well").css("min-height",  $(NETCONTAINER).parent().width() + "px")
    $(".cntainr .well").css("min-height",
                            ($(".col-md-4").height() - $("#netandserch").height() - parseInt($("hr").css("marginBottom")) - parseInt($(".well").css("marginBottom"))) + "px")
    
}).trigger("resize");


$('button[data-select2-open]').click(function(){
  $('#' + $(this).data('select2-open')).select2('open');
});

