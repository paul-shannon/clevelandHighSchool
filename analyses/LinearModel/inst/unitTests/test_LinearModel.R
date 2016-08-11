library(LinearModel)
library(RUnit)
library(SouthSeattleHealthImpacts)
Sys.setlocale("LC_ALL", "C")
#----------------------------------------------------------------------------------------------------
runTests <- function()
{
  test_constructor()
  test_correlate()
  test_correlateSomeLeftOut()
  test_verifyCorrelateSomeLeftOut()
  
} # runTests
#----------------------------------------------------------------------------------------------------
test_constructor = function()
{
   printf("--- test_constructor")
   d <- SouthSeattleHealthImpacts()
   dataframe.name <- "tbl.factors"
   linearModel <- LinearModel(d, dataframe.name)

   checkTrue(grepl("LinearModel", lmDataSummary(linearModel)))
   checkTrue(grepl("SouthSeattle", lmDataSummary(linearModel)))
   checkTrue(grepl("tbl.factors", lmDataSummary(linearModel)))

} # test_constructor
#----------------------------------------------------------------------------------------------------
test_correlate <- function()
{
   printf("--- test_correlate")
   d <- SouthSeattleHealthImpacts()
   dataframe.name <- "tbl.factors"
   linearModel <- LinearModel(d, dataframe.name)
   feature.1 <- "Non.white.minority.population"
   feature.2 <- "assault.hosp.per.100k"
   x <- correlate(linearModel, feature.1, feature.2)
   # x <- correlate(linearModel, feature.1, feature.2, points=someList)
   checkTrue(all(c("entities", "vec1.name", "vec2.name", "vec1", "vec2", "cor", "yFit") %in% names(x)))

   checkEquals(x$vec1.name, feature.1)
   checkEquals(x$vec2.name, feature.2)

   checkEquals(length(x$vec1), length(x$vec2))
   checkEquals(length(x$vec1), length(x$yFit))
   checkEqualsNumeric(x$cor, 0.809481, tol=1e-5)

   checkEqualsNumeric(min(x$yFit), 14.5, tol=0.1)
   checkEqualsNumeric(max(x$yFit), 73.2, tol=0.1)

   plot(x$vec1, x$vec2)
   points(x$vec1, x$yFit, col="red")

} # test_correlate
#----------------------------------------------------------------------------------------------------
test_correlateSomeLeftOut <- function()
{
   printf("--- test_correlateSomeLeftOut")

   d <- SouthSeattleHealthImpacts()
   dataframe.name <- "tbl.factors"
   linearModel <- LinearModel(d, dataframe.name)
   feature.1 <- "Non.white.minority.population"
   feature.2 <- "assault.hosp.per.100k"
   omittedEntities <- c("98108", "98178")
   x <- correlate(linearModel, feature.1, feature.2, omittedEntities)
   checkTrue(all(c("entities", "vec1.name", "vec2.name", "vec1", "vec2", "cor", "yFit") %in% names(x)))
   checkEquals(x$vec1.name, feature.1)
   checkEquals(x$vec2.name, feature.2)
   checkEquals(length(x$vec1), length(x$vec2))
   checkEquals(length(x$vec1), length(x$yFit))
   checkEqualsNumeric(x$cor, 0.8828, tol=1e-3)
   checkEqualsNumeric(min(x$yFit), 7.4, tol=0.1)
   checkEqualsNumeric(max(x$yFit), 107.6, tol=0.1)
   plot(x$vec1, x$vec2)
   points(x$vec1, x$yFit, col="red")

} # test_correlateSomeLeftOut
#----------------------------------------------------------------------------------------------------
test_verifyCorrelateSomeLeftOut <- function()
{
   printf("--- test_verifyCorrelateSomeLeftOut")

   d <- SouthSeattleHealthImpacts()
   dataframe.name <- "tbl.factors"
   linearModel <- LinearModel(d, dataframe.name)
   feature.1 <- "below.200pc.Poverty.Level"
   feature.2 <- "Non.white.minority.population"
   omittedEntities <- NA
   x <- correlate(linearModel, feature.1, feature.2, omittedEntities)
   checkTrue(all(c("entities", "vec1.name", "vec2.name", "vec1", "vec2", "cor", "yFit") %in% names(x)))
   checkEquals(x$vec1.name, feature.1)
   checkEquals(x$vec2.name, feature.2)
   checkEquals(length(x$vec1), length(x$vec2))
   checkEquals(length(x$vec1), length(x$yFit))
   checkEqualsNumeric(x$cor, 0.652, tol=1e-3)
   checkEqualsNumeric(min(x$yFit), 8.7, tol=0.1)
   checkEqualsNumeric(max(x$yFit), 66.7, tol=0.1)
   plot(x$vec1, x$vec2)
   points(x$vec1, x$yFit, col="red")

} # test_verifyCorrelateSomeLeftOut
#----------------------------------------------------------------------------------------------------
# plotting "Non.white.minority.population" vs  "Adults.No.Leisure.Time" in the cleveland webapp
# then leaving out Beacon Hill, an outlier at (70, 30), -reduces- the correlation, and
# does not change the regression line in the way I expect.
# explore this here, by making the same base R calls found in LinearModel.R
#
# status (11 aug 2016): need to hand-check the correlation calculation.  still confused
#
test_correlateSomeLeftOut_confusion <- function()
{
   printf("--- test_correlateSomeLeftOut_confusion")
   d <- SouthSeattleHealthImpacts()
   df <- getItem(d, "tbl.factors")

   feature1 <- "Non.white.minority.population"
   feature2 <- "Adults.No.Leisure.Time"
   
   vec1 <- df[, feature1]
   vec2 <- df[, feature2]
   entities <- rownames(df)

   sort.order <- order(vec1)
   vec1 <- vec1[sort.order]
   vec2 <- vec2[sort.order]
   entities <- entities[sort.order]

   cor <- cor(vec1, vec2)
   yFit <- fitted(line(vec1, vec2))
   residuals <- residuals(line(vec1, vec2))

   plot(vec1, vec2, main="10 pts (red), 9 pts (blue)")
   points(x$vec1, yFit, col="red")

   omittedEntities <- "98108"
   keeper.row.names <- setdiff(rownames(df), omittedEntities)
   df.a <- df[keeper.row.names,]

   vec1.a <- df.a[, feature1]
   vec2.a <- df.a[, feature2]
   entities.a <- rownames(df.a)

   sort.order <- order(vec1.a)
   vec1.a <- vec1.a[sort.order]
   vec2.a <- vec2.a[sort.order]
   entities.a <- entities.aa[sort.order]

   cor.a <- cor(vec1.a, vec2.a)
   yFit.a <- fitted(line(vec1.a, vec2.a))
   residuals <- residuals(line(vec1.a, vec2.a))

   points(vec1.a, yFit.a, col="blue")
   
} # test_correlateSomeLeftOut_bug
#----------------------------------------------------------------------------------------------------
if(!interactive())
    runTests()
