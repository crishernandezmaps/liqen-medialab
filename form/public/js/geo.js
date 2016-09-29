var x = document.getElementById("get-location")

x.addEventListener('click', function() {
  function showPosition(position) {
    $('[name=longitude]').val(position.coords.longitude)
    $('[name=latitude]').val(position.coords.latitude)
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition)
  } else {
    x.innerHTML = "Geolocation is not supported by this browser."
  }
})
