$(document).ready(function() {
  // Device properties
  var devicesData;
  var devices = L.markerClusterGroup();
  var countries = [];
  var cities = ['Madrid', 'London', 'Santiago'];
  var devicesURL = 'https://api.smartcitizen.me/v0/devices/{device}/readings?all_intervals=true&from={start}&rollup=6h&sensor_id=7&to={end}';
  var humansURL = 'https://liqen-pre.herokuapp.com/metrics?device={device}&start={start}&end={end}';

  //Graphs properties
  var machineSensor = nv.models.multiChart(),
      humanSensor = nv.models.multiChart();
  var machineData
  var humanData;

  // Map properties
  var map;
  var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Sensors Data © <a href="http://smartcitizen.me">SmartCitizen</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY3Jpc2hlcm5hbmRlemNvIiwiYSI6ImNpdGxqd2ttNzAwMTQyb29ia2Z6cTA1cmMifQ.XvmSqMosFphwEPOpCCOAoQ';
//    mbUrl = 'https://api.mapbox.com/styles/v1/crishernandezco/citr5vkrr00052hln1i64nmn8/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY3Jpc2hlcm5hbmRlemNvIiwiYSI6ImNpdGxqd2ttNzAwMTQyb29ia2Z6cTA1cmMifQ.XvmSqMosFphwEPOpCCOAoQ';
  var emerald = L.tileLayer(mbUrl, {
      id: 'mapbox.emerald',
      attribution: mbAttr
    }),
    outdoors = L.tileLayer(mbUrl, {
      id: 'mapbox.outdoors',
      attribution: mbAttr
    }),
    pirates = L.tileLayer(mbUrl, {
      id: 'mapbox.pirates',
      attribution: mbAttr
    })
    liqen = L.tileLayer(mbUrl, {
      id: 'mapbox.liqen',
      attribution: mbAttr
    });

  var baseLayers = {
    "Liqen":emerald,
    "Outdoors": outdoors,
    "Pirates":pirates
  };

  var overlays = {
    "Devices": devices
  };

// Insert customize marker



  function getDeviceInfo(device){
    deviceInfo = devicesData.filter(function (d){return d.id==device});
    return (deviceInfo.length) ? deviceInfo[0] : null;
  }

  function loadNoice(device) {
    deviceInfo = getDeviceInfo(device);
    if(deviceInfo){
      map.setView([deviceInfo.latitude,deviceInfo.longitude],20);

      start = moment().subtract(7, 'days').format();
      end = moment().format()
      machineData = d3.select('#machine-sensor svg');
      humanData = d3.select('#human-sensor svg');
      var volume = 30;

      var machineUrl = devicesURL.replace('{device}',device);
      machineUrl = machineUrl.replace('{start}',encodeURIComponent(start));
      machineUrl = machineUrl.replace('{end}',encodeURIComponent(end));

      var humanUrl = humansURL.replace('{device}',device);
      humanUrl = humanUrl.replace('{start}',encodeURIComponent(start));
      humanUrl = humanUrl.replace('{end}',encodeURIComponent(end));

      var queue = $.ajaxq('display',{
        url:machineUrl,
        dataType: 'json',
        success: function(resp){
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
          data.push(getLimits(start, end, "WHO"));

          machineData
            .datum(data)
            .transition().duration(1200)
            .call(machineSensor);
        }
      });

      $.ajaxq('display',{
        url:humanUrl,
        dataType:'json',
        success: function(resp){
          console.log(resp)
          if(resp.length>0){
            var points = resp.map(function(d){
              volume = Math.max(volume,d.decibels);
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
            data.push(getLimits(start, end, "WHO"));

            humanData.style('display','block');
            d3.select('.ask-help').style('display','none');
            humanData
              .datum(data)
              .transition().duration(1200)
              .call(humanSensor);
          }
          else {
            humanData.style('display','none');
            d3.select('.ask-help').style('display','block');
          }
        },
        complete: function(){
          playSound(volume)
        }
      });
    }
  }

  $('.play-pause').on('click',function(e){
      e.preventDefault();
      player = document.getElementById('audioElement');
      if($('.play-pause i').hasClass('fa-volume-up')){
        player.pause();
        $('.play-pause i').removeClass('fa-volume-up');
        $('.play-pause i').addClass('fa-volume-off');
      }
      else{
        player.play();
        $('.play-pause i').removeClass('fa-volume-off');
        $('.play-pause i').addClass('fa-volume-up');
      }
  });

  $(document).on('click', '.details', function(e) {
    var device = $(e.target).data('device');
    loadNoice(device);
  });


  //$.getJSON('https://api.smartcitizen.me/v0/devices/world_map', function(data) {
  //data = resp.filter(function(d) {
  //      return d.system_tags.indexOf('outdoor') >= 0 &&
  //        (countries.indexOf(d.country_code) >= 0 || cities.indexOf(d.city) >= 0);
  //    });

  $.getJSON('../js/liqen/data/devices-world.json', function(data) {
    map = L.map('map', {
      center: [0.73, -10.99],
      zoom: 2,
      layers: [emerald, devices]
    });

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
