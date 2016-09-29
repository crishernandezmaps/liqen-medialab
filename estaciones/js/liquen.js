$(document).ready(function() {
  var data;
  var devices = L.markerClusterGroup();
  var countries = [];
  var cities = ['Madrid', 'London', 'Santiago'];
  var machineSensor = nv.models.multiChart(),
      humanSensor = nv.models.multiChart();
  var machineData
  var humanData;

  var tickFormats = {
    "year":"%Y",
    "month": "%b",
    "week": "%x",
    "day": "%x",
    "hour": "%X",
  }

  var chartOptions = {
    duration: 300,
    //useInteractiveGuideline: true,
    focusEnable:false,
    margin:{right:50},
    showLegend:false
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

  function loadNoice(device){
    start = moment().subtract(7, 'days').format();
    end = moment().format()
    $.getJSON('https://api.smartcitizen.me/v0/devices/'+device+'/readings?all_intervals=true&from='+start+'&rollup=12h&sensor_id=7&to='+end, function(resp) {
      var points = resp.readings.map(function(d){
        ts = new Date(d[0]);
        value = (d[1]!=null)?d[1]:0;
        return {x:ts.getTime(),y:value};
      })

      data = new Array();
      var serie = {
        key:"Noise",
        values:points,
        type:'bar',
        yAxis:1
      }

      data.push(serie);
      data.push(getLimits(start,end,"EU"));
      data.push(getLimits(start,end,"OMS"));

      machineData
              .datum(data)
              .transition().duration(1200)
              .call(machineSensor);


     nv.utils.windowResize(machineSensor.update);
   });
   // Load Human data
   data = new Array();
   var serie = {
     key:"Noise",
     values:[],
     type:'bar',
     yAxis:1
   }

   data.push(serie);
   data.push(getLimits(start,end,"EU"));
   data.push(getLimits(start,end,"OMS"));

console.log(humanData);

   humanData
           .datum(data)
           .transition().duration(1200)
           .call(humanSensor);


  }

  nv.addGraph(function(){
    machineSensor.options(chartOptions);
    machineSensor.yDomain1([0,150]);
    machineSensor.yDomain2([0,150]);

    machineSensor.xAxis
        .axisLabel("Time (s)")
        .tickFormat(timeTickFormat)
        .staggerLabels(true)
        .showMaxMin(false);

    machineSensor.yAxis1
        .axisLabel('Noise (db)')
        .tickFormat(noiseTickFormat);
    machineSensor.yAxis2
            .tickFormat(noiseTickFormat);

    machineData = d3.select('#machine-sensor > svg');
    machineData
            .datum([])
            .transition().duration(1200)
            .call(machineSensor);

    return machineSensor;
  });

  nv.addGraph(function(){
    humanSensor.options(chartOptions);
    humanSensor.yDomain1([0,150]);
    humanSensor.yDomain2([0,150]);

    humanSensor.xAxis
        .axisLabel("Time (s)")
        .tickFormat(timeTickFormat)
        .staggerLabels(true);

    humanSensor.yAxis1
        .axisLabel('Noise (db)')
        .tickFormat(noiseTickFormat);
    humanSensor.yAxis2
        .tickFormat(noiseTickFormat);

    humanData = d3.select('#human-sensor svg');
    humanData
            .datum([])
            .transition().duration(1200)
            .call(humanSensor);

    return humanSensor;
  });

  var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';

  var grayscale = L.tileLayer(mbUrl, {
      id: 'mapbox.dark',
      attribution: mbAttr
    }),
    streets = L.tileLayer(mbUrl, {
      id: 'mapbox.streets',
      attribution: mbAttr
    });
  var map = L.map('map', {
    center: [0.73, -10.99],
    zoom: 2,
    layers: [grayscale, devices]
  });

  var baseLayers = {
    "Grayscale": grayscale,
    "Streets": streets
  };

  var overlays = {
    "Cities": devices
  };

  L.control.layers(baseLayers, overlays).addTo(map);

  $(document).on('click','.details',function(e){
    var device = $(e.target).data('device');
    loadNoice(device);
  });

  $.getJSON('data/devices.json', function(data) {
    data.forEach(function(d) {
      var template = '<h2>{title}</h2><p>{description}</p><input class="details" data-device="{device}" type="button" value="View">';
      var popup = template.replace('{title}', d.name);
      popup = template.replace('{title}', d.name);
      popup = popup.replace('{description}', d.description);
      popup = popup.replace('{device}', d.id);

      L.marker([d.latitude, d.longitude]).bindPopup(popup).addTo(devices);
    });
  })

  //loadNoice(3675);
});
