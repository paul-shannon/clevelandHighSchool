all: clevelandDatasets clevelandAnalyses

clevelandDatasets:
	R CMD INSTALL datasets/SouthSeattleHealthImpacts
	R -f datasets/SouthSeattleHealthImpacts/inst/unitTests/test_SouthSeattleHealthImpacts.R

clevelandAnalyses:
	R CMD INSTALL analyses/LinearModel
	R -f analyses/LinearModel/inst/unitTests/test_LinearModel.R
	R CMD INSTALL analyses/ChinoookLinearModel/
	(cd analyses/ChinoookLinearModel/inst/unitTests; make)
