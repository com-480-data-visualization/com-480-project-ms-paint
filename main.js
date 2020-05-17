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
});