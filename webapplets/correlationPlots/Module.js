//----------------------------------------------------------------------------------------------------
var CorrelationPlotsModule = (function () {

  var datasetName = null;
  var plotTitleDiv;
  var plotDiv;
  var d3plotDiv;
  var selectedRegion;          // assigned out of brushReader function
  var selectedIDs=[];       // empty array, zipCodes 
  var dataReceived = false; // when true, window resize does replot of data
  var dataset;                 // assigned from payload of incoming plotxy message

  var fittedLine;              // assembled from payload yFit and x vector
  var regressionLine2 = null; //when != null, handleWindowResize resizes the line, second "fitted Line"

  var xMin, xMax, yMin, yMax;  // conveniently calculated in R, part of payload
  var datasetLength;
  var xAxisLabel, yAxisLabel, correlation;

  var sendSelectionsMenu;
  var thisModulesName = "CorrelationPlotter";
  var thisModulesOutermostDiv = "CorrelationPlotsDiv";

  var sendSelectionsMenuTitle = "Send selection...";

      // sometimes a module offers multiple selection destinations
      // but usually just the one entry point
  var selectionDestinations = [thisModulesName];
      // make sure to register, eg,
      // hub.addMessageHandler("sendSelectionTo_EnvironmentalMap", handleSelections);

  var recalculateRegression;

  var svg;
  var neighborhoodNames; 
  
//--------------------------------------------------------------------------------------------
function initializeUI()
{
  recalculateRegression = $("#recalculateRegression");
  recalculateRegression.click(sendingSelectedIDs); //sends selectedIDs to the hub
  hub.disableButton(recalculateRegression); // automatically disables button

  displayNeighborhoodNames = $("#displayNeighborhoodNames");
  displayNeighborhoodNames.click(displayingNeighborhoodNames); 
  
  plotTitleDiv = $("#correlationPlotTitleDiv");
  plotDiv = $("#correlationPlottingDiv");
  d3plotDiv = d3.select("#correlationPlottingDiv");
  console.log("div: " + plotDiv)
  $(window).resize(handleWindowResize);
  handleWindowResize();
  
}  // initializeUI
//----------------------------------------------------------------------------------------------------
function handleWindowResize ()
{
  plotTitleDiv.width(0.95 * $(window).width());
  plotTitleDiv.height("20px");
  plotDiv.width(0.95 * $(window).width());
  plotDiv.height(0.80 * $(window).height());
    
  // an easy way to rescale the canvas when the browser window size changes: just redraw
  if(dataReceived)
      d3plot(dataset, fittedLine, xMin, xMax, yMin, yMax, xAxisLabel, yAxisLabel, correlation);

  // redisplays the second line as the window size changes
  if (regressionLine2 != null )
     displayingSecondLine(dataset, regressionLine2, correlation2); 

} // handleWindowResize
//--------------------------------------------------------------------------------
function brushReader ()
{
    console.log("brushReader");

    selectedIDs=[];
	selectedRegion = d3brush.extent();
	x0 = selectedRegion[0][0];
	x1 = selectedRegion[1][0];
	width = Math.abs(x0-x1);
	if(width < 0.001) 
	    selectedRegion = null
	else{
	    getSelection(selectedIDs);}

} // d3PlotBrushReader
//--------------------------------------------------------------------------------
function d3plotPrep (msg)
{
  console.log("entering d3plotPrep");

  dataReceived = true;
  payload = msg.payload;

  // assign global variables
  dataset = [];
  datasetLength = payload.vec1.length;

  for(var i=0; i < datasetLength; i++){
    dataset.push({x: payload.vec1[i], y: payload.vec2[i], id: payload.entities[i]});
  }

  var yFit = msg.payload.yFit;
  var xFit = msg.payload.vec1;
  var lastElement = yFit.length - 1;

  fittedLine = {x1: xFit[0], y1: yFit[0], x2: xFit[lastElement], y2: yFit[lastElement]};

  xMin = msg.payload.vec1Min;
  xMax = msg.payload.vec1Max;
  yMin = msg.payload.vec2Min;
  yMax = msg.payload.vec2Max;

  xAxisLabel = msg.payload.vec1Name;
  yAxisLabel = msg.payload.vec2Name;
  correlation = msg.payload.correlation;   // between -1.0 and 1.0
  plotTitleDiv.html("<center> <i><b>" +
                     xAxisLabel + "</b></i> (x)  <i><b>vs.  " +
                     yAxisLabel + "</b></i>  (y) </br>  &nbsp;  correlation: " +
                     correlation +
                     "</center>");

  d3plot(dataset, fittedLine, xMin, xMax, yMin, yMax, xAxisLabel, yAxisLabel, correlation)

  //var return_msg = {cmd: msg.callback, status: "success", callback: "", payload: ""};
  //hub.send(return_msg);

} // d3plotPrep
//--------------------------------------------------------------------------------
function d3plot(dataset, fittedLine, xMin, xMax, yMin, yMax, xAxisLabel, yAxisLabel, correlation)
{
  var width = plotDiv.width();
  var height = plotDiv.height();

  padding = 50;
  xScale = d3.scale.linear()
             .domain([xMin,xMax])
             .range([padding,width-padding]);

  yScale = d3.scale.linear()
             .domain([yMin, yMax])
             .range([height-padding, padding]); // note inversion

  // must remove the svg from a d3-selected object, not just a jQuery object
  d3plotDiv.select("#plotSVG").remove();  // so that append("svg") is not cumulative 
    
    d3brush = d3.svg.brush()
        .x(xScale)
        .y(yScale)
        .on("brushend", brushReader); 

  svg = d3.select("#correlationPlottingDiv")
              .append("svg")
              .attr("id", "plotSVG")
              .attr("width", width)
              .attr("height", height)
              .call(d3brush);
    
  xAxis = d3.svg.axis()
                .scale(xScale)
                .ticks(10)
                .orient("bottom")
                .tickSize(10);

  yAxis = d3.svg.axis()
                .scale(yScale)
                .ticks(10)
                .tickSize(10)
                .orient("left");


  var xTranslationForYAxis = xScale(0);
  var yTranslationForXAxis = yScale(10);

  var tooltip = d3plotDiv.append("div")
                   .attr("class", "tooltip")
                   .style("position", "absolute")
                   .style("z-index", "10")
                   .style("visibility", "hidden")
                   .text("a simple tooltip");

  console.log("--- about to draw points, count: " + dataset.length);
  console.log(JSON.stringify(dataset))

  svg.selectAll("circle")
     .data(dataset)
     .enter()
	.append("circle")
                  .attr("class", "circles")

     .attr("cx", function(d){
       return xScale(d.x);
     })
     .attr("cy", function(d){
       return yScale(d.y);
     })
     .attr("r", function(d){
       return 5;
     })
     .style("fill", function(d){
       return "red";
     })
     .on("mouseover", function(d,i){   // no id assigned yet...
       tooltip.text(d.id);
       return tooltip.style("visibility", "visible");
     })
     .on("mousemove", function(){
       return tooltip.style("top",
         (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
       .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(0," + (height - padding) + ")")
     .call(xAxis);

  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(" + padding + ",0)")
	.call(yAxis);

  console.log("--- about to draw regression line");
  console.log(JSON.stringify(fittedLine))

  svg.append("line")
     .style("stroke-width", 1)
     .style("stroke", "black")
     .style("stroke-dasharray", ("3, 3"))
     .attr("x1", xScale(fittedLine["x1"]))
     .attr("y1", yScale(fittedLine["y1"]))
     .attr("x2", xScale(fittedLine["x2"]))
     .attr("y2", yScale(fittedLine["y2"]));

   /**********
   svg.selectAll("line")
      .data(fittedLine)
      .enter().append("line")
      .attr("class", "line")
      .style("stroke-width", 1)
      .style("stroke", "green")
      .attr("x1", function(f) {var x1 = f["x0"]; console.log("f[0]: " + x1);  return xScale(x1);})
      .attr("y1", function(f) {var y1 = f["y0"]; console.log("f[1]: " + y1);  return yScale(y1);})
      .attr("x2", function(f) {var x2 = f["x1"]; console.log("f[2]: " + x2);  return xScale(x2);})
      .attr("y2", function(f) {var y2 = f["y1"]; console.log("f[3]: " + y2);  return yScale(y2);});
    *********/


    /*********
    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", xScale(40))
      .attr("y", yScale(50))
      .text(xAxisLabel);
    *********/


} // d3plot
//--------------------------------------------------------------------------------
function getSelection(selectedIDs)
{
  console.log("--- entering getSelection");   

  var selectedNames = [];
    
  if(selectedRegion == null)
  {
    var returnMsg = {cmd: msg.callback, callback: "", status: "success",
                        payload: selectedNames};
    console.log("=== returning from getSelection, no selected points");
    console.log(returnMsg);
    hub.send(returnMsg)
      return;
    hub.disableButton(recalculateRegression);
  }
    
  x0 = selectedRegion[0][0]
  x1 = selectedRegion[1][0]
  y0 = selectedRegion[0][1]
  y1 = selectedRegion[1][1]

  var datasetLength = dataset.length; //resets the length to the length of the dataset 
    
  for(var i=0; i < datasetLength; i++)
  {
    x = dataset[i].x;
    y = dataset[i].y;
    if(x >= x0 & x <= x1 & y >= y0 & y <= y1){
      console.log ("TRUE");
      selectedNames.push(i);
      selectedIDs.push(dataset[i].id); //collects selectedIDs
      hub.enableButton(recalculateRegression); //only if there are points will the button be enabled 
    }  
  } // for i

  if (selectedNames.length < 1) //when the selection is dragged to a place w/o points, this disables the button
   hub.disableButton(recalculateRegression) 
    
  console.log(" found " + selectedNames.length + " selected points");
   
} // getSelection
//--------------------------------------------------------------------------------
function sendingSelectedIDs(msg)
{
  console.log("sending Selected IDs"); 
  
  payload = {datasetName: "SouthSeattleHealthImpacts",
            dataframeName: "tbl.factors",
            feature1: feature1,
            feature2: feature2,
            leaveOut: selectedIDs}  

  callback= "replotRegressionLine";
    
  var returnMsg = {cmd:"correlateVectors", callback: callback, status: "success",
                    payload: payload};

  console.log(returnMsg);
  hub.send(JSON.stringify(returnMsg));

 
  hub.disableButton(recalculateRegression); //disables the button once it is clicked, requires a new selection to be enabled 

} // sendingSelectedIDs
//--------------------------------------------------------------------------------
function replotRegressionLine(msg)
{
  d3plotDiv.select("#secondLine").remove();  //so that the secondLine does not accumulate after every selection 
    
  console.log("replotting the regression line");
    
  payload = msg.payload;

  var dataset = []; 
  datasetLength = payload.vec1.length;

  for (var i=0; i<datasetLength; i++){
    dataset.push({x: payload.vec1[i], y: payload.vec2[i], id: payload.entities[i]});
  }

  var yFit = payload.yFit;
  var xFit = payload.vec1;
  var lastElement = datasetLength - 1;

  regressionLine2 = {x1: xFit[0], y1: yFit[0], x2: xFit[lastElement], y2: yFit[lastElement]};
  correlation2 = payload.correlation;   // between -1.0 and 1.0
  plotTitleDiv.html("<center> <i><b>" +
                     xAxisLabel + "</b></i> (x)  <i><b>vs.  " +
                     yAxisLabel + "</b></i> (y) </br>  &nbsp;  correlation: " +
                    correlation + "&nbsp; recalculated correlation: "
		    + correlation2 +  "</center>");

  displayingSecondLine(dataset, regressionLine2, correlation2)

}//replotRegressionLine	
//--------------------------------------------------------------------------------
function displayingSecondLine(dataset, regressionLine2, correlation)
{

  var width = plotDiv.width();
  var height = plotDiv.height();

  padding = 50;

  var xTranslationForYAxis = xScale(0);
  var yTranslationForXAxis = yScale(10);

  var tooltip = d3plotDiv.append("div")
                   .attr("class", "tooltip")
                   .style("position", "absolute")
                   .style("z-index", "10")
                   .style("visibility", "hidden")
                   .text("a simple tooltip");

  console.log("--- about to draw points, count: " + dataset.length);
  console.log(JSON.stringify(dataset))
	
  console.log("displaying second line"); 

 console.log(JSON.stringify(regressionLine2))

  //svg id is secondLine (that way it can be removed after every selection)
    
  svg.append("line")
    .attr("id", "secondLine")
    .style("stroke-width", 1)
    .style("stroke", "green")
    .attr("x1", xScale(regressionLine2["x1"]))
    .attr("y1", yScale(regressionLine2["y1"]))
    .attr("x2", xScale(regressionLine2["x2"]))
    .attr("y2", yScale(regressionLine2["y2"]));

}//displayingSecondLine	
//--------------------------------------------------------------------------------
function displayingNeighborhoodNames()
{
    console.log("displaying NeighborhoodNames");

    svg.selectAll("text")
	.data(dataset)
	.enter()
	.append("text")
	.text(function(d){
	    return d["id"];
	})
        .attr("x",function(d){
	    return d["x"];
	})
	.attr("y", function(d){
	    return d["y"];
	})
	.attr("font-family", "sans-serif")
	.attr("font-size", "15px")
	.attr("fill", "red");
	
}//displayingNeighborhoodNames	
//--------------------------------------------------------------------------------
function handleSelections(msg)
{
   console.log("--- Module.correlationPlots::handleSelections")
   console.log(msg)
   feature1 = msg.payload.value[0];
   feature2 = msg.payload.value[1];
   payload = {datasetName: datasetName,
              dataframeName: "tbl.factors",
              feature1: feature1,
              feature2: feature2}
   callback = "correlationPlot";
   newMsg = {cmd: "correlateVectors", status: "request", callback: callback, payload: payload}
   console.log("--- about to send correlation request");
   console.log(newMsg);

   hub.send(JSON.stringify(newMsg));

} // handleSelections
//--------------------------------------------------------------------------------
function datasetSpecified(msg)
{
   datasetName = msg.payload;
   console.log("corPlot, datasteSpecified, name: " + datasetName);
   console.log(msg);

   cmd = "getDatasetItemsByName";
   itemsRequested = ["tbl.factors", "tbl.neighborhoods"];

   var payload = {datasetName: datasetName, items: itemsRequested}
   var newMsg = {cmd: cmd,  callback: "storeData", status: "request", payload: payload};
   hub.send(JSON.stringify(newMsg));
    
} // datasetSpecified
//--------------------------------------------------------------------------------
function storeData(msg)
{
  console.log("--- Module.SSEF storeData");
  console.log(JSON.stringify(msg.cmd));
  factorsTable = msg.payload["tbl.factors"];
  neighborhoodNames = msg.payload["tbl.neighborhoods"].mtx; 
}// storeData
//--------------------------------------------------------------------------------
function plotCorrelation(msg)
{
   hub.enableTab("correlationPlotsDiv");
   hub.raiseTab("correlationPlotsDiv");
   console.log("--- Module.cor, plotCorrelation")
   console.log(JSON.stringify(msg));
   d3plotPrep (msg)

} // plotCorrelation
//--------------------------------------------------------------------------------
function initializeModule()
{
  hub.addOnDocumentReadyFunction(initializeUI);
    hub.addMessageHandler("datasetSpecified", datasetSpecified);
    hub.addMessageHandler("storeData", storeData); 
  hub.addMessageHandler("correlationPlot", plotCorrelation);
  hub.addMessageHandler("sendSelectionTo_correlationsPlotter", handleSelections);
  hub.addMessageHandler("replotRegressionLine",replotRegressionLine); 

} // initializeModule
//----------------------------------------------------------------------------------------------------
return{
   init: initializeModule
   };

//----------------------------------------------------------------------------------------------------
}); // CorrelationPlotsModule

corPlotsModule = CorrelationPlotsModule();
corPlotsModule.init();

