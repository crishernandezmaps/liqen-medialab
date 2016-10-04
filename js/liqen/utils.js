$.getJSON('https://api.smartcitizen.me/v0/devices/world_map', function(resp) {
  data = resp.filter(function(d) {
    return d.system_tags.indexOf('outdoor') >= 0 &&
      (countries.indexOf(d.country_code) >= 0 || cities.indexOf(d.city) >= 0);
  });
  console.log(JSON.stringify(data));
  data.forEach(function(d) {
    var template = '<h2>{title}</h2><p>{description}</p><input class="details" data-device="{device}" type="button" value="View">';
    var popup = template.replace('{title}', d.name);
    popup = template.replace('{title}', d.name);
    popup = popup.replace('{description}', d.description);
    popup = popup.replace('{device}', d.id);

    L.marker([d.latitude, d.longitude]).bindPopup(popup).addTo(devices);
  });
})
