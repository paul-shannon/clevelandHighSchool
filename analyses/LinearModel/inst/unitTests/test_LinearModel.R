library(LinearModel)
library(RUnit)
library(SouthSeattleHealthImpacts)
Sys.setlocale("LC_ALL", "C")
#----------------------------------------------------------------------------------------------------
runTests <- function()
{
  test_constructor()
  test_correlate()

} # runTests
#----------------------------------------------------------------------------------------------------
test_constructor = function()
{
   printf("--- test_constructor")
   d <- SouthSeattleHealthImpacts()
   dataframe.name <- "tbl.factors"
   lm <- LinearModel(d, dataframe.name)

   checkTrue(grepl("LinearModel", lmDataSummary(lm)))
   checkTrue(grepl("SouthSeattle", lmDataSummary(lm)))
   checkTrue(grepl("tbl.factors", lmDataSummary(lm)))

} # test_constructor
#----------------------------------------------------------------------------------------------------
test_correlate <- function()
{
   printf("--- test_correlate")
   d <- SouthSeattleHealthImpacts()
   dataframe.name <- "tbl.factors"
   lm <- LinearModel(d, dataframe.name)
   feature.1 <- "Non.white.minority.population"
   feature.2 <- "assault.hosp.per.100k"
   x <- correlate(lm, feature.1, feature.2)
   checkTrue(all(c("entities", "vec1.name", "vec2.name", "vec1", "vec2", "cor") %in% names(x)))
   checkEquals(x$vec1.name, feature.1)
   checkEquals(x$vec2.name, feature.2)
   checkEqualsNumeric(x$cor, 0.809481, tol=1e-5)

} # test_correlate
#----------------------------------------------------------------------------------------------------
if(!interactive())
    runTests()
