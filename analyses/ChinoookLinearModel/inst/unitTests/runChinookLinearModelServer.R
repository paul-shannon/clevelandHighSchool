library(ChinookServer)
library(ChinookLinearModel)
analysisPackages = "ChinookLinearModel"
datasets <- "SouthSeattleHealthImpacts"
browserFile <- NA_character_
userCredentials <- "test@nowhere.net"

chinook <- ChinookServer(port=4073, analysisPackages, datasets, browserFile, userCredentials)
run(chinook)
