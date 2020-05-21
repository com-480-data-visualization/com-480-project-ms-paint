class Globe {

    constructor(svg_element_id) {

        this.svg = d3.select('#' + svg_element_id);
        this.height = document.getElementById(svg_element_id).height.baseVal.value;
        this.width = document.getElementById(svg_element_id).width.baseVal.value;

        const places = [

            {
                id: "ARG",
            },

            {
                id: "BRA",
            },

            {
                id: "CAN",
            },

            {
                id: "CHN",
            },

            {
                id: "EGY",
            },

            {
                id: "GBR",
            },

            {
                id: "GRC",
            },

            {
                id: "IND",
            },

            {
                id: "ISR",
            },

            {
                id: "JOR",
            },

            {
                id: "JPN",
            },

            {
                id: "USA",
            },

        ];

        this.placesById = {};
        places.forEach(place => {
            this.placesById[place.id] = place
        });

        this.country_outlines_promise = d3.json("data/country_data.json").then((topojson_raw) => {
            return topojson_raw.features;
        });


    }




    draw() {

        var projection = d3.geoOrthographic()
            .scale(250)
            .center([0, 0])
            .rotate([0, -30])
            .translate([this.width / 2, this.height / 2])

        var path = d3.geoPath()
            .projection(projection);

        const sensitivity = 75
        const initialScale = projection.scale()

        let globe = this.svg.append("circle")
            .attr("fill", "#aadaff")
            .attr("stroke", "#000")
            .attr("stroke-width", "0.2")
            .attr("cx", this.width / 2)
            .attr("cy", this.height / 2)
            .attr("r", initialScale)

        var svg = this.svg

        Promise.all([this.country_outlines_promise]).then((results) => {

            this.svg.call(d3.drag().on('drag', () => {

                    var rotate = projection.rotate()
                    var k = sensitivity / projection.scale()
                    projection.rotate([
                        rotate[0] + d3.event.dx * k,
                        rotate[1] - d3.event.dy * k
                    ])
                    path = d3.geoPath().projection(projection)
                    this.svg.selectAll("path").attr("d", path)



                }))
                .call(d3.zoom().on('zoom', () => {

                    if (d3.event.transform.k > 0.3) {
                        projection.scale(initialScale * d3.event.transform.k)
                        path = d3.geoPath().projection(projection)
                        this.svg.selectAll("path").attr("d", path)
                        globe.attr("r", projection.scale())
                    } else {
                        d3.event.transform.k = 0.3
                    }

                }))


            let country_outlines = results[0]
            let feature = this.svg.selectAll("path")
                .data(country_outlines)
                .enter().append("this.svg:path")
                .attr("fill", (d) => {
                    if (this.placesById[d.id]) {
                        return '#BBD9BA';
                    }
                    return "#f4f4f4";
                })
                .attr("stroke", "#999")
                .attr("d", path);

            feature.append("this.svg:title")
                .text(d => d.properties.name);


            //Optional rotate
            d3.timer(
                function(elapsed) {
                    const rotate = projection.rotate()
                    const k = sensitivity / projection.scale()
                    projection.rotate([
                        rotate[0] - 1 * k,
                        rotate[1]
                    ])
                    path = d3.geoPath().projection(projection)
                    svg.selectAll("path").attr("d", path)
                }, 200)





        });
    }


}

class LinePlot {
  constructor(svg_element_id) {
    this.svg = d3.select('#' + svg_element_id);
    this.height = document.getElementById(svg_element_id).height.baseVal.value;
    this.width = document.getElementById(svg_element_id).width.baseVal.value;
    this.margin = ({
      top: 20,
      right: 20,
      bottom: 30,
      left: 70
    });

    var timeparser = d3.utcParse("%Y-%m-%d");
    this.death_test_promise = d3.csv("data/clean/cases_deaths_tests_bycountry_overtime.csv").then((data) => {
      let new_data = [];

      data.forEach(function(d) {
        new_data.push({
          "id": d.id,
          "name": d.name,
          "date": timeparser(d.date),
          "cases": +d.cases,
          "deaths": +d.deaths,
          "tests": +d.tests,
          "cases_per_million": +d.cases_per_million,
          "deaths_per_million": +d.deaths_per_million,
          "tests_per_thousand": +d.tests_per_thousand
        });

      });

      return new_data;
    });
  }

  draw(category, countries) {
    var x = d3.scaleUtc().range([this.margin.left, this.width - this.margin.right]);
    var y = d3.scaleLinear().range([this.height - this.margin.bottom, this.margin.top]);
    var xAxis = g => g.attr("transform", `translate(0,${this.height - this.margin.bottom})`).call(d3.axisBottom(x).ticks(this.width / 80).tickSizeOuter(0));
    var yAxis = g => g.attr("transform", `translate(${this.margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(category));

    var line = d3.line()
      .defined(d => !isNaN(d))

    var svg = this.svg
      .attr("viewBox", [0, 0, this.width, this.height])
      .style("overflow", "visible");


    Promise.all([this.death_test_promise]).then((results) => {
      var data = results[0].filter(d => countries.includes(d.name));
      data = data.reduce(function(r, a) {
        r[a.name] = r[a.name] || [];
        r[a.name].push(a);
        return r;
      }, Object.create(null));

      var dates = data[countries[0]].map(d => d.date);

      x.domain(d3.extent(dates));
      y.domain([0, d3.max(countries.map(c => data[c]), c => d3.max(c.map(d => d[category])))]).nice()

      line.x((d, i) => x(dates[i]));
      line.y(d => y(d));

      svg.append("g")
        .call(xAxis);

      svg.append("g")
        .call(yAxis);

      var path = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .selectAll("path")
        .data(countries.map(c => data[c]))
        .enter().append("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", d => line(d.map(i => i[category])));

      svg.call(hover, path);

      function hover(svg, path) {
        var dates = data[countries[0]].map(d => d.date);
        var data_countries = countries.map(c => data[c]);
        if ("ontouchstart" in document) svg
          .style("-webkit-tap-highlight-color", "transparent")
          .on("touchmove", moved)
          .on("touchstart", entered)
          .on("touchend", left)
        else svg
          .on("mousemove", moved)
          .on("mouseenter", entered)
          .on("mouseleave", left);

        const dot = svg.append("g")
          .attr("display", "none");

        dot.append("circle")
          .attr("r", 2.5);

        dot.append("text")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("text-anchor", "middle")
          .attr("y", -8);

        function moved() {
          d3.event.preventDefault();
          const mouse = d3.mouse(this);
          const xm = x.invert(mouse[0]);
          const ym = y.invert(mouse[1]);
          const i1 = d3.bisectLeft(dates, xm, 1);
          const i0 = i1 - 1;
          const i = xm - dates[i0] > dates[i1] - xm ? i1 : i0;
          const v = d3.min(data_countries, d => Math.abs(d[i][category] - ym));
          const s = data_countries.filter(d => Math.abs(d[i][category] - ym) == v)[0];
          path.attr("stroke", d => d === s ? null : "#ddd").filter(d => d === s).raise();
          dot.attr("transform", `translate(${x(dates[i])},${y(s[i][category])})`);
          dot.select("text").text(s[i].name + " : " + s[i][category].toString());
        }

        function entered() {
          path.style("mix-blend-mode", null).attr("stroke", "#ddd");
          dot.attr("display", null);
        }

        function left() {
          path.style("mix-blend-mode", "multiply").attr("stroke", null);
          dot.attr("display", "none");
        }
      }

    });

  }


}

function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        // `DOMContentLoaded` already fired
        action();
    }
}

whenDocumentLoaded(() => {
    // plot_object = new Globe('globe');
    // this.plot_object.draw();
    // plot object is global, you can inspect it in the dev-console
    lineplot = new LinePlot('lineplot');
    this.lineplot.draw('cases', ['France', 'Switzerland', 'Italy', 'Germany', 'United States']);
});
