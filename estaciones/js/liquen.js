$(document).ready(function() {
  // Device properties
  var devicesData;
  var devices = L.markerClusterGroup();
  var countries = [];
  var cities = ['Madrid', 'London', 'Santiago'];

  //Graphs properties
  var machineSensor = nv.models.multiChart(),
      humanSensor = nv.models.multiChart();
  var machineData
  var humanData;

  // Map properties
  var map;
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
  var baseLayers = {
    "Grayscale": grayscale,
    "Streets": streets
  };

  var overlays = {
    "Devices": devices
  };


  function getDeviceInfo(device){
    deviceInfo = devicesData.filter(function (d){return d.id==device});
    return (deviceInfo.length) ? deviceInfo[0] : null;
  }

  function loadNoice(device) {
    deviceInfo = getDeviceInfo(device);
    if(deviceInfo){
      map.setView([deviceInfo.latitude,deviceInfo.longitude],16)
      start = moment().subtract(7, 'days').format();
      end = moment().format()
      machineData = d3.select('#machine-sensor svg');
      humanData = d3.select('#human-sensor svg');
      var volume = 30;

      $.getJSON('https://api.smartcitizen.me/v0/devices/' + device + '/readings?all_intervals=true&from=' + start + '&rollup=12h&sensor_id=7&to=' + end, function(resp) {
        var points = resp.readings.map(function(d) {
          ts = new Date(d[0]);
          value = (d[1] != null) ? d[1] : 0;
          volume = Math.max(volume,value);
          return {
            x: ts.getTime(),
            y: value
          };
        })

        var data = new Array();
        var serie = {
          key: "Noise",
          values: points,
          type: 'bar',
          yAxis: 1
        }
        data.push(serie);
        data.push(getLimits(start, end, "EU"));
        data.push(getLimits(start, end, "OMS"));

        machineData
          .datum(data)
          .transition().duration(1200)
          .call(machineSensor);

        console.log("Vol:" + volume);
        playSound(volume)
      });

      // Load Human data
      url = 'https://liqen-pre.herokuapp.com/metrics?device='+device+'&start=' + start + "&end=" + end;
      $.getJSON(url).done(function(resp) {
        points = resp.map(function(d){
          return {x:d.timestamp,y:d.decibels}
        });

        var serie = {
          key: "Noise",
          values: points,
          type: 'bar',
          yAxis: 1
        }
        var data = new Array();
        data.push(serie);
        data.push(getLimits(start, end, "EU"));
        data.push(getLimits(start, end, "OMS"));

        humanData
          .datum(data)
          .transition().duration(1200)
          .call(humanSensor);
      });

    }
  }

  $(document).on('click', '.details', function(e) {
    var device = $(e.target).data('device');
    loadNoice(device);
  });

  $.getJSON('../estaciones/data/devices.json', function(data) {
    map = L.map('map', {
      center: [0.73, -10.99],
      zoom: 2,
      layers: [grayscale, devices]
    });

    L.control.layers(baseLayers, overlays).addTo(map);

    nv.addGraph(new LiQuenGraph('#machine-sensor svg', machineSensor));
    nv.addGraph(new LiQuenGraph('#human-sensor svg', humanSensor));

    data.forEach(function(d) {
      var template = '<h2>{title}</h2><p>{description}</p><input class="details" data-device="{device}" type="button" value="View">';
      var popup = template.replace('{title}', d.name);
      popup = template.replace('{title}', d.name);
      popup = popup.replace('{description}', d.description);
      popup = popup.replace('{device}', d.id);

      L.marker([d.latitude, d.longitude]).bindPopup(popup).addTo(devices);
    });

    devicesData = data;

    var urlParams = parseURL(location.href);
    if(urlParams.params.device!=undefined){
        loadNoice(urlParams.params.device);
    }
  })
});
