function LiQuenScatter(selector,chart){
  chartOptions = {
    duration: 300,
    focusEnable:false,
    margin:{right:50},
    showLegend:false
  };

  defaultDomain = [0,120];

  configureChart = function(selector,chart){
    chart.options(chartOptions);
    chart.yDomain1(defaultDomain);
    chart.yDomain2(defaultDomain);

    chart.xAxis
        .axisLabel("Time (s)")
        .tickFormat(timeTickFormat)
        .staggerLabels(true)
        .showMaxMin(false);

    chart.yAxis1
        //.axisLabel('Noise (db)')
        .tickFormat(noiseTickFormat);
    chart.yAxis2
            .tickFormat(noiseTickFormat);

    d3.select(selector)
            .datum([])
            .transition().duration(1200)
            .call(chart);

    return chart;
  }
  return configureChart(selector,chart);
}