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
        
        this.data_promise = d3.csv('data/clean/cases_deaths_tests_bycountry_overtime.csv').then((data) => {
            return data;
        });
        
        let range_div = d3.select('#date_selector');
        this.range = range_div.append("input")
                        .attr("type", "range");
        


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

        Promise.all([this.country_outlines_promise, this.data_promise]).then((results) => {
            
            //Load the data for the chloropeth and extract the list of dates
            //For some reason the dates stay in order. Might want to check if this is the case
            //under different browsers so far only tested firefox.
            let country_data = results[1];
            const dates = [...new Set(country_data.map(d => d.date))]
            
            //kept for debugging purposes can be removed
            console.log(country_data);
            console.log(dates);
            
            //scale the range input with the available dates
            this.range.attr("max", dates.length - 1);
            
            //Create the color scale. I Chose a linear scale a log scale may be more appropriate.
            let colorScale = d3.scaleLinear()
                .domain(d3.extent(country_data.map(d => d.cases)))
                .range(["blue", "red"]);
                
                
            //filter the data for a given day and create a function for easy access
            let current_data = country_data.filter(d => d.date == "2020-04-14");
            let casesById = {};
            current_data.forEach(country => {
                casesById[country.id] = country.cases;
            });

            
            //kept for debugging purposes can be removed
            console.log(current_data); 
            
            
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
                    if (casesById[d.id]) {
                        // Current data is an array so we have
                        return colorScale(casesById[d.id]);
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
