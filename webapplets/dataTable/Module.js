//----------------------------------------------------------------------------------------------------
var DataTableModule = (function () {

  var datasetName = null;

  var dataset;                 // assigned from payload of incoming plotxy message
  var datasetLength;

  var thisModulesName = "DataTable";
  var thisModulesOutermostDiv = "DataTableDiv";

  var contentDiv;

//--------------------------------------------------------------------------------------------
function initializeUI()
{
   contentDiv = $("#dataTableContentDiv")
   $(window).resize(handleWindowResize);
   handleWindowResize();

}  // initializeUI
//----------------------------------------------------------------------------------------------------
function handleWindowResize ()
{
   contentDiv.width(0.95 * $(window).width());
   contentDiv.height(0.80 * $(window).height());

} // handleWindowResize
//--------------------------------------------------------------------------------
function datasetSpecified(msg)
{
   datasetName = msg.payload;
   console.log("dataTableModule, datasetSpecified, name: " + datasetName);
   console.log(msg);

} // datasetSpecified
//--------------------------------------------------------------------------------
function initializeModule()
{
  hub.addOnDocumentReadyFunction(initializeUI);
  hub.addMessageHandler("datasetSpecified", datasetSpecified);

} // initializeModule
//----------------------------------------------------------------------------------------------------
return{
   init: initializeModule
   };

//----------------------------------------------------------------------------------------------------
}); // DataTableModule

dataTableModule = DataTableModule();
dataTableModule.init();

