build1:
	docker build -t chia_base   -f Dockerfile_stage_1 .
	docker images | grep chia_base

build2:
	docker build -t chia   -f Dockerfile_stage_2 .
	docker images | grep chia

build3:
	docker build -t chia_complete   -f Dockerfile_stage_3 .
	docker images | grep chia_complete

run:
	docker run -ti --rm -p 8001:7001 chia_complete R -f runCleveland.R

bash:
	docker run -ti --rm chia bash
	#docker run -ti --rm rocker/r-base bash


buildPackages:
	(cd pkgs; R CMD build ~/github/chinook/SubjectHistory)
	(cd pkgs; R CMD build ~/github/chinook/Dataset)
	(cd pkgs; R CMD build ~/github/chinook/ChinookDataset)
	(cd pkgs; R CMD build ~/github/chinook/ChinookServer)
	(cd pkgs; R CMD build ~/github/chinook/Groups)
	(cd pkgs; R CMD build ~/github/chinook/ChinookAnalysis)
	(cd pkgs; R CMD build ~/github/clevelandHighSchool/analyses/LinearModel)
	(cd pkgs; R CMD build ~/github/clevelandHighSchool/analyses/ChinoookLinearModel)
	(cd pkgs; R CMD build ~/github/clevelandHighSchool/datasets/SouthSeattleHealthImpacts)
