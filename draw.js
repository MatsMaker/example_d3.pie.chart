var
  margin = 30,
  width = 500,
  height = 500,
  radius = Math.min(width - (margin*4), height - (margin*4)) / 2,
  innerRadius = 0.3 * radius,
  freezeTime = 1500,
  scaleTimes = {
    freeze: 1000
  },
  sliceTimes = {
    startAngle: 5.83,
    delay: 500,
    queue: 100,
    duration: 2000,
    innerRadius: innerRadius
  },
  centerCicleTimes = {
    appearance: 1000,
    calcDuration: sliceTimes.duration * 2
  },
  scaleInterval = 25,
  centerTextPad = "19px";
  centrationLabel = {
    dx: "-9px",
    dy: "4px"
  },
  data = [];

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

var pie = d3.pie()
  .sort(null).value(function (d) {
    return d.width;
  })
  .startAngle(sliceTimes.startAngle)
  .endAngle(sliceTimes.startAngle * Math.PI);

var arc = d3.arc()
  .innerRadius(innerRadius)
  .outerRadius(function (d) {
    return (radius - innerRadius - margin) * (d.data.score / 100.0) + innerRadius;
  });

var svg = d3.select(".wrap-chart")
  .append("svg").attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.json('aster_data.json', function (error, data) {
  data = data;

  var startData = data.map(function (d) {
    d._startData = {
      score: d.score
    };
    d.id = d.id;
    d.order = +d.order;
    d.color = d.color;
    d.weight = +d.weight;
    d.width = +d.weight;
    d.label = d.label;
    d.score = 0;
    d.opacity = 0;
    return d;
  });

  (function scalePie(){
    var classScaleCicles = "scale-circle";
    var slcaleGroup = svg.append("g")
      .attr("class", "slcale-group");
    var scaleCircles;

    var radiusCircle, arrRadius = [];
    for(radiusCircle = radius + (margin * 0.8); radiusCircle > innerRadius; radiusCircle -=scaleInterval){
      arrRadius.push(radiusCircle);
      slcaleGroup
        .append("circle")
        .attr("r", sliceTimes.innerRadius)
        .attr("class", classScaleCicles)
        .attr("opacity", 0);
    }

    scaleCircles = svg.selectAll(`.${classScaleCicles}`)
      .data(arrRadius)
      .each(function(d, i){
        function getAnimTime(i){
          return sliceTimes.duration * (1/(i+1));
        }
        d3.select(this)
          .transition()
          .duration(sliceTimes.duration)
          .attrTween("r", function(d) {
            var interpolate = d3.interpolate(sliceTimes.innerRadius, d);
            var elase = d3.easeBackOut;
            return function(t) {
              var caunter = Math.max(0, (elase(t) * 5 - 4));
              return (interpolate(t) * caunter);
            };
          })
          .attr("opacity", 1)
          .transition()
          .delay(freezeTime - sliceTimes.duration + scaleTimes.freeze)
          .duration(sliceTimes.duration)
          .attrTween("r", function(d) {
            var interpolate = d3.interpolate(d, sliceTimes.innerRadius);
            return function(t) {
              return interpolate(t);
            };
          })
          .attr("opacity", 0);
      });

  })();//END scalePie


  (function slicePie() {
    var labelArc = d3.arc()
      .innerRadius(innerRadius  - margin)
      .outerRadius(radius - margin * 1.5);

    var labelArcSmall = d3.arc()
      .innerRadius(innerRadius * 0.3 - margin)
      .outerRadius(radius * 0.3 - margin);

    var solidArc = svg.selectAll(".solidArc")
      .data(pie(startData)).enter()
      .append("g")
      .attr("class", "slicePie");

    var solitArc = solidArc
      .append("path")
      .attr("fill", function (d) {
        return d.data.color;
      })
      .attr("opacity", "0")
      .attr("class", "solidArc")
      .attr("d", arc)
      .each(function(p, j){

        d3.select(this)
          .transition()
          .delay(j * sliceTimes.queue + sliceTimes.delay)
          .duration(sliceTimes.duration)
          .attrTween("d", function(d, i, s) {
            var interpolate = d3.scaleLinear().range([0, d.data._startData.score]);
            var elase = d3.easeBackOut;
            return function(t) {
              var caunter = Math.max(0, (elase(t) * 10 - 9));
              d.data.score = (interpolate(t) * caunter);
              return arc(d);
            };
          })
          .attr("opacity", 1)
          .transition()
          .delay(j * sliceTimes.queue + freezeTime)
          .duration(sliceTimes.duration)
          .attrTween("d", function(d, i, s) {
            var interpolate = d3.interpolate(d.data.score, 20);
            return function(t) {
              d.data.score = interpolate(t);
              return arc(d);
            };
          });

      });

    var labelSlice = solidArc
      .append("text")
      .attr("class","labelSlice")
      .attr("opacity", "0")
      .attr("dy", centrationLabel.dy)
      .attr("dx", centrationLabel.dx)
      // .attr("x", function(d) {
      //   return labelArc.centroid(d)[0];
      // })
      // .attr("y", function(d) {
      //   return labelArc.centroid(d)[1];
      // })
      .attr("transform", function(d) {
        return "translate(" + labelArc.centroid(d) + ")";
      })
      .text(function(d) {
        return d.data.label;
      })
      .each(function(p, j){

        d3.select(this)
          .transition()
          .delay(j * sliceTimes.queue)
          .duration(sliceTimes.duration)
          .attr("x", function(d) {
            return labelArc.centroid(d)[0];
          })
          .attr("y", function(d) {
            return labelArc.centroid(d)[1];
          })
          .attr("opacity", 1)
          .transition()
          .delay(j * sliceTimes.queue + freezeTime)
          .duration(sliceTimes.duration)
          .attr("transform", function(d) {
            return "translate(" + labelArcSmall.centroid(d) + ")";
          })
          .attr("opacity", 0);

      });

  })();//END slicePie


  (function centerCircle(){

    var dataScope = 0;
    startData.forEach(function(obData){
      dataScope = dataScope + obData._startData.score;
    });

    var centerGroup = svg.append("g")
      .attr("class", "center-circle-group");

    var centerCircle = centerGroup
        .append("circle")
        .attr("r", 0)
        .attr("class", "center-circle")
        .attr("opacity", 0)
        .transition()
        .duration(centerCicleTimes.appearance)
        .attrTween("r", function(){
          var interpolate = d3.scaleLinear().range([0, innerRadius]);
          var elase = d3.easeBackOut;
          return function(t) {
            var caunter = Math.max(0, (elase(t) * 10 - 9));
            return (interpolate(t) * caunter);
          };
        })
        .attr("opacity", 1);

    var centerText = centerGroup.append("svg:text")
      .attr("class", "label-score")
      .attr("dy", centerTextPad)
      .attr("text-anchor", "middle")
      .data([dataScope])
      .transition()
      .duration(centerCicleTimes.calcDuration)// x2 from up and down slicePie
      .tween("text", function(d) {
        var self = this;
        var interpolate = d3.interpolate(this.textContent, d);
        this.textContent = interpolate(0.5);
        return function(t) {
          self.textContent = Math.round(interpolate(t));
        };
      });


  })();// END centerCircle

});
