
library(shiny)


htmlTemplate("profiler.html",
  inputFile = fileInput("file1", "", multiple = FALSE, accept = NULL, width = NULL),
  kinaseActBarplot = plotOutput("kinaseActBarplot", height="1400px"),
  kinaseTable = dataTableOutput("kinaseTable"),
  kinaseSimBarplot = plotOutput("kinaseSimBarplot", height="1400px"),
  kinaseSimTable = dataTableOutput("kinaseSimTable"),
  complexesBarplot = plotOutput("complexesBarplot", height="1400px"),
  complexesTable = dataTableOutput("complexesTable"),
  topKinases = tableOutput("topKinases"),
  bottomKinases = tableOutput("bottomKinases"),
  topSimilar = tableOutput("topSimilar"),
  bottomSimilar = tableOutput("bottomSimilar"),
  topComplexes = tableOutput("topComplexes"),
  bottomComplexes = tableOutput("bottomComplexes"),
  kseaPlot = plotOutput("kseaPlot")
)
