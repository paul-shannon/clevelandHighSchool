library(ChinookServer)
library(RUnit)
PORT=6092
datasets <- "SouthSeattleHealthImpacts"
analysisPackages <- c("ChinookLinearModel")
browserFile <- "index.html"
userCredentials <- "test@nowhere.net"
chinook <- ChinookServer(port=PORT, analysisPackages, datasets, browserFile, userCredentials)

if(Sys.info()[["nodename"]] != "lopez")
   browseURL(sprintf("http://localhost:%d", PORT))

run(chinook)
