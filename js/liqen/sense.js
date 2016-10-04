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
          var volume = 0;
          resp.data.sensors.map(function(d) {
            if (d.id === 7) {
              volume = Math.max(volume, d.value);
            }
          })
          volumes.machine = volume;
        }
      });


      $.ajaxq('display',{
        url:humanUrl,
        dataType:'json',
        success: function(resp){
          var volume = 0
          resp.map(function(d){
            volume = Math.max(volume,d.decibels);
          });
          volumes.human = volume
        },
        complete: function() {
          selectedNoise = $('[name=sound]:checked').val()
          console.log("Vols:",selectedNoise,"who:", volumes.who,"human:", volumes.human,"machine:", volumes.machine);
          sound.playSound(volumes[selectedNoise])
        }
      });
    }
  }

  $('.city-filter').on('click',function(e){
      e.preventDefault();

      device = $(e.target).data('device-id');
      loadNoice(device);

      $('.city-filter').removeClass('city-list-selected');
      $(e.target).addClass('city-list-selected');

  });

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
      var template = '<h4>{title}</h4><p>{description}</p>';
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
