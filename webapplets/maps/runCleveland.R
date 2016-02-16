library(ChinookServer)
library(RUnit)
SERVER_PORT=8084
# use client_port for middleMan.js node app experiments
# CLIENT_PORT=8080
datasets <- "SouthSeattleHealthImpacts"
analysisPackages <- c("ChinookPCA")
browserFile <- "index.html"
userCredentials <- "test@nowhere.net"
chinook <- ChinookServer(port=SERVER_PORT, analysisPackages, datasets, browserFile, userCredentials)

if(Sys.info()[["nodename"]] != "lopez")
   browseURL(sprintf("http://localhost:%d", SERVER_PORT))

run(chinook)
