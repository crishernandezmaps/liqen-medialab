$(document).ready(function() {
  var data;
  var devices = L.markerClusterGroup();
  var countries = [];
  var cities = ['Madrid', 'London', 'Santiago'];
  var machineSensor = nv.models.lineChart(),
      humanSensor = nv.models.lineChart();
  var machineData,humanData;
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

  function loadNoice(device){
    //TODO Limit by date
    console.log(device);
    $.getJSON('https://api.smartcitizen.me/v0/devices/'+device+'/readings?all_intervals=true&from=2016-09-20T14:14:44.889Z&rollup=12h&sensor_id=7&to=2016-09-27T14:14:44.890Z', function(resp) {
      console.log(resp.readings);
      var points = resp.readings.map(function(d){
        ts = new Date(d[0]);
        value = (d[1]!=null)?d[1]:0;
        return {x:ts.getTime(),y:value};
      })
      var serie = {
        key:"Noise",
        values:points
      }
      console.log(points);
      machineData
              .datum([serie])
              .transition().duration(1200)
              .call(machineSensor);


     nv.utils.windowResize(machineSensor.update);
   });
  }
  nv.addGraph(function(){
    machineSensor.options({duration: 300,useInteractiveGuideline: true});
    machineSensor.xAxis.scale(d3.time.scale());

    machineSensor.xAxis
        .axisLabel("Time (s)")
        .tickFormat(timeTickFormat)
        .staggerLabels(true);

    machineSensor.yAxis
        .axisLabel('Noise (db)')
        .tickFormat(noiseTickFormat);

    machineData = d3.select('#machine-sensor > svg');
    machineData
            .datum([])
            .transition().duration(1200)
            .call(machineSensor);

    return machineSensor;
  });

  nv.addGraph(function(){
    humanSensor.options({duration: 300,useInteractiveGuideline: true});
    humanSensor.xAxis.scale(d3.time.scale());

    humanSensor.xAxis
        .axisLabel("Time (s)")
        .tickFormat(timeTickFormat)
        .staggerLabels(true);

    humanSensor.yAxis
        .axisLabel('Noise (db)')
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

});
