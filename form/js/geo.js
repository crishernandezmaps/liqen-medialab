var x = document.getElementById("get-location")

function getCurrentPosition() {
  return new Promise(function (accept, reject) {
    navigator.geolocation.getCurrentPosition(accept, reject)
  })
}

function getDeviceFromUrl() {
  var obj = {}
  var params = location.search.slice(1).split('&')
    .forEach(function (param) {
      var key = param.split('=')[0]
      var value = param.split('=')[1]
      obj[key] = value
    })

  return parseInt(obj.device, 10) || -1
}

// IIFE
(function() {
  // Set the value
  $('input[name=sensor_id][value=' + getDeviceFromUrl() + ']')
    .prop('checked', true)

  $('#location-not-available').attr('hidden', navigator.geolocation)
  $('#get-location').attr('disabled', !navigator.geolocation)
})()

x.addEventListener('click', function() {
  // Disable the button
  $('#get-location').attr('disabled', true)

  if (navigator.geolocation) {
    $('#get-location').text('Getting permissions...')

    getCurrentPosition()
      .then(function showPosition(position) {
        var lat = position.coords.latitude
        var lon = position.coords.longitude

        $('#latitude').val(lat)
        $('#longitude').val(lon)

        // Fetch to the API
        $('#get-location').text('Searching a sensor...')
        return $.ajax({
          url: 'https://api.smartcitizen.me/v0/devices',
          data: {
            near: [lat, lon].join(',')
          }
        })
      })
      .then(function (data, textStatus, jqXHR) {
        $('#get-location')
          .text('Done!')
          .removeClass('btn-primary')
          .addClass('btn-success')
        // Take the first one
        var nearSensor = data[0]

        $('#sensor-id-calc').val(nearSensor.id)
        $('#nearest-sensor').attr('hidden', false)
        $('#nearest-sensor-text').text(nearSensor.name)
        console.log(nearSensor.id)
      })
      .catch(function (error) {
        $('#get-location').attr('disabled', false)
        $('#get-location').text('Detect automatically')

        $('#location-not-available').attr('hidden', false)
        if (error.message && error.message === 'User denied Geolocation') {
          $('#location-not-available').text('You have to allow geolocation')
        } else {
          $('#location-not-available').text('Not available')
        }
        
      })

  }
})
