printf = function (...) print (noquote (sprintf (...)))
#----------------------------------------------------------------------------------------------------
.LinearModel <- setClass ("LinearModel",
                   representation = representation(
                        dataset="Dataset",
                        dataframe.name="character")
                   )
#----------------------------------------------------------------------------------------------------
setGeneric('lmDataSummary',   signature='obj', function(obj) standardGeneric ('lmDataSummary'))
setGeneric("correlate",     signature='obj', function(obj, feature1, feature2, omittedEntities=NA) standardGeneric("correlate"))
#----------------------------------------------------------------------------------------------------
LinearModel <- function(dataset,  dataframe.name)
{
   stopifnot(dataframe.name %in% .recognized.dataframe.names(dataset))
   obj <- .LinearModel(dataset=dataset, dataframe.name=dataframe.name)
   obj

} # LinearModel constructor
#----------------------------------------------------------------------------------------------------
.recognized.dataframe.names <- function(dataset)
{
   subset(getManifest(dataset), class=="data.frame")$variable

} # .recognized.dataframe.names
#----------------------------------------------------------------------------------------------------
setMethod("lmDataSummary", "LinearModel",

  function (obj) {
     msg <- sprintf("LinearModel for dataset %s, data.frame %s", getName(obj@dataset), obj@dataframe.name)
     msg
     })

#----------------------------------------------------------------------------------------------------
setMethod("show", "LinearModel",
 function (obj) {
     cat(lmDataSummary(obj), "\n", sep="")
     })

#----------------------------------------------------------------------------------------------------
setMethod("correlate", "LinearModel",

   function(obj, feature1, feature2, omittedEntities=NA){

      df <- getItem(obj@dataset, obj@dataframe.name)

      if(!all(is.na(omittedEntities))){
         keeper.row.names <- setdiff(rownames(df), omittedEntities)
         df <- df[keeper.row.names,]
         printf(" *** LinearModel, after removing omittedEntites, nrow: %d", nrow(df))
         }
       
      vec1 <- df[, feature1]
      vec2 <- df[, feature2]
      entities <- rownames(df)

      sort.order <- order(vec1)
      vec1 <- vec1[sort.order]
      vec2 <- vec2[sort.order]
      entities <- entities[sort.order]

      #browser()
      cor <- cor(vec1, vec2)
        # calculate the regression line
      yFit <- fitted(line(vec1, vec2))
      list(entities=entities, vec1.name=feature1, vec2.name=feature2, vec1=vec1, vec2=vec2,
           yFit=yFit, cor=cor)
      }) # correlation

#----------------------------------------------------------------------------------------------------

