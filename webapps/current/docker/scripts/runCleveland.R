library(ChinookServer)
library(RUnit)

stopifnot(packageVersion("ChinookLinearModel") >= "1.0.3")
stopifnot(packageVersion("Groups") >= "1.0.6")
stopifnot(packageVersion("LinearModel") >= "1.1.5")
stopifnot(packageVersion("ChinookAnalysis") >= "1.0.1")
stopifnot(packageVersion("SouthSeattleHealthImpacts") >= "1.0.5")
stopifnot(packageVersion("Dataset") >= "1.0.1")
stopifnot(packageVersion("SubjectHistory") >= "1.0.2")
stopifnot(packageVersion("ChinookServer") >= "1.0.12")
stopifnot(packageVersion("ChinookDataset") >= "1.0.8")
stopifnot(packageVersion("httpuv") >= "1.4.1")
stopifnot(packageVersion("jsonlite") >= "1.5")

PORT=7001
datasets <- "SouthSeattleHealthImpacts"
analysisPackages <- c("ChinookLinearModel")
browserFile <- "app.html"
userCredentials <- "test@nowhere.net"
chinook <- ChinookServer(port=PORT, analysisPackages, datasets, browserFile, userCredentials)

#if(Sys.info()[["nodename"]] != "eager.systemsbiology.net")
#   browseURL(sprintf("http://localhost:%d", PORT))

run(chinook)
