library(shiny)
library(ksea)
library(RJSONIO)

## Necessary data
regulonsSimple <- readRDS("data/regulons_ensembl.rds")
allactivities <- readRDS("data/activities_ensembl.rds")
complexesNR <- readRDS("data/complexes.rds")
                                        #tomove
complexesListEnsembl <- tapply(as.character(complexesNR$ensembl_id),complexesNR$complex_id, function(x) unique(x))
complexesListUniprot <- tapply(as.character(complexesNR$uniprot),complexesNR$complex_id, function(x) unique(x))
complexid2name <- tapply(as.character(complexesNR$name),complexesNR$complex_id, function(x) unique(x))

iterations <- 10

                                        # Define server logic required to draw a histogram
shinyServer(function(input, output) {

  df <- reactive({
    inFile <- input$file1
    if(is.null(inFile)){
      return(NULL)
    }

    read.csv(inFile$datapath,
             header=input$header,
             sep=input$sep,
             quote=input$quote)
  })
  
  # Customizing columns
  output$columnControls <- renderUI({
    if(is.null(df())){
      return(NULL)
    }
    validate(need((nrow(df()) > 10) && (ncol(df() > 3)) , "The uploaded table is not properly formatted. Check the file format options."))

    list(
      h4(HTML("<span class='glyphicon glyphicon-search' aria-hidden='true'></span>"),"Preview"),
      renderTable({head(df())}),
      tags$hr(),
      h4(HTML("<span class='glyphicon glyphicon-tags' aria-hidden='true'></span>"),"File Content Mapping"),
      fluidRow(
        column(6,selectInput("protein","Protein Column",choices = names(df()))),
        column(6,selectInput("proteinDB","Protein ID",choices = c("Uniprot","Ensembl")))
      ),
      fluidRow(
        column(6,selectInput("position","Position Column",choices = names(df())))
      ),
      fluidRow(
        column(6,selectInput("quantification","Quantification Column",choices = names(df()))),
        column(6,selectInput("quantificationFormat","Quantification Format",choices = c("log2 Ratio","Ratio")))
      ),
      tags$hr()
    )
  })

  ## KSEA Activities
  testResults <- eventReactive(input$submitButton, {
    data <- df()
    
    if(is.null(data)){
      testResults <- readRDS("data/AKTi.rds")
      return(testResults)
    }

    data <- data[!is.na(data[[input$quantification]]),]
    data <- data[order(data[[input$quantification]], decreasing=TRUE),]

    sitenames <- paste(data[[input$protein]],data[[input$position]],sep="_")
    regulonsToRun <- regulonsSimple[sapply(regulonsSimple, function(x) length(x[x %in% sitenames])) > 0]

    validate(need(length(names(regulonsToRun)) > 1 , "Oops! something went wrong.\nPlease submit the table again and double check the format is correct."))
    
    testResults <- list()
    testResults$data <- data
    columnList <- list(protein=input$protein,
                       position=input$position,
                       quantification=input$quantification)
    testResults$column <- columnList
                                        # Create a Progress object
    progress <- shiny::Progress$new()
                                        # Make sure it closes when we exit this reactive, even if there's an error
    on.exit(progress$close())

    progress$set(message = "Calculating Kinase Activities...", value = 0)
    
    results <- list()
    for(index in 1:length(regulonsToRun)){
      results[[index]] <- ksea(sitenames,
                               data[[input$quantification]],
                               regulonsToRun[[index]],
                               display=FALSE,
                               returnRS=FALSE,
                               significance=TRUE,
                               trial=iterations)
      progress$inc(1/length(regulonsToRun), detail=paste(names(regulonsToRun)[index],
                                                         " Kinase (",
                                                         index,
                                                         "/",
                                                         length(regulonsToRun),
                                                         ")",
                                                         sep=""))
    }
    
    resultsDf <- do.call("rbind",results)
    resultsDf <- as.data.frame(resultsDf)
    row.names(resultsDf) <- names(regulonsToRun)
    resultsDf$quantSubstrates <- sapply(regulonsSimple[row.names(resultsDf)], function(x) sum(x %in% sitenames))
    resultsDf$p.value <- unlist(resultsDf$p.value)
    resultsDf$p.value[resultsDf$p.value == 0] <- 1/iterations
    resultsDf$signed <- -log10(resultsDf$p.value) * (((resultsDf$ES >= 0)*1) + ((resultsDf$ES < 0)*-1))
    resultsDf$ES <- round(unlist(resultsDf$ES),digits=3)
    resultsDf$signed <- round(resultsDf$signed, digits=3)
    resultsDf <- resultsDf[order(resultsDf$signed),]

    testResults$activities <- resultsDf
    
    ## Correlation
    kinasesToCompare <- row.names(resultsDf)[row.names(resultsDf) %in% row.names(allactivities)]
    conditionSim <- apply(allactivities[kinasesToCompare,],
                          2,
                          function(x) cor.test(resultsDf[kinasesToCompare, "signed"],x,use="pairwise.complete.obs"))

    correlationResults <- data.frame(names=colnames(allactivities),
                                     cor=round(sapply(conditionSim, function(x) x$estimate),digits=3),
                                     p.value=sapply(conditionSim, function(x) x$p.value))
    correlationResults <- correlationResults[order(correlationResults$p.value),,drop=FALSE]

    testResults$conditionSim <- correlationResults

    
    progress$set(message = "Calculating Complex Regulation", value = 0)
                                        #adjust in the future
    complexesList <- complexesListEnsembl
    
    logvalues <- data[[input$quantification]]
    ranking <- data[[input$protein]]
    complexesToRun <- complexesList[sapply(complexesList, function(x) length(unique(logvalues[ranking %in% x]))) > 1]

    results <- list()

    for(index in 1:length(complexesToRun)){
      setvalues <- logvalues[ranking %in% complexesToRun[[index]]]
      if(length(unique(setvalues))>1){
        withCallingHandlers(suppressWarnings(thetest <- ks.test(logvalues, setvalues)), warning = function(w) {print(w)})
        results[[index]] <- thetest
      }else{
        results[[index]] <- NA
      }
      progress$inc(1 / length(complexesToRun), detail = paste("Complex ",
                                                              index,
                                                              "/",
                                                              length(complexesToRun),
                                                              sep=""))
      
    }

    resultsDf <- do.call("rbind",results)
    resultsDf <- as.data.frame(resultsDf)
    resultsDf$p.value <- unlist(resultsDf$p.value)
    resultsDf$p.value[resultsDf$p.value == 0] <- min(resultsDf$p.value[resultsDf$p.value != 0], na.rm=TRUE)
    resultsDf$themeans <- sapply(complexesToRun, function(x) mean(logvalues[ranking %in% x]))
    resultsDf$signed <- -log10(resultsDf$p.value) * (((resultsDf$themeans>=0)*1) + ((resultsDf$themeans<0)*-1))
    row.names(resultsDf) <- names(complexesToRun)
    resultsDf$complexName <- sapply(complexid2name[as.character(names(complexesToRun))],function(x) x[1])
    resultsDf <- resultsDf[order(resultsDf$signed,decreasing=FALSE), ,drop=FALSE]

    testResults$complexes <- resultsDf
    testResults
  })

######################
  ## Kinase Activities
###################
  
  ## Table
  output$kinaseTable <- renderDataTable({
    df <- testResults()$activities
    df$names <- row.names(testResults()$activities)
    df <- df[,c("names","quantSubstrates","ES","signed")]
    df <- df[order(abs(df$signed), decreasing=TRUE),]
    names(df) <- c("Kinase","Substrates","ES","Activity")
    df
  },
  options = list(orderClasses = TRUE,
                 lengthChange = FALSE,
                 pageLength = 45,
                 searching = FALSE)
  )
  
  ## topKinases
  output$topKinases <- renderTable({
    df <- tail(testResults()$activities,n=5)
    df$kinases <- row.names(df)
    df <- df[order(df$signed,decreasing=TRUE),]
    df <- df[,c("kinases","quantSubstrates","signed")]
    names(df) <- c("","Substrates","Activity")
    df
  },include.rownames=FALSE)
  
  ## bottomKinases
  output$bottomKinases <- renderTable({
    df <- head(testResults()$activities[,c("signed","quantSubstrates")],n=5)
    df$kinases <- row.names(df)
    df <- df[order(df$signed,decreasing=FALSE),]
    df <- df[,c("kinases","quantSubstrates","signed")]
    names(df) <- c("","Substrates","Activity")
    df
  },include.rownames=FALSE)

  ## Barplot
  output$kinaseActBarplot <- reactive({
    activities <- testResults()$activities[,"signed",drop=FALSE]
    activities <- activities[order(activities[,1],decreasing=FALSE), ,drop=FALSE]
    
    RJSONIO::toJSON(data.frame(kinase=row.names(activities),activity=activities[,1]),byrow=TRUE, colNames=TRUE)
  })

  # downloadHandler() takes two arguments, both functions.
  output$downloadKinases <- downloadHandler(
    filename = function() {
      paste("kinaseActivities", "csv", sep = ".")
    },
    content = function(file) {
      df <- testResults()$activities
      df$names <- row.names(testResults()$activities)
      df <- df[,c("names","quantSubstrates","ES","signed")]
      df <- df[order(abs(df$signed), decreasing=TRUE),]
      names(df) <- c("Kinase","Substrates","ES","Activity")
      write.csv(df,file,row.names = FALSE)
    }
  )

  
  ## KSEA Plot
  output$kseaPlot <- renderPlot({
    data <- testResults()$data
    data <- data[!is.na(data[[testResults()$column$quantification]]),]
    data <- data[order(data[[testResults()$column$quantification]], decreasing=TRUE),]

    sitenames <- paste(data[[testResults()$column$protein]],
                       data[[testResults()$column$position]],
                       sep="_")
    if(length(input$kinaseActBarplot) > 0){
      regulon <- regulonsSimple[[input$kinaseActBarplot]]
      ksea(sitenames,
           data[[testResults()$column$quantification]],
           regulon,
           display=TRUE,
           returnRS=FALSE,
           significance=FALSE)
    }
  })
  

  
  ## ####################
  ## ## Condition similarity
  ## ###################
  ## Table
  output$kinaseSimTable <- renderDataTable({
    df <- testResults()$conditionSim
    df <- df[,c("names","cor","p.value")]
    names(df) <- c("Other conditions","R","P-value")
    df
  },
  options = list(orderClasses = TRUE,
                 lengthChange = FALSE,
                 pageLength = 45,
                 searching = FALSE)
  )  
  ## topSimilar
  output$topSimilar <- renderTable({
    similarities <- testResults()$conditionSim
    similarities <- similarities[similarities$cor > 0, ]
    similarities <- similarities[order(similarities[,3]), ]
    df <- similarities[,c(1,2,3)]
    names(df) <- c("","R","P-value")
    head(df,n=5)
  },include.rownames=FALSE)
  ## bottomSimilar
  output$bottomSimilar <- renderTable({
    similarities <- testResults()$conditionSim
    similarities <- similarities[similarities$cor < 0, ]
    similarities <- similarities[order(similarities[,3]), ]
    df <- similarities[,c(1,2,3)]
    names(df) <- c("","R","P-value")
    head(df,n=5)
  },include.rownames=FALSE)

  ## barplot
  output$kinaseSimBarplot <- reactive({
    similarities <- testResults()$conditionSim
    similarities <- similarities[order(similarities[,2],decreasing=FALSE), ,drop=FALSE]
    RJSONIO::toJSON(data.frame(condition=1:nrow(similarities),
                               label=unlist(similarities[,1]),
                               activity=unlist(similarities[,2])),
                    byrow=TRUE, colNames=TRUE)
  })

  output$downloadSims <- downloadHandler(
    filename = function() {
      paste("conditionSimilarities", "csv", sep = ".")
    },
    content = function(file) {
      df <- testResults()$conditionSim
      df <- df[,c("names","cor","p.value")]
      names(df) <- c("Other conditions","R","P-value")
      write.csv(df,file,row.names = FALSE)
    }
  )

  
  ## ####################
  ## ## Complexes
  ## ###################
  
  output$complexesTable <- renderDataTable({
    df <- testResults()$complexes
    df <- df[,c("complexName","signed")]
    df <- df[order(abs(df$signed), decreasing=TRUE), ]
    names(df) <- c("Complex","Regulation")
    df
  },
  options = list(orderClasses = TRUE,
                 lengthChange = FALSE,
                 pageLength = 45,
                 searching = FALSE)
  )

  ## topComplexes
  output$topComplexes <- renderTable({
    cplxregulation <- testResults()$complexes
    cplxregulation <- cplxregulation[order(cplxregulation$signed), ]
    df <- cplxregulation[,c("complexName","signed")]
    names(df) <- c("","Regulation")
    tail(df,n=5)
  },include.rownames=FALSE)
  ## bottomComplexes
  output$bottomComplexes <- renderTable({
    cplxregulation <- testResults()$complexes
    cplxregulation <- cplxregulation[order(cplxregulation$signed), ]
    df <- cplxregulation[,c("complexName","signed")]
    names(df) <- c("","Regulation")
    head(df,n=5)
  },include.rownames=FALSE)

  ## ## barplot
  output$complexesBarplot <- reactive({
    cplxregulation <- testResults()$complexes
    cplxregulation <- cplxregulation[order(cplxregulation[,"signed"],decreasing=FALSE), ,drop=FALSE]
    
    RJSONIO::toJSON(data.frame("corum_id"=row.names(cplxregulation),
                               "complex"=cplxregulation$complexName,
                               "activity"=cplxregulation$signed),
                    byrow=TRUE, colNames=TRUE)
  })

  output$downloadCplxs <- downloadHandler(
    filename = function() {
      paste("complexRegulation", "csv", sep = ".")
    },
    content = function(file) {
      df <- testResults()$complexes
      df <- df[,c("complexName","signed")]
      df <- df[order(abs(df$signed), decreasing=TRUE), ]
      names(df) <- c("Complex","Regulation")
      write.csv(df,file,row.names = FALSE)
    }
  )

  
})
