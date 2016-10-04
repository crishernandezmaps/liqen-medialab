$(document).ready(function() {
  // Sound properties
  var sound = new LiqenSound('audioElement');
  sound.render();

  // Map properties
  var devices = L.markerClusterGroup();
  var map = new LiqenMap('map',devices);

  // Device properties
  var devicesData;
  var devicesURL = 'https://api.smartcitizen.me/v0/devices/{device}/';
  var humansURL = 'https://liqen-pre.herokuapp.com/metrics?device={device}&start={start}&end={end}';

  //Graphs properties
  var machineSensor = nv.models.multiChart(),
      humanSensor = nv.models.multiChart();
  var machineData
  var humanData;


  var selectedNoise = 'who';
  var volumes = {
    who: 30,
    machine: 0,
    human: 0
  }



  function getDeviceInfo(device){
    $('#device-' + device).addClass('city-list-selected')
    deviceInfo = devicesData.filter(function (d){return d.id==device});
    return (deviceInfo.length) ? deviceInfo[0] : null;
  }

  function loadNoice(device) {
    deviceInfo = getDeviceInfo(device);
    if(deviceInfo){

      $(".share").attr('href',$(".share").attr('href').replace("{city}",deviceInfo.city));
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
          var points = resp.data.sensors.map(function(d) {
            if (d.id === 7) {
              volumes.machine = Math.max(volumes.machine, d.value);
            }
          })
        }
      });

      var volume = 0

      $.ajaxq('display',{
        url:humanUrl,
        dataType:'json',
        success: function(resp){
          points = resp.map(function(d){
            volume = Math.max(volume,d.decibels);
            volumes.human = volume
            return {x:d.timestamp,y:d.decibels}
          });
        },
        complete: function() {
          console.log("Vols:", volumes.who, volumes.human, volumes.machine );
          sound.playSound(volumes.who)
        }
      });

      queue.success(function(){

      });
    }
  }

  $('[name=sound]').on('change', function(e) {
    selectedNoise = $('[name=sound]:checked').val()
    $('.sound-option-selected')
      .removeClass('sound-option-selected')
    $('#sound-' + selectedNoise + '-container')
      .addClass('sound-option-selected')
      sound.playSound(volumes[selectedNoise])
  })
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


  //$.getJSON('https://api.smartcitizen.me/v0/devices/world_map', function(data) {
  //data = resp.filter(function(d) {
  //      return d.system_tags.indexOf('outdoor') >= 0 &&
  //        (countries.indexOf(d.country_code) >= 0 || cities.indexOf(d.city) >= 0);
  //    });

  $.getJSON('../js/liqen/data/devices-world.json', function(data) {

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
    else{
      loadNoice(170);
    }
  })
});
