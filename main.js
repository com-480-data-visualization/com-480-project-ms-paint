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
    constructor(svg_element_id, comparison_data) {
        this.svg = d3.select('#' + svg_element_id);
        this.height = document.getElementById(svg_element_id).height.baseVal.value;
        this.width = document.getElementById(svg_element_id).width.baseVal.value;

        var tooltip = d3.select('body')
            .append('div')
            .attr('id', 'tooltip')
            .attr('style', 'position: absolute; opacity: 0;');


        this.death_test_promise = d3.csv(comparison_data).then((data) => {
            let new_data = [];

            data.forEach(function(d) {
                new_data.push({
                    "id": d.id,
                    "name": d.name,
                    "date": d.date,
                    "cases": +d.case,
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

    draw(x_axis, y_axis, countries) {

        console.log(countries)

        var margin = {
            top: 100,
            right: 50,
            bottom: 50,
            left: 50
        };

        var x = d3.scalePow()
            .exponent(1)
            .range([0, this.width])
            .nice();

        var y = d3.scalePow()
            .exponent(1)
            .range([this.height, 0]);

        var xAxis = d3.axisBottom(x).ticks(12),
            yAxis = d3.axisLeft(y).ticks(12 * this.height / this.width);


        var brush = d3.brush().extent([
                [0, 0],
                [this.width, this.height]
            ]).on("end", brushended),
            idleTimeout,
            idleDelay = 350;

        var svg = this.svg.append("svg")
            .attr("width", this.width + margin.left + margin.right)
            .attr("height", this.height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var clip = this.svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("x", 0)
            .attr("y", 0);

        var svg = this.svg;

        var country_data;

        var scatter = svg.append("g")
            .attr("id", "scatterplot")
            .attr("clip-path", "url(#clip)");

        Promise.all([this.death_test_promise]).then((results) => {

            country_data = results[0];

            country_data = country_data.filter(d => d.date == "2020-04-24");


            var xExtent = d3.extent(country_data, function(d) {
                return d[x_axis];
            });

            var yExtent = d3.extent(country_data, function(d) {
                return d[y_axis];
            });

            console.log(yExtent);


            x.domain(d3.extent(country_data, function(d) {
                return d[x_axis];
            })).nice();

            y.domain(d3.extent(country_data, function(d) {
                return d[y_axis];
            })).nice();


            scatter.selectAll(".dot")
                .data(country_data)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", 7)
                .attr("cx", function(d) {
                    return x(d[x_axis]);
                })
                .attr("cy", function(d) {
                    return y(d[y_axis]);
                })
                .attr("opacity", d => countries.includes(d.id) ? 1.0 : 0.2)
                .style("fill", "#1a237e ");


            scatter.selectAll("text")
                .data(country_data)
                .enter()
                .append("text")
                .text(d => countries.includes(d.id) ? d.name : "")
                .attr("x", d => x(d[x_axis]))
                .attr("y", d => y(d[y_axis]) - 7);

            // x axis
            svg.append("g")
                .attr("class", "x axis")
                .attr('id', "axis--x")
                .attr("transform", "translate(0," + this.height + ")")
                .call(xAxis);

            svg.append("text")
                .style("text-anchor", "end")
                .attr("x", this.width)
                .attr("y", this.height - 8)
                .text(x_axis);

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
                .text(y_axis);

            scatter.append("g")
                .attr("class", "brush")
                .call(brush);


        });

        function brushended() {

            var s = d3.event.selection;
            if (!s) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
                x.domain(d3.extent(country_data, function(d) {
                    return d[x_axis];
                })).nice();
                y.domain(d3.extent(country_data, function(d) {
                    return d[y_axis];
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
                    return x(d[x_axis]);
                })
                .attr("cy", function(d) {
                    return y(d[y_axis]);
                });
            scatter.selectAll("text").transition(t)
                .attr("x", function(d) {
                    return x(d[x_axis]);
                })
                .attr("y", function(d) {
                    return y(d[y_axis]) - 7;
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
    // plot_object = new Globe('globe');
    // this.plot_object.draw();
    // plot object is global, you can inspect it in the dev - console

    scatterplot = new ScatterPlot('activity', "data/clean/cases_deaths_tests_bycountry_overtime.csv");
    const countries = ['USA', 'GBR', 'NLD', 'SWE'];
    this.scatterplot.draw("deaths_per_million", "tests_per_thousand", countries);
});