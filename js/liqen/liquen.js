$(document).ready(function() {
  // Sound properties
  var sound = new LiqenSound('audioElement');
  sound.render();

  // Map properties
  var devices = L.markerClusterGroup();
  var map;

// Device properties
  var devicesData;
  var devices = L.markerClusterGroup();
  var devicesURL = 'https://api.smartcitizen.me/v0/devices/{device}/readings?all_intervals=true&from={start}&rollup=6h&sensor_id=7&to={end}';
  var humansURL = 'https://liqen-pre.herokuapp.com/metrics?device={device}&start={start}&end={end}';

  //Graphs properties
  var machineSensor = nv.models.multiChart(),
      humanSensor = nv.models.multiChart();
  var machineData
  var humanData;


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
          sound.playSound(volume)
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
    map = new LiqenMap('map',devices);

    nv.addGraph(new LiQuenGraph('#machine-sensor svg', machineSensor));
    nv.addGraph(new LiQuenGraph('#human-sensor svg', humanSensor));

    data.forEach(function(d) {
      var template = '<h4>{title}</h4><p>{description}</p><input class="details" data-device="{device}" type="button" value="View">';
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
