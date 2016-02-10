
library(shiny)


htmlTemplate("profiler.html",
  inputFile = fileInput("file1", "Choose File", multiple = FALSE, accept = NULL, width = NULL),
  kinaseActBarplot = plotOutput("kinaseActBarplot",height="1400px"),
  kinaseTable = dataTableOutput('kinaseTable'),
  kinaseSimBarplot = plotOutput("kinaseSimBarplot",height="1400px"),
  kinaseSimTable = dataTableOutput('kinaseSimTable'),
  complexesBarplot = plotOutput("complexesBarplot",height="1400px"),
  complexesTable = dataTableOutput('complexesTable'),
  topKinases = tableOutput("topKinases"),
  bottomKinases = tableOutput("bottomKinases"),
  topSimilar = tableOutput("topSimilar"),
  bottomSimilar = tableOutput("bottomSimilar"),
  topComplexes = tableOutput("topComplexes"),
  bottomComplexes = tableOutput("bottomComplexes")
)


##                                         # Define UI for application that draws a histogram
## shinyUI(                               # Application title
##   htmlTemplate("index.html",
##     conditionalPanel(
##       condition= "input.submitButton != null && input.submitButton != 0",
##       tabsetPanel(
##         tabPanel("Kinase Activities",
##                  fluidRow(
##                    column(6, plotOutput("kinaseActBarplot",height="1400px")),
##                    column(6, dataTableOutput('kinaseTable'))
##                  )),
##         tabPanel("Activity Similarities",
##                  fluidRow(
##                    column(6, plotOutput("kinaseSimBarplot",height="1400px")),
##                    column(6, dataTableOutput("kinaseSimTable"))
##                  )),
##         tabPanel("Complex Regulation",
##                  fluidRow(
##                    column(6, plotOutput("complexesBarplot",height="1400px")),
##                    column(6, dataTableOutput("complexesTable"))
##                  ))
##       )
##     ),
##     conditionalPanel(
##       condition = "input.submitButton == null || input.submitButton == 0",
##       fluidRow(
##         column(2),
##         column(8,
##                wellPanel(
##                  titlePanel("Phosfate"),
##                  h4("Step 1. Data format"),
##                  checkboxInput("header", "Header", TRUE),
##                  fluidRow(
##                    column(4,
##                           radioButtons("sep", "Separator",
##                                        c(Comma=",",                              
##                                          Semicolon=";",
##                                          Tab="\t"),
##                                        ",")
##                           ),

##                    column(4,
##                           radioButtons("sep", "Separator",
##                                        c(Comma=",",
##                                          Semicolon=";",
##                                          Tab="\t"),
##                                        ",")
##                           ),
##                    column(4,
##                           radioButtons("quote", "Quote",
##                                        c(None="",
##                                          "Double Quote"="\"",
##                                          "Single Quote"="\'"),
##                                        '"')
##                           )
##                  ),

##                  tags$hr(),
                 
##                  h4("Step 2. Upload data"),
##                  fileInput("file1",
##                            "Choose CSV File",
##                            accept=c("text/csv","text/comma-separated-values,text/plain",".csv")
##                            ),
                 
##                  uiOutput("columnControls")
##                )
##                ),
##         column(2)
##       )

##     )
##   )
## )
