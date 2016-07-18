//----------------------------------------------------------------------------------------------------
var HeatmapModule = (function () {

  var datasetName = null;

  var dataset;                 // assigned from payload of incoming plotxy message
  var datasetLength;

  var thisModulesName = "Heatmap";
  var thisModulesOutermostDiv = "heatmapDiv";

  var contentDiv;

//--------------------------------------------------------------------------------------------
function initializeUI()
{
  contentDiv = $("#heatmapContentDiv")
  $(window).resize(handleWindowResize);
  handleWindowResize();

  heatmapDiv=$("heatmapDiv");
  heatmapControlsDiv=$("heatmapControlsDiv");

}  // initializeUI
//----------------------------------------------------------------------------------------------------
function handleWindowResize()
{
  contentDiv.width(0.95 * $(window).width());
  contentDiv.height(0.80 * $(window).height());

} // handleWindowResize
//--------------------------------------------------------------------------------
function datasetSpecified(msg)
{
  console.log("--- Module.cleveland.heatmap: datasetSpecified: " + msg.payload);

  hub.enableTab("heatmapDiv");
  datasetName = msg.payload;

  console.log("heatmapModule, datasetSpecified, name: " + datasetName);
  console.log(msg);

  cmd="getDatasetItemsByName";
  itemsRequested=["tbl.normalized"];
  callback="displayHeatmap";

  var payload={datasetName: datasetName, items: itemsRequested}
  var newMsg={cmd: cmd, callback: callback, status:"request", payload:payload};
  hub.send(JSON.stringify(newMsg)); 

} // datasetSpecified
//--------------------------------------------------------------------------------
function displayHeatmap(msg)
{
  console.log("displayHeatmap");
  console.log("---- Module.SSEF displayHeatmap");
  console.log(JSON.stringify(msg.cmd));

  clusterData = JSON.parse(msg.payload["tbl.normalized"]);   
  d3DisplayHeatmap(clusterData)
 	
} // displayHeatmap
//--------------------------------------------------------------------------------
function d3DisplayHeatmap(clusterData)
{
  var outer_margins = {top: 2, bottom: 30, left: 5, right: 2};
  var viz_size = {width: 800, height: 600};

  d3.select("heatmapContentDiv").select("viz_svg").remove();

  var args = {
        root: '#heatmapContentDiv',
        'network_data': clusterData,
        // 'row_label':'Row Title',
        // 'col_label':'Colum Title',
        'outer_margins': outer_margins,
        // 'outline_colors':['black','yellow'],
        // 'tile_click_hlight':true,
        // 'show_label_tooltips':true,
        'show_tile_tooltips':true,
        // 'make_tile_tooltip':make_tile_tooltip,
        // 'highlight_color':'yellow',
        // 'super_label_scale':1.25,
        // 'transpose':true,
        // 'ini_expand':true,
        // 'col_label_scale':1.5,
        // 'row_label_scale':0.8
        // 'force_square':1
        // 'opacity_scale':'log',
        // 'input_domain':2,
        // 'do_zoom':false,
        // 'tile_colors':['#ED9124','#1C86EE'],
        // 'background_color':'orange',
        // 'tile_title': true,
        // 'click_group': click_group_callback,
        // 'size':viz_size
        // 'order':'rank'
        // 'row_order':'clust'
        // 'col_order':'rank',
        // 'ini_view':{'N_row_sum':'10'},
        // 'current_col_cat':'category-one'
        // 'title':'Clustergrammer',
        'about':'Zoom, scroll, and click buttons to interact with the clustergram.',
        // 'sidebar_width':150,
        // 'sidebar_icons':false,
        // 'row_search_placeholder':'Gene',
        // 'buffer_width':10,
        // 'show_sim_mat':'col',
        // 'clamp_opacity':0.85,
        // 'max_allow_fs':15,
        };

    function resize_container(){
      var screen_width = window.innerWidth;
      var screen_height = window.innerHeight - 30;
       d3.select(args.root)
         .style('width', screen_width+'px')
         .style('height', screen_height+'px');
       } 

     cgm = Clustergrammer(args);

     resize_container();
     d3.select(window).on('resize',function(){
       resize_container();
       cgm.resize_viz();
       });
 
     d3.select(cgm.params.root + ' .wait_message').remove();
     d3.select(cgm.params.root+ ' .title_section')
       .append('img')
       .classed('title_image',true)
       .attr('src','img/clustergrammer_logo.png')
       .attr('alt','clustergrammer')
       .style('width','167px')
       .style('margin-left','3px')
       .style('margin-top','5px');

} // d3DisplayHeatmap
//--------------------------------------------------------------------------------
function initializeModule(){
  hub.addOnDocumentReadyFunction(initializeUI);
  hub.addMessageHandler("datasetSpecified", datasetSpecified);
  hub.addMessageHandler("displayHeatmap", displayHeatmap); 

} // initializeModule
//----------------------------------------------------------------------------------------------------
return{
  init: initializeModule

};
//----------------------------------------------------------------------------------------------------
}); // HeatmapModule

heatmapModule = HeatmapModule();
heatmapModule.init();
