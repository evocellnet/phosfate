
// Adding responsiveness to the elements
$(window).on("resize", function() {
    console.log("resize");
    updateNetWindow()
    updateBarChartWindow()
    $(".tab-content .tab-pane .well").css("min-height",  $(NETCONTAINER).parent().width() + "px")
    $(".cntainr .well").css("min-height",
                            ($(".col-md-4").height() - $("#netandserch").height() - parseInt($("hr").css("marginBottom")) - parseInt($(".well").css("marginBottom"))) + "px")
    
}).trigger("resize");


$('button[data-select2-open]').click(function(){
  $('#' + $(this).data('select2-open')).select2('open');
});

