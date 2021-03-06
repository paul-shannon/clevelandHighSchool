//----------------------------------------------------------------------------------------------------

var EnvironmentalMapModule = (function () {

  var datasetName = null;
  //var auxSocketURL = "ws://localhost:9003";
  //var auxSocket;

  var environmentalMapsDiv;
  var enviroMapsControlsDiv;
  var rightControlsDiv; 
  var sourceDocsButton, plotCorrelationButton;

  var sendSelectionsMenu;
  var leftDataSelectionMenu, rightDataSelectionMenu;
  var DEFAULT_FILL_COLOR = "#FAFAFA";

  var thisModulesName = "EnvironmentalMap";
  var thisModulesOutermostDiv = "EnvironmentalMapDiv";

  var sendSelectionsMenuTitle = "Send selection...";

      // sometimes a module offers multiple selection destinations
      // but usually just the one entry point
  var selectionDestinations = [thisModulesName];
      // make sure to register, eg,
      // hub.addMessageHandler("sendSelectionTo_EnvironmentalMap", handleSelections);

  // The fact that the default projection's longitude is relative to
  // Hutchinson, KS threw me for a loop for a bit but then I realized I
  // just had to rotate the projection to my longitude, then center from
  // [0, latitude].  Like so, for anyone's future reference that needs a
  // projection of Austin, TX :-)
  // 30.2500° N, 97.7500°
  // seattle is 47.6097° N, 122.3331° W

  var goodScale = 220000;

  var projection = d3.geo.albers()
     .scale(goodScale)
     .rotate ([122.3331, 0])
     .center([0, 47.6097])
     .translate([300, 200]);

  var path;
  var mapTooltipDiv;
  var leftMapDiv, rightMapDiv;

  var dataTable;
  var mapLeftSVG, mapRightSVG;
    
  var w; var h; 

//--------------------------------------------------------------------------------------------
function initializeUI()
{
  $(window).resize(handleWindowResize);

  plotCorrelationButton = $("#plotCorrelationButton");
  plotCorrelationButton.click(requestCorrelation);
  hub.disableButton(plotCorrelationButton);

  leftDataSelectionMenu = $("#leftDataCategorySelector");
  leftDataSelectionMenu.change(function(){displayCategory(mapLeftSVG, leftDataSelectionMenu)});
  rightDataSelectionMenu = $("#rightDataCategorySelector");
  rightDataSelectionMenu.change(function(){displayCategory(mapRightSVG, rightDataSelectionMenu)})

  d3mapLeftDiv = d3.select("#leftMapDiv")
  d3mapRightDiv = d3.select("#rightMapDiv")


  environmentalMapsDiv = $("#environmentalMapsDiv");
  enviroMapsControlsDiv = $("#enviroMapsControlsDiv");
  rightControlsDiv=$("#rightControlsDiv"); 

  leftMapDiv = $("#leftMapDiv");
  rightMapDiv = $("#rightMapDiv");

  sourceDocsButton = $("#enviroMapsSourceDocumentButton")
  sourceDocsButton.click(showSourceDocs);
  //displayLeftMap();
  //displayRightMap();

  //sendSelectionsMenu = hub.configureSendSelectionMenu("#environmentalMapSendSelectionsMenu",
  //                                                    selectionDestinations,
  //                                                    sendSelections,
  //                                                    sendSelectionsMenuTitle);

    initializeViewBox();
    
} // initializeUI
//----------------------------------------------------------------------------------------------------
function initializeViewBox()
{
  handleWindowResize();

  var controlsDivHeight = 20;

  var mapWidth = (environmentalMapsDiv.width() * 0.9); 
  var mapHeight = (0.95 * environmentalMapsDiv.height()) - controlsDivHeight;
    
  var svg1 = $("#leftMapDiv").get(0);
  svg1.setAttribute('viewBox', '0 0 ' + mapWidth + ' '+ mapHeight);
  svg1.setAttribute('preserveAspectRatio', 'xMidYMid meet');


  var svg2 = $("#rightMapDiv").get(0);
  svg2.setAttribute('viewBox', '0 0 ' + mapWidth + ' ' + mapHeight);
  svg2.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    
  var leftDiv = $("#leftMap").get(0);
  leftDiv.style.width = mapWidth*1.1;
  leftDiv.style.width = mapHeight*1.1;

  var rightDiv = $("#rightMap").get(0);
  rightDiv.style.width = mapWidth;
  rightDiv.style.width = mapHeight; 
    

} // initializeViewBox
//----------------------------------------------------------------------------------------------------
function setupSpecialSocket(websocket)
{
  console.log("entering setupSpecialSocket")

  websocket.onopen    = function(evt) {onOpen(evt) };
  websocket.onclose   = function(evt) {onClose(evt) };
  websocket.onmessage = function(evt) {onMessage(evt) };
  websocket.onerror   = function(evt) {onError(evt) };
}
//----------------------------------------------------------------------------------------------------
handleWindowResize = function()
{
   var controlsDivHeight = 20;
   var windowWidth = $(window).width();
   var windowHeight = $(window).height();

   environmentalMapsDiv.height(windowHeight * 0.95)
   environmentalMapsDiv.width(windowWidth * 0.475)

   enviroMapsControlsDiv.height(controlsDivHeight);
   enviroMapsControlsDiv.width(environmentalMapsDiv.width() * 0.95);

   rightControlsDiv.height(controlsDivHeight);
   rightControlsDiv.width(environmentalMapsDiv.width() * 0.95); 
    

   var mapWidth = environmentalMapsDiv.width() * 0.9;
   var mapHeight = (0.95 * environmentalMapsDiv.height()) - controlsDivHeight;

   leftMapDiv.width(mapWidth);
   leftMapDiv.height(mapHeight);
   rightMapDiv.width(mapWidth);
   rightMapDiv.height(mapHeight);

   var tx = leftMapDiv.width()/2;
   var ty = leftMapDiv.height()/2;

    // derive scaling constant empircially
    //------------------------------------------
    // mapDiv height    projection.scale
    //  1000             150,000
    //   500              75,000
    //    h
    //  150000 = 150000 * h/1000

   var newScale = 150000 * (mapHeight/1000)
   projection.translate([tx, ty]).scale(newScale);

    if(typeof(mapLeftSvg) != "undefined"){
      mapLeftSVG.attr("width", mapWidth).attr("height", mapHeight);
      mapLeftSVG.selectAll('path').attr('d', path);
      displayText(mapLeftSVG);
      }

   if(typeof(mapRightSvg) != "undefined"){
      mapRightSVG.attr("width", mapWidth).attr("height", mapHeight);
      mapRightSVG.selectAll('path').attr('d', path);
      displayText(mapRightSVG);
   }
   
} // handleWindowResize
//----------------------------------------------------------------------------------------------------
function showSourceDocs()
{
   var sourceDoc = "http://justhealthaction.org/wp-content/uploads/2013/03/CHIA-EPA-TRI-Conference-DC-May-2014.pdf"
   window.open(sourceDoc);
   var sourceDoc2 = "http://duwamishcleanup.org/wp-content/uploads/2013/03/CHIA_AppendixA_lowres.pdf"
   window.open(sourceDoc2);

} // showSourceDocs
//----------------------------------------------------------------------------------------------------
function requestCorrelation()
{
  var cmd = "correlateVectors";
  var leftCategory = leftDataSelectionMenu.val();
  var rightCategory = rightDataSelectionMenu.val();
  var cmd = "sendSelectionTo_" + "correlationsPlotter";

  payload = {value: [leftCategory, rightCategory], count: 2, source: thisModulesName};
  var newMsg = {cmd: cmd,  callback: "", status: "request", payload: payload};
  hub.send(JSON.stringify(newMsg));

} // requestCorrelation
//----------------------------------------------------------------------------------------------------
function sendSelections(event)
{
  var destination = sendSelectionsMenu.val();

  var cmd = "sendSelectionTo_" + destination;
  var dummySelections = ["dummy selection 1", "dummy selection 2"];

  payload = {value: dummySelections, count: dummySelections.length,
             source: thisModulesName};

  var newMsg = {cmd: cmd,  callback: "", status: "request", payload: payload};

  // restore default (informational) title of the menu
  sendSelectionsMenu.val(sendSelectionsMenuTitle);

  hub.send(JSON.stringify(newMsg));

} // sendSelections
//--------------------------------------------------------------------------------------------
function datasetSpecified(msg)
{
   console.log("--- Module.cleveland:  datasetSpecified: " + msg.payload);
   hub.enableTab("environmentalMapsDiv");

   datasetName = msg.payload;

   cmd = "getDatasetItemsByName";
   itemsRequested = ["tbl.factors", "tbl.neighborhoods", "zipCodes"];
   callback = "southSeattleEnvironmentalFactorsStoreAndDisplayData";

   var payload = {datasetName: datasetName, items: itemsRequested}
   var newMsg = {cmd: cmd,  callback: callback, status: "request", payload: payload};
   hub.send(JSON.stringify(newMsg));

} // datasetSpecified
//----------------------------------------------------------------------------------------------------
function loadData(msg)
{
   console.log("Module.cleveland, loadData");
   var cmd = "getRegisteredMessageNames";
   var callback = "southSeattleEnvironmentalFactorsStoreAndDisplayData";
   var payload = "SouthSeattleHealthImpacts";
   var newMsg = {cmd: cmd,  callback: callback, status: "request", payload: payload};

   hub.send(JSON.stringify(newMsg));

} // loadData
//--------------------------------------------------------------------------------------------
function storeAndDisplayData(msg)
{
   console.log("---- Module.SSEF storeAndDisplayData");
   console.log(JSON.stringify(msg.cmd));
   zipCodes = JSON.parse(msg.payload["zipCodes"]);
   factorsTable = msg.payload["tbl.factors"];
   neighborhoodLabels = msg.payload["tbl.neighborhoods"].mtx


     // this next step is confusing.  herewith an attempt to explain
     // we have module variables for the div (defined in widget.html)
     // into which d3 inserts an svg element
     // there are two maps, and two different variables for each:
     //   jQuery variable: we use this for window resize events
     //   a d3 variable: we use this to append and remove the svg element
     // both variables are instantiated with the same html '#' tag
     // we always want to remove any pre-existing svg element so that
     // successive calls to create maps do not accumulate svgs, accumulate maps

   mapLeftSVG  = createMap("#leftMapDiv",  "#leftDataCategorySelector",  zipCodes, factorsTable);
   mapRightSVG = createMap("#rightMapDiv", "#rightDataCategorySelector", zipCodes, factorsTable);
   hub.raiseTab("environmentalMapsDiv");
   handleWindowResize();  // resizes widgets appropriately

} // storeAndDisplayData
//--------------------------------------------------------------------------------------------
function handleSelections(msg)
{
   hub.raiseTab(thisModulesOutermostDiv);
   var msgAsString = JSON.stringify(msg.payload);

   outputDiv.html("<pre>" + msgAsString + "</pre");

} // handleSelections
//----------------------------------------------------------------------------------------------------
function calculateColor(normalizedValue)
{

  var redColors = ["#FFF0F0", "#FFCCCC", "#FFB3B3", "#FF9999", "#FF8080",
                   "#FF6666", "#FF4D4D", "#FF3333", "#FF1A1A", "#FF1010", "#FF0000"];

  if(normalizedValue == undefined)
    return(DEFAULT_FILL_COLOR);

  if(isNaN(normalizedValue))
    return(DEFAULT_FILL_COLOR);

  return(redColors[normalizedValue])

} // calculateColor
//----------------------------------------------------------------------------------------------------
function displayCategory(mapSVG, categoryMenu)
{
   var leftCategory = leftDataSelectionMenu.val();
   var rightCategory = rightDataSelectionMenu.val();
   if(leftCategory.length > 0 && rightCategory.length > 0)
      hub.enableButton(plotCorrelationButton);
   else
      hub.disableButton(plotCorrelationButton);

  leftDataSelectionMenu.change(function(){displayCategory(mapLeftSVG, leftDataSelectionMenu)});
  rightDataSelectionMenu = $("#rightDataCategorySelector");

   var dataCategory = categoryMenu.val();
   console.log(" new data category: " + dataCategory);

   var dataTable = factorsTable;
   var rowIndex = dataTable.colnames.indexOf(dataCategory);
      // mtx is an array of columns, one colum for each zip code region
      // we need to extract one element from each
   var mtx = dataTable.mtx;
   var regionNames = dataTable.rownames;   // currently zip codes
   var data = [];                          // counts for each zip code for current dataCategory
   mtx.forEach(function(columnVector){data.push(columnVector[rowIndex])});

   var min = d3.min(data);
   var max = d3.max(data);
   var scalingFunction = d3.scale.linear().domain([min, max]).range([0,10]);

      // loop over all of the elements (all paths delineating zip code areas).
      // these are returned as element "d", with has the values as
      // originally defined from the loaded data which, in this case,
      // is an object with keys "type" and properties
      // the properties sub-object has keys which include "GEOID10" and "geometry"
      // d.properties.GEOID10 is the zipCode, which allows us to index into
      // the factorsTable, which has, for the selected dataCategory,
      // numerical values for 10 of the ~28 zipcodes on the map
      // we normalize that value to something between 0 and 10, then
      // look up the color associated with the normalized value

      // we also specify the tooltip text to display, using the same technique:
      // 'd' is the d3 representation of the original map element, the one
      // over which the mouse is hovering.  we get the GEOID10, look up the
      // the un-normalized value, then display zip code name, dataCategory name
      // and value in the tooltip

   mapSVG.selectAll("path")
       .style("fill", function(d) {
            var zipCode = d.properties.GEOID10;
            var zipCodeIndex = regionNames.indexOf(zipCode);
            //console.log("zipCode: " + zipCode + "  index: " + zipCodeIndex);
            //console.log(JSON.stringify(d));
            if(zipCodeIndex >= 0){
               var rawValue = data[zipCodeIndex];
               //console.log("rawValue: " + rawValue);
               var normalizedValue = Math.round(scalingFunction(rawValue));
               return calculateColor(normalizedValue);
               }
            else{
               return DEFAULT_FILL_COLOR;
               }
            })
       .on("mouseover", function(d) {
          d3.select(this).transition().duration(300).style("opacity", 1);
          mapsTooltipDiv.transition().duration(300)
             .style("opacity", 1)
          var zipCode = d.properties.GEOID10;
          var zipCodeIndex = regionNames.indexOf(zipCode);
          var value = data[zipCodeIndex];
          var dataCategoryFixed = dataCategory.replace(/\./gi, " ");
          var msg = zipCode + '\n' + dataCategoryFixed + ": " + value;
          console.log("mouseover msg: " + msg);
          if(value == undefined)
             msg = zipCode;
          mapsTooltipDiv.text(msg)
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY + 30) + "px");
             }) // on mouseover

	.on("mouseout", function() {
          d3.select(this)
            .transition().duration(300)
            .style("opacity", 0.8);
          mapsTooltipDiv.transition().duration(300)
             .style("opacity", 0);
         }) // on mouseout
       .on("click", function(){
          console.log("--- mouseclick");
          console.log(this);
       });



    mapSVG.selectAll("g.neighborhoodLabel")
	.on("mouseover", function(d){
	    d3.select(this).transition().duration(300).style("opacity", 1);
	     mapsTooltipDiv.transition().duration(300)
             .style("opacity", 1)
          var zipCode = d[0]; 
          var zipCodeIndex = regionNames.indexOf(zipCode);
          var value = data[zipCodeIndex];
          var dataCategoryFixed = dataCategory.replace(/\./gi, " ");
          var msg = zipCode + '\n' + dataCategoryFixed + ": " + value;
          console.log("mouseover msg: " + msg);
          if(value == undefined)
             msg = zipCode;
          mapsTooltipDiv.text(msg)
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY + 30) + "px");
        }) // on mouseover
    	.on("mouseout", function() {
          d3.select(this)
            .transition().duration(300)
            .style("opacity", 0.8);
          mapsTooltipDiv.transition().duration(300)
             .style("opacity", 0);
         }) // on mouseout
    

} // displayCategory
//----------------------------------------------------------------------------------------------------
function createMap(mapDivTag, selectorMenuTag, zipCodes, factorsTable)
{
  console.log("--- entering createMap");
  path = d3.geo.path().projection(projection);

   // remove any prior svg element, so that these do not accumulate
  d3.select(mapDivTag).select("svg").remove();

  svg = d3.select(mapDivTag).append("svg")
	.attr("width", leftMapDiv.width()) // width)
	.attr("height", leftMapDiv.height()); //height)


  mapsTooltipDiv = d3.select('body').append("mapsTooltipDiv")
                            .attr("class", "mapsTooltip")
                            .style("opacity", 0);

  dataTable = factorsTable;
  var categories = dataTable.colnames

     // populate the pulldown menu
  for(var i=0; i < categories.length; i++){
     //console.log(categories[i]);
     var optionString = "<option value='" + categories[i] + "'>" + categories[i] + "</option>";
     $(selectorMenuTag).append(optionString);
     } // for i

  svg.selectAll("path")
       .data(zipCodes.features)
       .enter()
       .append("path")
       .attr("d", path)
       .style('stroke', 'black')
       .style('stroke-width', 0.2)
       .style("fill", DEFAULT_FILL_COLOR)
       .on("mouseover", function(d) {
          d3.select(this).transition().duration(300).style("opacity", 1);
          mapsTooltipDiv.transition().duration(300)
             .style("opacity", 1)
          var id = d.properties.GEOID10;
          mapsTooltipDiv.text(id)
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY + 30) + "px");
             }) // on mouseover
       .on("mouseout", function() {
          d3.select(this)
            .transition().duration(300)
            .style("opacity", 0.8);
          mapsTooltipDiv.transition().duration(300)
             .style("opacity", 0);
         }) // on mouseout

   console.log("about to call displayText");
   displayText(svg);
   return(svg)

} // displayMap
//----------------------------------------------------------------------------------------------------
// a lot of this seems like magic, the logic not clear...
function displayText(mapSVG, zipCodes, factorsTable)
{
    // first delete
  mapSVG.selectAll("g.neighborhoodLabel").remove();


  var neighborhood =  mapSVG.selectAll("g.neighborhood")
      .data(neighborhoodLabels)
      .enter()
      .append("g")
      .attr("class", "neighborhoodLabel")
      .attr("transform", function(d) {
          //console.log("d.lon, d.lat" + d.lon + ", " + d.lat);
          console.log(JSON.stringify(d))
          console.log("long, d[3]: " + d[3]);
          console.log("lat,  d[2]: " + d[2]);
          return "translate(" + projection([ d[2], d[3]]) + ")";
    })
      .attr("d", path)
      .on("mouseover", function(d) {
	  d3.select(this).transition().duration(300).style("opacity", 1);
	  mapsTooltipDiv.transition().duration(300)
	      .style("opacity", 1)
	  var id = d[0];
	  mapsTooltipDiv.text(id)
	      .style("left", (d3.event.pageX) + "px")
	      .style("top", (d3.event.pageY + 30) + "px");
      }) // on mouseover
    
      .on("mouseout", function() {
	  d3.select(this)
	      .transition().duration(300)
	      .style("opacity", 0.8);
	  mapsTooltipDiv.transition().duration(300)
              .style("opacity", 0);
      }) // on mouseout;
    
    neighborhood.append("text")
	.text(function(d){
	    console.log("adding text: " + d[1]);
	    return d[1];
	});

} // displayText
//----------------------------------------------------------------------------------------------------
function getLeftDataCategory(msg)
{
  category = leftDataSelectionMenu.val()
  
  console.log("disabled! sending " + category + " back to jupyter?");
  var msg = {cmd: "handleResponse", callback: "", status: "successful", payload: category};

  //auxSocket.send(JSON.stringify(msg));

} // getLeftDataCategory
//----------------------------------------------------------------------------------------------------
function initializeModule()
{
   //hub.registerSelectionDestination(selectionDestinations, thisModulesOutermostDiv);

  hub.addOnDocumentReadyFunction(initializeUI);
  hub.addMessageHandler("datasetSpecified", datasetSpecified);
   //hub.addMessageHandler("sendSelectionTo_EnvironmentalMap", handleSelections);
  hub.addMessageHandler("southSeattleEnvironmentalFactorsStoreAndDisplayData", storeAndDisplayData)
  hub.addMessageHandler("ssEFgetLeftDataCategory", getLeftDataCategory);
   //hub.addSocketConnectedFunction(loadData);

   //auxSocket = new WebSocket(auxSocketURL);


} // initializeModule
//----------------------------------------------------------------------------------------------------
return{
   init: initializeModule
   }; // environmentalMapModule return value

//----------------------------------------------------------------------------------------------------
}); // EnvironmentalMapModule

enviroMapModule = EnvironmentalMapModule();
enviroMapModule.init();

