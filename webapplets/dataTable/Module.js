//----------------------------------------------------------------------------------------------------
var DataTableModule = (function () {

  var datasetName = null;

  var dataset;                 // assigned from payload of incoming plotxy message
  var datasetLength;

  var thisModulesName = "DataTable";
  var thisModulesOutermostDiv = "DataTableDiv";

  var contentDiv;

//--------------------------------------------------------------------------------------------
function initializeUI(){
  contentDiv = $("#dataTableContentDiv")
  $(window).resize(handleWindowResize);
  handleWindowResize();

  dataTableDiv=$("dataTableDiv");
  dataTableControlsDiv=$("dataTableControlsDiv");

}  // initializeUI
//----------------------------------------------------------------------------------------------------
function handleWindowResize (){
  contentDiv.width(0.95 * $(window).width());
  contentDiv.height(0.80 * $(window).height());

} // handleWindowResize
//--------------------------------------------------------------------------------
function datasetSpecified(msg){

  console.log("--- Module.cleveland: datasetSpecified: " + msg.payload);
  hub.enableTab("dataTableDiv");
    
  datasetName = msg.payload;

  console.log("dataTableModule, datasetSpecified, name: " + datasetName);
  console.log(msg);

  cmd="getDatasetItemsByName";
  itemsRequested=["tbl.factors", "zipCodes"];
  callback="displayDataTable";

  var payload={datasetName: datasetName, items: itemsRequested}
  var newMsg={cmd: cmd, callback: callback, status:"request", payload:payload};
  hub.send(JSON.stringify(newMsg)); 

} // datasetSpecified
//--------------------------------------------------------------------------------
function loadData(msg){
  console.log("Module.cleveland, loadData");
  var cmd = "getRegisteredMessagesNames";
  var callback="displayDataTable";
  var payload="SouthSeattleHealthImpacts";
  var newMsg= {cmd: cmd, callback: callback, status: "request", payload: payload};

  hub.send(JSON.stringify(newMsg));
}
    
//--------------------------------------------------------------------------------
function displayDataTable(msg){
  console.log("displayDataTable");
    
  console.log("---- Module.SSEF displayDataTable");
  console.log(JSON.stringify(msg.cmd));
  zipCodes=JSON.parse(msg.payload["zipCodes"]);   
  factorsTable = msg.payload["tbl.factors"];
  //columnTitles = factorsTable.colnames;
  //rowTitles = factorsTable.rownames;

  display = tableDisplay("#dataSetTable", zipCodes,  factorsTable);
 	
} // displayDataTable
//--------------------------------------------------------------------------------
function tableDisplay(divTag, zipCodes, factorsTable){

  console.log(" ---- entering tableDisplay");
  var columnTitles = factorsTable.colnames;
  var rowTitles = factorsTable.rownames;
  var matrix = factorsTable.mtx; 
  columnTitles.unshift("Zip Code"); 
    var dataSet= matrix;

  console.log(zipCodes); 
  
  console.log(dataSet); 
  console.log(columnTitles);
  console.log(factorsTable.rownames); 

  var columnTitlesInOrder =[];
  for (var i=0; i <columnTitles.length; i++){
    columnTitlesInOrder.push({title: columnTitles[i]});}

  for(i=0; i<rowTitles.length; i++){
    dataSet[i].unshift(rowTitles[i])}

  $(function(){
    console.log("document ready"); 
      $('#dataSetTable').DataTable({
        dom: 'Bfrtip',
          buttons:[ {extend: 'collection', text:'Export',
		     buttons: [
			 'copy',
			 { text: 'TSV',
			   extend: 'csvFlash',
			   filename: 'Data export',
			   fieldSeparator: '\t',
			   extension: '.tsv'
			 },
			 { extend: 'csvFlash',
			   filename: 'Data export',
			   exportOptions: {columns: ':visible'},
			   exportData: {decodeEntities:true}
			 },
			 { extend: 'excelFlash',
			   filename: 'Data export'
			 },
			 'print']
		    }
		  ], 
          "bPaginate": false,
	  "bInfo": false, 
	  "bFilter": false,
	  data: dataSet, 
	columns: columnTitlesInOrder
      }); 
  }); 

} //tableDisplay
//--------------------------------------------------------------------------------
function initializeModule(){
  hub.addOnDocumentReadyFunction(initializeUI);
  hub.addMessageHandler("datasetSpecified", datasetSpecified);
  hub.addMessageHandler("displayDataTable", displayDataTable); 

} // initializeModule
//----------------------------------------------------------------------------------------------------
return{
  init: initializeModule

};
//----------------------------------------------------------------------------------------------------
}); // DataTableModule

dataTableModule = DataTableModule();
dataTableModule.init();
