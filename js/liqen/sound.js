$(document).ready(function() {

  var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
  var audioElement = document.getElementById('audioElement');
  var audioSrc = audioCtx.createMediaElementSource(audioElement);
  var analyser = audioCtx.createAnalyser();

  // Bind our analyser to the media element source.
  audioSrc.connect(analyser);
  audioSrc.connect(audioCtx.destination);

  //var db data from machines and humans:
  var max = 100;
  var min = 0;
  var eu = 55;
  var lec = 10;
  var x = document.getElementById('audioElement');
  x.loop = true;
  x.volume = lec / 100;

  var colors = d3.scale.linear().domain([0, lec]).range(['red', 'blue']);

  var frequencyData = new Uint8Array(analyser.frequencyBinCount);
  var frequencyData = new Uint8Array(200);

  var svg = d3.select('#player > .graph').append('svg');
  var svgHeight = $('#player').height();
  var svgWidth = $('#player > .graph').width();
  var barPadding = '0.5';

  // Create our initial D3 chart.
  svg.selectAll('rect')
    .data(frequencyData)
    .enter()
    .append('rect')
    .attr('x', function(d, i) {
      return i * (svgWidth / frequencyData.length);
    })
    .attr('width', svgWidth / frequencyData.length - barPadding);

  // Continuously loop and update chart with frequency data.
  function renderChart() {
    requestAnimationFrame(renderChart);

    // Copy frequency data to frequencyData array.
    analyser.getByteFrequencyData(frequencyData);
    var max = Math.max.apply(Math, frequencyData);
    if(max>0){
      var yScale = d3.scale.linear().domain([0, frequencyData.length]).range([0, svgHeight])

      // Update d3 chart with new data.
      svg.selectAll('rect')
        .data(frequencyData)
        .attr('y', function(d) {
          return svgHeight - yScale(d);
        })
        .attr('height', function(d) {
        return Math.max(yScale(d * x.volume), 1);
        })
        .attr('fill', colors)
    }
  }

  // Run the loop
  renderChart();

});
