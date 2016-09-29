
function LiQuenGraph(selector,chart){
  chartOptions = {
    duration: 300,
    focusEnable:false,
    margin:{right:50},
    showLegend:false
  };

  defaultDomain = [0,120];

  configureChart = function(selector,chart){
    chart.options(chartOptions);
    chart.yDomain1(defaultDomain);
    chart.yDomain2(defaultDomain);
//    console.log(chart.bars1.color());
//TODO Change bars colors independently
    chart.bars2.barColor(function(d,i){
      var colors = d3.scale.linear().domain(defaultDomain).range(["green","red"]);
      console.log(colors(d.y));
      return "green";
      return colors(d.y);
    })
//    console.log(chart.bars1.color());

    chart.xAxis
        .axisLabel("Time (s)")
        .tickFormat(timeTickFormat)
        .staggerLabels(true)
        .showMaxMin(false);

    chart.yAxis1
        .axisLabel('Noise (db)')
        .tickFormat(noiseTickFormat);
    chart.yAxis2
            .tickFormat(noiseTickFormat);

    d3.select(selector)
            .datum([])
            .transition().duration(1200)
            .call(chart);

    return chart;
  }
  return configureChart(selector,chart);
}

var tickFormats = {
  "year":"%Y",
  "month": "%b",
  "week": "%x",
  "day": "%x",
  "hour": "%X",
}

function timeTickFormat(d){
  zoom = 'day';
  return d3.time.format(tickFormats[zoom])(new Date(d));
}

function noiseTickFormat(d){
  if (d == null) {
      return 'N/A';
  }
  return d3.format(',.2f')(d);
}

function getLimits(start,end,serie){
  if(serie=="EU"){
    label = "EU Directive";
    points = [{x:new Date(start),y:55},{x:new Date(end),y:55}];
    color = "blue";
  }
  else if(serie=="OMS"){
    label = "OMS Recomendation";
    points = [{x:new Date(start),y:50},{x:new Date(end),y:50}];
    color = "orange";
  }
  return {key:label,type:"line",yAxis:2,values:points,color:color};
}

function playSound(volume){
  var x = document.getElementById('audioElement');
  x.volume = volume/100;
  x.play();
}
