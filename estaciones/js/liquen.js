$(document).ready(function() {
  var data;
  var devices = L.markerClusterGroup();
  var countries = [];
  var cities = ['Madrid', 'London', 'Santiago'];
  var chart = nv.models.lineChart();
  var chartData;

  nv.addGraph(function(){
    chart.options({duration: 300,
            useInteractiveGuideline: true});
    // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
    chart.xAxis.scale(d3.time.scale());
    var tickFormats = {
      "year":"%Y",
      "month": "%b",
      "week": "%x",
      "day": "%x",
      "hour": "%X",
    }

    chart.xAxis
        .axisLabel("Time (s)")

        .tickFormat(function(d){
          zoom = 'day';
          return d3.time.format(tickFormats[zoom])(new Date(d));
        })
        .staggerLabels(true)
    ;

    chart.yAxis
        .axisLabel('Noise (db)')
        .tickFormat(function(d) {
            if (d == null) {
                return 'N/A';
            }
            return d3.format(',.2f')(d);
        })
    ;

    chartData = d3.select('#graph').append('svg');

    return chart;
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
    //TODO Limit by date
    $.getJSON('https://api.smartcitizen.me/v0/devices/'+device+'/readings?all_intervals=true&from=2016-09-20T14:14:44.889Z&rollup=12h&sensor_id=7&to=2016-09-27T14:14:44.890Z', function(resp) {
      console.log(resp.readings);
      var points = resp.readings.map(function(d){
        console.log(d);
        ts = new Date(d[0]);
        value = (d[1]!=null)?d[1]:0;
        return {x:ts.getTime(),y:value};
      })
      var serie = {
        key:"Noise",
        values:points
      }
      console.log(points);
      chartData
              .datum([serie])
              .transition().duration(1200)
              .call(chart);


  nv.utils.windowResize(chart.update);

    });
  });

  $.getJSON('https://api.smartcitizen.me/v0/devices/world_map', function(resp) {
    data = resp.filter(function(d) {
      return d.system_tags.indexOf('outdoor') >= 0 &&
        (countries.indexOf(d.country_code) >= 0 || cities.indexOf(d.city) >= 0);
    });
    data.forEach(function(d) {
      var template = '<h2>{title}</h2><p>{description}</p><input class="details" data-device="{device}" type="button" value="View">';
      var popup = template.replace('{title}', d.name);
      popup = template.replace('{title}', d.name);
      popup = popup.replace('{description}', d.description);
      popup = popup.replace('{device}', d.id);

      //https://api.smartcitizen.me/v0/devices/2545

      L.marker([d.latitude, d.longitude]).bindPopup(popup).addTo(devices);
    });
    console.log(data);
  })

});
