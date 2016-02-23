
// Adding responsiveness to the elements
$(window).on("resize", function() {
    console.log("resize")
    thepwidth = Math.max($(ACTCONTAINER).width(),$(CPLXCONTAINER).width(),$(SIMCONTAINER).width());
    thepwidth = thepwidth - margin.left - margin.right;
    thepheight =$(ACTCONTAINER).height();
    thepheight = thepheight - margin.top - margin.bottom;

    updateBarChartWindow(thepwidth,thepheight)
    updateBarCplxWindow(thepwidth,thepheight)
    updateBarSimWindow(thepwidth,thepheight)    
}).trigger("resize");


$(document).ready(function(){
    $(".nav-tabs").click(function(){
        setTimeout(function(){
            $(window).resize();
        },300)
    })

    $("#file1").on("change",function(){
        $("#submitButton").show();
    });
    
    $("#submitButton").click(function(){
        $("#results").css("visibility", "hidden");
        $("div[role='main']").css("height","0px");
        setTimeout(function(){
            if($(".shiny-progress").length == 0 && $("#results").css("visibility") == "hidden"){
                var newdiv = $('<div></div>');
                newdiv.addClass("alert");
                newdiv.addClass("alert-danger");
                var glyphi = $('<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>');
                newdiv.append(glyphi);
                newdiv.append("<b>Oops! Something went wrong.</b>\nPlease submit the data again and double check the format is correct.")
                $("div[role='main']").append(newdiv);
                $("#results").css("height","0px");
                $("div[role='main']").css("height","100%");
            }
        },2000)
    })

    $("#exampleLink").click(function(){
        $("#submitButton").click()
        $("#results").css("visibility","visible");
    })
    
    $("#topKinases").on("shiny:value", function(event){
        console.log("test");
        $("#results").css("visibility", "visible");
        $("div[role='main']").css("height","100%");
    })

    $("#formatcontroller").click(function(){
        if( $("#formatcontroller span").attr("class") == "glyphicon glyphicon-chevron-right"){
            $("#formatcontroller span").attr("class","glyphicon glyphicon-chevron-down")
        }else{
            $("#formatcontroller span").attr("class","glyphicon glyphicon-chevron-right")
        }
    })
    
})


$(function () {
    $('#tab-4163-1 a').click(function (e) {
        e.preventDefault();
        $('a[href="' + $(this).attr('href') + '"]').tab('show');
        setTimeout(function(){
            $(window).resize();
        },100)
    })
});
