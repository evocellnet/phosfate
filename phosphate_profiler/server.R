library(shiny)
library(ksea)

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
    list(
      h5("Preview"),
      renderTable({head(df())}),
      tags$hr(),
      h4("Step 3. File Content"),
      selectInput("protein","Protein",choices = names(df())),
      selectInput("proteinDB","Protein DB",choices = c("Uniprot","Ensembl")),
      selectInput("position","Position",choices = names(df())),
      selectInput("quantification","Quantification",choices = names(df())),
      selectInput("quantificationFormat","Quant. Format",choices = c("log2 Ratio","Ratio")),
      tags$hr(),
      actionButton("submitButton", "Submit")
    )

  })

  ## KSEA Activities
  testResults <- eventReactive(input$submitButton, {
    data <- df()
    data <- data[!is.na(data[[input$quantification]]),]
    data <- data[order(data[[input$quantification]], decreasing=TRUE),]

    sitenames <- paste(data[[input$protein]],data[[input$position]],sep="_")
    regulonsToRun <- regulonsSimple[sapply(regulonsSimple, function(x) length(x[x %in% sitenames])) > 0]

    testResults <- list()

    # Create a Progress object
    progress <- shiny::Progress$new()
    # Make sure it closes when we exit this reactive, even if there's an error
    on.exit(progress$close())

    progress$set(message = "Calculating Kinase Activities", value = 0)
    
    ## withProgress(message = 'Calculating Kinase Activities', value = 0, {
      results <- list()
      for(index in 1:length(regulonsToRun)){
        results[[index]] <- ksea(sitenames,
                                 data[[input$quantification]],
                                 regulonsToRun[[index]],
                                 display=FALSE,
                                 returnRS=FALSE,
                                 significance=TRUE,
                                 trial=iterations)
        progress$inc(1/length(regulonsToRun), detail=paste("Kinase: ",
                                                              names(regulonsToRun)[index],
                                                              " (",
                                                              index,
                                                              "/",
                                                              length(regulonsToRun),
                                                              ")",
                                                           sep=""))
        ## incProgress(1 / length(regulonsToRun), detail = paste("Kinase: ",
        ##                                                       names(regulonsToRun)[index],
        ##                                                       " (",
        ##                                                       index,
        ##                                                       "/",
        ##                                                       length(regulonsToRun),
        ##                                                       ")",
        ##                                                       sep=""))
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
    ## })


    withProgress(message = 'Calculating complex regulation', value = 0, {
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
        incProgress(1 / length(complexesToRun), detail = paste("Complex ",
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
    })
    
    testResults
    
  })

######################
  ## Kinase Activities
###################
  ## Table
  output$kinaseTable <- renderDataTable({cbind(names = row.names(testResults()$activities), testResults()$activities)},
                                        options = list(orderClasses = TRUE,
                                                       paging = FALSE,
                                                       searching = FALSE)
                                        )

  output$topKinases <- renderTable({tail(testResults()$activities[,c("signed","quantSubstrates")],n=5)})
  output$bottomKinases <- renderTable({head(testResults()$activities[,c("signed","quantSubstrates")],n=5)})

  ## barplot
  ## output$kinaseActBarplot <- renderPlot({
  ##   activities <- testResults()$activities[,"signed",drop=FALSE]
  ##   activities <- activities[order(activities[,1],decreasing=FALSE), ,drop=FALSE]
  ##   col <- colorRampPalette(c("#67001F", "#B2182B", "#D6604D", 
  ##                             "#F4A582", "#FDDBC7", "#FFFFFF", "#D1E5F0", "#92C5DE", 
  ##                             "#4393C3", "#2166AC", "#053061"))(200)  
    
  ##   barplot(activities[,1],
  ##           names=row.names(activities),
  ##           las=2,
  ##           horiz=TRUE,
  ##           cex.names=0.8,
  ##           border=FALSE,
  ##           col=col[as.numeric(cut(activities[,1], breaks=seq(-3.01,3,length.out=200)))])
  ## })

  output$kinaseActBarplot <- reactive({
    activities <- testResults()$activities[,"signed",drop=FALSE]
    activities <- activities[order(activities[,1],decreasing=FALSE), ,drop=FALSE]
    
    RJSONIO::toJSON(data.frame(kinase=row.names(activities),activity=activities[,1]),byrow=TRUE, colNames=TRUE)
  })
  
  ## ####################
  ## ## Condition similarity
  ## ###################
  ## Table
  output$kinaseSimTable <- renderDataTable({testResults()$conditionSim},
                                           options = list(orderClasses = TRUE,
                                                          paging = FALSE,
                                                          searching = FALSE)
                                           )
  output$topSimilar <- renderTable({
    similarities <- testResults()$conditionSim
    similarities <- similarities[similarities$cor > 0, ]
    similarities <- similarities[order(similarities[,3]), ]
    head(similarities[,c(1,2,3)],n=5)
  },include.rownames=FALSE)
  output$bottomSimilar <- renderTable({
    similarities <- testResults()$conditionSim
    similarities <- similarities[similarities$cor < 0, ]
    similarities <- similarities[order(similarities[,3]), ]
    head(similarities[,c(1,2,3)],n=5)
  },include.rownames=FALSE)

  ## barplot
  ## output$kinaseSimBarplot <- renderPlot({
  ##   similarities <- testResults()$conditionSim
  ##   similarities <- similarities[order(similarities[,2],decreasing=FALSE), ,drop=FALSE]
  ##   col <- colorRampPalette(c("#67001F", "#B2182B", "#D6604D", 
  ##                             "#F4A582", "#FDDBC7", "#FFFFFF", "#D1E5F0", "#92C5DE", 
  ##                             "#4393C3", "#2166AC", "#053061"))(200)  
    
  ##   barplot(similarities[,2],
  ##           names=similarities[,1],
  ##           las=2,
  ##           horiz=TRUE,
  ##           cex.names=0.8,
  ##           border=FALSE,
  ##           col=col[as.numeric(cut(similarities[,2], breaks=seq(-1,1,length.out=200)))])
  ## })

  output$kinaseSimBarplot <- reactive({
    similarities <- testResults()$conditionSim
    similarities <- similarities[order(similarities[,2],decreasing=FALSE), ,drop=FALSE]
    RJSONIO::toJSON(data.frame(condition=1:nrow(similarities),
                               label=unlist(similarities[,1]),
                               activity=unlist(similarities[,2])),
                    byrow=TRUE, colNames=TRUE)
  })
  
  ## ####################
  ## ## Complexes
  ## ###################

  output$complexesTable <- renderDataTable({cbind(names = row.names(testResults()$complexes), testResults()$complexes)},
                                           options = list(orderClasses = TRUE,
                                                          paging = FALSE,
                                                          searching = FALSE)
                                           )
  output$topComplexes <- renderTable({
    cplxregulation <- testResults()$complexes
    cplxregulation <- cplxregulation[order(cplxregulation$signed), ]
    tail(cplxregulation[,c("complexName","signed")],n=5)
  },include.rownames=FALSE)
  output$bottomComplexes <- renderTable({
    cplxregulation <- testResults()$complexes
    cplxregulation <- cplxregulation[order(cplxregulation$signed), ]
    head(cplxregulation[,c("complexName","signed")],n=5)
  },include.rownames=FALSE)

  ## ## barplot
  ## output$complexesBarplot <- renderPlot({
  ##   cplxregulation <- testResults()$complexes
  ##   cplxregulation <- cplxregulation[order(cplxregulation[,"signed"],decreasing=FALSE), ,drop=FALSE]
  ##   col <- colorRampPalette(c("#67001F", "#B2182B", "#D6604D", 
  ##                             "#F4A582", "#FDDBC7", "#FFFFFF", "#D1E5F0", "#92C5DE", 
  ##                             "#4393C3", "#2166AC", "#053061"))(201)  

  ##   barplot(cplxregulation$signed,
  ##           names=row.names(cplxregulation),
  ##           las=2,
  ##           horiz=TRUE,
  ##           cex.names=0.8,
  ##           border=FALSE)
  ##           ## col=col[as.numeric(cut(cplxregulation[,"signed"],
  ##           ##                        breaks=seq(min(cplxregulation[,"signed"]),length.out=100),
  ##           ##                        0,
  ##           ##                        seq(max(cplxregulation[,"signed"]),length.out=100)))])

  ## })

  output$complexesBarplot <- reactive({
    cplxregulation <- testResults()$complexes
    cplxregulation <- cplxregulation[order(cplxregulation[,"signed"],decreasing=FALSE), ,drop=FALSE]
    
    RJSONIO::toJSON(data.frame("corum_id"=row.names(cplxregulation),
                               "complex"=cplxregulation$complexName,
                               "activity"=cplxregulation$signed),
                    byrow=TRUE, colNames=TRUE)
  })

})
