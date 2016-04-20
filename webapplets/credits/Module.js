//----------------------------------------------------------------------------------------------------
var ClevelandCreditsModule = (function () {

//--------------------------------------------------------------------------------
function datasetSpecified(msg)
{
   console.log("ClevelandCreditsModule gets datasetSpecified message");
   hub.enableTab("clevelandCreditsDiv")

} // datasetSpecified
//--------------------------------------------------------------------------------
function initializeModule()
{
  hub.addMessageHandler("datasetSpecified", datasetSpecified);

} // initializeModule
//----------------------------------------------------------------------------------------------------
return{
   init: initializeModule
   };

//----------------------------------------------------------------------------------------------------
}); // ClevelandCreditsModule

clevelandCreditsModule = ClevelandCreditsModule();
clevelandCreditsModule.init();

