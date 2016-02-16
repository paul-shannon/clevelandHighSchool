#----------------------------------------------------------------------------------------------------
.ChinookLinearModel <- setClass ("ChinookLinearModel", contains = "ChinookAnalysis")
#----------------------------------------------------------------------------------------------------
# only functions - not methods - can be dispatched to in a web socket handler.
# since these functions sometimes need information and operations which properly belong
# to instances of the class specified here, we create (and seal within this package)
# the "local.state" environment, so that called-back functions have access to all that they need

local.state <- new.env(parent=emptyenv())
#----------------------------------------------------------------------------------------------------
# constructor
ChinookLinearModel <- function(server)
{
    #printf("starting ChinookLinearModel ctor")
    obj <- .ChinookLinearModel(ChinookAnalysis(name="LinearModel"))
    setServer(obj, server)
    registerMessageHandlers(obj)
    local.state[["self"]] <- obj
    obj

} # Chinook constructor
#----------------------------------------------------------------------------------------------------
setMethod("registerMessageHandlers", "ChinookLinearModel",

  function (obj) {
     addMessageHandler(getServer(obj), "correlateVectors", "LinearModel.correlate")
     })

#----------------------------------------------------------------------------------------------------
LinearModel.correlate <- function(channel, msg)
{
   printf("--- entering LinearModel.correlate")
   print(msg)
   datasetName <- msg$payload$datasetName
   dataframeName  <- msg$payload$dataframeName
   feature.1 <- msg$payload$feature1
   feature.2 <- msg$payload$feature2

   server <- getServer(local.state[["self"]])
   dataset <- getDatasetByName(server, datasetName)
   lm <- LinearModel(dataset, dataframeName)

   x <- correlate(lm, feature.1, feature.2)

   xRange <- range(x$vec1)[2] - range(x$vec1)[1]
   xMin <- min(x$vec1) - (0.1 * xRange)
   xMax <- max(x$vec1) + (0.1 * xRange)

   yRange <- range(x$vec2)[2] - range(x$vec2)[1]
   yMin <- min(x$vec2) - (0.1 * yRange)
   yMax <- max(x$vec2) + (0.1 * yRange)

   payload <- list(entities=x$entities,
                   vec1Name=x$vec1.name,
                   vec2Name=feature.2,
                   vec1=x$vec1,
                   vec2=x$vec2,
                   vec1Min=xMin,
                   vec1Max=xMax,
                   vec2Min=yMin,
                   vec2Max=yMax,
                   correlation=x$cor)

   response <- jsonlite::toJSON(list(cmd=msg$callback, callback="", status="success", payload=payload),
                                auto_unbox=TRUE)

   if("WebSocket" %in% is(channel))
      channel$send(response)
   else
      return(response)

} # LinearModel.correlate
#----------------------------------------------------------------------------------------------------
