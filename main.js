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

class ScatterPlot {
    constructor(svg_element_id) {
        this.svg = d3.select('#' + svg_element_id);
        this.height = document.getElementById(svg_element_id).height.baseVal.value;
        this.width = document.getElementById(svg_element_id).width.baseVal.value;


        const death_test_promise = d3.csv("data/cases_deaths_tests_bycountry_overtime").then((data) => {
                data.forEach(function(d) {
                    d.deaths = +d.deaths;
                    d.tests = +d.tests;
                    d.cases_per_million = +d.cases_per_million;
                    d.deaths_per_million = +d.deaths_per_million;
                    d.tests_per_thousand = +d.tests_per_thousand;
                });
            };


        }

        draw(date, x_axis, y_axis, countries) {

            var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 30
            };
            width = 900 - margin.left - margin.right,
                height = 480 - margin.top - margin.bottom;

            var tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            var x = d3.scaleLinear()
                .range([0, width])
                .nice();

            var y = d3.scaleLinear()
                .range([height, 0]);

            var xAxis = d3.axisBottom(x).ticks(12),
                yAxis = d3.axisLeft(y).ticks(12 * height / width);

            var brush = d3.brush().extent([
                    [0, 0],
                    [width, height]
                ]).on("end", brushended),
                idleTimeout,
                idleDelay = 350;

            var svg = d3.select("body").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var clip = svg.append("defs").append("svg:clipPath")
                .attr("id", "clip")
                .append("svg:rect")
                .attr("width", width)
                .attr("height", height)
                .attr("x", 0)
                .attr("y", 0);

            var xExtent = d3.extent(data, function(d) {
                return d.x;
            });
            var yExtent = d3.extent(data, function(d) {
                return d.y;
            });
            x.domain(d3.extent(data, function(d) {
                return d.x;
            })).nice();
            y.domain(d3.extent(data, function(d) {
                return d.y;
            })).nice();

            var scatter = svg.append("g")
                .attr("id", "scatterplot")
                .attr("clip-path", "url(#clip)");

            scatter.selectAll(".dot")
                .data(data)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", 4)
                .attr("cx", function(d) {
                    return x(d.x);
                })
                .attr("cy", function(d) {
                    return y(d.y);
                })
                .attr("opacity", 0.5)
                .style("fill", "#4292c6");

            // x axis
            svg.append("g")
                .attr("class", "x axis")
                .attr('id', "axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("text")
                .style("text-anchor", "end")
                .attr("x", width)
                .attr("y", height - 8)
                .text("X Label");

            // y axis
            svg.append("g")
                .attr("class", "y axis")
                .attr('id', "axis--y")
                .call(yAxis);

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "1em")
                .style("text-anchor", "end")
                .text("Y Label");

            scatter.append("g")
                .attr("class", "brush")
                .call(brush);

            function brushended() {

                var s = d3.event.selection;
                if (!s) {
                    if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
                    x.domain(d3.extent(data, function(d) {
                        return d.x;
                    })).nice();
                    y.domain(d3.extent(data, function(d) {
                        return d.y;
                    })).nice();
                } else {

                    x.domain([s[0][0], s[1][0]].map(x.invert, x));
                    y.domain([s[1][1], s[0][1]].map(y.invert, y));
                    scatter.select(".brush").call(brush.move, null);
                }
                zoom();
            }

            function idled() {
                idleTimeout = null;
            }

            function zoom() {

                var t = scatter.transition().duration(750);
                svg.select("#axis--x").transition(t).call(xAxis);
                svg.select("#axis--y").transition(t).call(yAxis);
                scatter.selectAll("circle").transition(t)
                    .attr("cx", function(d) {
                        return x(d.x);
                    })
                    .attr("cy", function(d) {
                        return y(d.y);
                    });
            }

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
        plot_object = new Globe('globe');
        this.plot_object.draw();
        // plot object is global, you can inspect it in the dev-console

        activity_plot = new ActivityPlot('activity', ['FRA', 'TUR', 'SWE']);
        this.activity_plot.draw();
    });