// Adding responsiveness to the elements
$(window).on("resize", function() {
  console.log("resize");
  updateNetWindow()
  updateBarChartWindow()
}).trigger("resize");

