var x = document.getElementById("get-location")

function getCurrentPosition() {
  return new Promise(function (accept, reject) {
    navigator.geolocation.getCurrentPosition(accept, reject)
  })
}

x.addEventListener('click', function() {
  // Disable the button
  $('#get-location').attr('disabled', true)

  if (navigator.geolocation) {
    $('#get-location').text('Obteniendo permisos...')

    getCurrentPosition()
      .then(function showPosition(position) {
        var lat = position.coords.latitude
        var lon = position.coords.longitude

        $('#latitude').val(lat)
        $('#longitude').val(lon)

        // Fetch to the API
        $('#get-location').text('Buscando sensor cercano...')
        return $.ajax({
          url: 'https://api.smartcitizen.me/v0/devices',
          data: {
            near: [lat, lon].join(',')
          }
        })
      })
      .then(function (data, textStatus, jqXHR) {
        $('#get-location')
          .text('Listo!')
          .removeClass('btn-primary')
          .addClass('btn-success')
        // Take the first one
        var nearSensor = data[0]

        $('#sensor-id').val(nearSensor.id)
        $('#nearest-sensor').attr('hidden', false)
        $('#nearest-sensor-text').text(nearSensor.name)
        console.log(nearSensor.id)
      })
      .catch(function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown)
        // Problems!
      })

  } else {
    x.innerHTML = "Geolocation is not supported by this browser."
  }
})
