$(document).ready(function () {

  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var audioElement = document.getElementById('audioElement');
  var audioSrc = audioCtx.createMediaElementSource(audioElement);
  var analyser = audioCtx.createAnalyser();

  // Bind our analyser to the media element source.
  audioSrc.connect(analyser);
  audioSrc.connect(audioCtx.destination);

  //var db data from machines and humans:
  var lec = 30;
  var x = document.getElementById('audioElement');
  x.volume = lec/100;


  var colors = d3.scale.linear().domain([0,lec]).range(['red','yellow']);


  var frequencyData = new Uint8Array(analyser.frequencyBinCount);
  var frequencyData = new Uint8Array(200);

  var svgHeight = '150';
  var svgWidth = '1310';
  var barPadding = '1';


  var svg = d3.select('#player > .graph').append('svg');

  // Create our initial D3 chart.
  svg.selectAll('rect')
     .data(frequencyData)
     .enter()
     .append('rect')
     .attr('x', function (d, i) {
        return i * (svgWidth / frequencyData.length);
     })
     .attr('width', svgWidth / frequencyData.length - barPadding);

  // Continuously loop and update chart with frequency data.
  function renderChart() {
     requestAnimationFrame(renderChart);

     // Copy frequency data to frequencyData array.
     analyser.getByteFrequencyData(frequencyData);

     // Update d3 chart with new data.
     svg.selectAll('rect')
        .data(frequencyData)
        .attr('y', function(d) {
           return svgHeight - d;
        })
        .attr('height', function(d) {
           return (d+lec);
        })
        .attr('fill',colors)
  }

  // Run the loop
  renderChart();

});


////// Tone
// var x = new Tone.Noise({
	// "volume" : -20,
	// "type" : "brown"
// }).toMaster();
