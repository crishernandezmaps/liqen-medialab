
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
  x.volume = Math.round(volume/100);
  x.play();
}

// This function creates a new anchor element and uses location
// properties (inherent) to get the desired URL data. Some String
// operations are used (to normalize results across browsers).
// @see http://james.padolsey.com/javascript/parsing-urls-with-the-dom/
function parseURL(url) {
    var a =  document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function(){
            var ret = {},
                seg = a.search.replace(/^?/,'').split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/([^/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^/])/,'/$1'),
        //relative: (a.href.match(/tps?:/[^/]+(.+)/) || [,''])[1],
        segments: a.pathname.replace(/^/,'').split('/')
    };
}
