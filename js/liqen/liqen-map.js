/**
 * Map configuration
 * @param selector
 * @param devices
 */
function LiqenMap(selector,devices){
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

  map = L.map(selector, {
    center: [0.73, -10.99],
    zoom: 2,
    layers: [emerald, devices]
  });
  return map;
}
