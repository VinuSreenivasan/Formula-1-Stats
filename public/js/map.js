/** Class representing the map view. */
class Map {

    /** Creates a Map Object */
    constructor() {

        //this.projection = d3.geoWinkel3().scale(125).translate([420, 190]);
        this.projection = d3.geoEquirectangular().scale(125).translate([420, 190]);


    }


    /**
     * Renders the map
     * @param world the topojson data with the shape of all countries and a string for the activeYear
     */
    drawMap(world) {
        let that = this;

        let geojson = topojson.feature(world, world.objects.countries);
        let path = d3.geoPath().projection(this.projection);
        let svg = d3.select('#map-chart').append('svg');//.attr("width","300").attr("height","300");
        var topData;


        d3.select("#map-selectAll-btn").on("click", circuits);
        d3.select("#map-select-btn").on("click", topCircuit);


        svg.selectAll('path')
            .data(geojson.features)
            .enter().append('path')
            .attr('d', path)
            .classed('boundary', true)
            .classed('countries', true)
            .attr('id', d =>  d.id);


        let graticule = d3.geoGraticule();
        svg.append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("d", path);

        async function circuits() {
            let data = await d3.csv("data/consolidated_f1_stats.csv");
            let cirData = await d3.csv("data/circuits.csv");
            var countObj = {};

            //To find the team with most number of wins in each circuit
            var circuitNestedData = d3.nest()
                                          .key(function(d){ return d['circuitName']; })
                                          .key(function(d){ return d['name_x']; })
                                          .rollup(function(d){  
                                          let tempObj = new Object();
                                          tempObj = d3.max(d, function(dd){ return parseInt(dd['wins']); });
                                          return tempObj; 
                                          }) 
                                          .entries(data);

            //To find the team with most number of wins in each circuit
            let circuitAggregateData = {};
            Object.keys(circuitNestedData).forEach(function(d){
                let key = circuitNestedData[d].key;
                let dd = circuitNestedData[d].values;
                let tempVal=[];
                tempVal = d3.max(dd, function(e){ return [parseInt(e.value),e.key]; });
                circuitAggregateData[key] =  tempVal;                      

            });

            var allData = cirData.map(function(d,i){
                return {

                    CircuitName: d.name,
                    Location: d.location,
                    CountryName: d.country,
                    WinningTeam: circuitAggregateData[d.name][1],
                    NumWins: circuitAggregateData[d.name][0],
                    lat : d.lat,
                    lng : d.lng
                };
            });



            var tip = d3.tip()
						  .attr('class', 'd3-tip')
						  .offset([-10, 0])
						  .html(function(d) {
						    return "<strong>Circuit Name: </strong> <span style='color:red'>" + d.CircuitName + "</span>"
						    		+ "<br/>" + "<br/>" +
						    	   "<strong>Location: </strong> <span style='color:red'>" + d.Location + "</span>" 
						    	   + "<br/>" + "<br/>" +
						    	   "<strong>Country: </strong> <span style='color:red'>" + d.CountryName + "</span>"
						    	   + "<br/>" + "<br/>" +
						    	   "<strong>Most Successful Team: </strong> <span style='color:red'>" + d.WinningTeam + "</span>"
						    	    + "<br/>" +"<br/>" +
						    	   "<strong>Number of Wins: </strong> <span style='color:red'>" + d.NumWins + "</span>";




						   
  				})

            svg.call(tip);

            svg.selectAll("circle").remove();
            d3.select("#unique").remove();
            d3.select("#uniqueImage").remove();
            d3.select("#uniqueText").remove();
            d3.select("#uniqueText").remove();
            d3.select("#uniqueText").remove();


            

            let circles = svg.selectAll("circle")
                .data(allData)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return that.projection([d.lng, d.lat])[0];
                })
                .attr("cy", function (d) {

                    return that.projection([d.lng, d.lat])[1];
                })
                .attr("r", 5)
                .style("fill", "red")
                .style("stroke","black")
                .style("opacity", 0.8)
                .style("cursor","pointer");

            circles.on("mouseover",tip.show);



            circles.on("mouseout",tip.hide);

            circles.on("click",function(d){
            	that.drawCarAllCircuit(d.WinningTeam,d.NumWins,d.CircuitName);
            });

        };

        async function topCircuit() {
            let data = await d3.csv("data/consolidated_f1_stats.csv");
            let cirData = await d3.csv("data/circuits.csv");
            var countObj = {};

            //To find the team with most number of wins in each circuit
            var constructorNestedData = d3.nest()
                                          .key(function(d){ return d['circuitName']; })
                                          .key(function(d){ return d['name_x']; })
                                          .rollup(function(d){  
                                          let tempObj = new Object();
                                          tempObj = d3.max(d, function(dd){ return parseInt(dd['wins']); });
                                          return tempObj; 
                                          }) 
                                          .entries(data);

            //To find the team with most number of wins in each circuit
            let aggregateData = {};
            Object.keys(constructorNestedData).forEach(function(d){
                let key = constructorNestedData[d].key;
                let dd = constructorNestedData[d].values;
                let tempVal=[];
                tempVal = d3.max(dd, function(e){ return [parseInt(e.value),e.key]; });
                aggregateData[key] =  tempVal;                      

            });

            //Count the number of races in each circuit
            var numRacesNestData = d3.nest()
                                          .key(function(d){ return d['circuitName']; })
                                          .key(function(d){ return d['season']; })
                                          .rollup(function(d){  
                                            return d;
                                          }) 
                                          .entries(data);

            Object.keys(numRacesNestData).forEach(function(d){
                countObj[numRacesNestData[d].key] = numRacesNestData[d].values.length;
            });                         

            var reducedData = cirData.map(function(d,i){
                
                return {

                    CircuitName: d.name,
                    NumRaces: countObj[d.name],
                    Location: d.location,
                    CountryName: d.country,
                    WinningTeam: aggregateData[d.name][1],
                    NumWins: aggregateData[d.name][0],
                    lat : d.lat,
                    lng : d.lng
                };
            });
            var unique_teams = d3.set(reducedData, function(d){ return d["WinningTeam"]; });

            //top 15 circuits in the world
            topData = reducedData.sort(function(a,b){
                return d3.descending(a.races,b.races);
            }).slice(0,15);

          
            var tip = d3.tip()
						  .attr('class', 'd3-tip')
						  .offset([-10, 0])
						  .html(function(d) {
						    return "<strong>Circuit Name: </strong> <span style='color:red'>" + d.CircuitName + "</span>"
						    		+ "<br/>" + "<br/>" +
						    	   "<strong>Location: </strong> <span style='color:red'>" + d.Location + "</span>" 
						    	   + "<br/>" + "<br/>" +
						    	   "<strong>Country: </strong> <span style='color:red'>" + d.CountryName + "</span>"
						    	   + "<br/>" + "<br/>" +
						    	   "<strong>Most Successful Team: </strong> <span style='color:red'>" + d.WinningTeam + "</span>"
						    	    + "<br/>" +"<br/>" +
						    	   "<strong>Number of Wins: </strong> <span style='color:red'>" + d.NumWins + "</span>";




						   
  				})

            svg.call(tip);


           svg.selectAll("circle").remove();
           d3.select("#unique").remove();
           d3.select("#uniqueImageAll").remove();
           d3.select("#uniqueTextAll").remove();
           d3.select("#uniqueTextAll").remove();
           d3.select("#uniqueTextAll").remove();

            let circles = svg.selectAll("circle")
                .data(topData)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return that.projection([d.lng, d.lat])[0];
                })
                .attr("cy", function (d) {
                    return that.projection([d.lng, d.lat])[1];
                })
                .attr("r", 5)
                .style("fill", "red")
                .style("stroke","black")
                .style("opacity", 0.8)
                .style("cursor","pointer");


            circles.on("mouseover",tip.show);


            circles.on("mouseout",tip.hide);




            circles.on("click",function(d){
            	that.drawCar(d.WinningTeam,d.NumWins,d.CircuitName);
            });



            var table = d3.select("#table").append("table").attr('id','unique');
            var header = table.append("thead").append("tr");
            var tbody = table.append('tbody');
            header
                .selectAll("th")
                .data(["Circuit Name", "Location", "Country Name", "Number of Races"])
                .enter()
                .append("th")
                .text(function(d) { return d; });


           var rows = tbody.selectAll('tr')
                        .data(topData)
                        .enter()
                        .append('tr')
                        .sort(function(a,b){ return d3.ascending(b.NumRaces,a.NumRaces); });


            var cells = rows.selectAll('td')
                           .data(function (row) {
                            return ["CircuitName", "Location", "CountryName", "NumRaces"].map(function (column) {
                                    return {column: column, value: row[column]};
                            });
                        })
                            .enter()
                            .append('td')
                            .text(function (d) { return d.value; });

           
        };
    

        

        circuits();

    };

    drawCar(teamName,numberWins,circuitName)
    {

        let imageUrl = "data/images/teams/"+teamName+".jpg";
        let imageSvg = d3.select("#map-picture");
        imageSvg.select(".player-image").remove();
        imageSvg.append("svg:image").attr('id','uniqueImage')
            .attr("class", "player-image")
            .attr("xlink:href", imageUrl)
            .attr("x", "0")
            .attr("y", "-40")
            .attr("width", "500")
            .attr("height", "400");

        let driverDetails = [];
        driverDetails.push('Circuit Name: ' +circuitName);
        driverDetails.push('Most Successful Team: '+teamName);
        driverDetails.push('Number of wins: ' +numberWins);
        let details = d3.select("#map-text").selectAll("text").data(driverDetails);
        let newDetails = details.enter().append("text").attr('id','uniqueText');
        details.exit().remove();
        details = newDetails.merge(details);
        details.text(d => d)
            .attr("x", -19)
            .attr("y", function(d, i){
                return (i+1)*21.5;
            })
            .style("font-size", "17px")
            .style("font-weight","bolder")
            .attr("class", function(d){return "driver-text";})
            .attr("transform", "translate("+20+","+20+")");
    }


    drawCarAllCircuit(teamName,numberWins,circuitName)
    {

        let imageUrl = "data/images/teams/"+teamName+".jpg";
        let imageSvg = d3.select("#map-picture");
        imageSvg.select(".player-image").remove();
        imageSvg.append("svg:image").attr('id','uniqueImageAll')
            .attr("class", "player-image")
            .attr("xlink:href", imageUrl)
            .attr("x", "0")
            .attr("y", "-40")
            .attr("width", "500")
            .attr("height", "400");

        let driverDetails = [];
        driverDetails.push('Circuit Name:  ' +circuitName);
        driverDetails.push('Most Successful Team:  '+teamName);
        driverDetails.push('Number of wins:  ' +numberWins);
        let details = d3.select("#map-text").selectAll("text").data(driverDetails);
        let newDetails = details.enter().append("text").attr('id','uniqueTextAll');
        details.exit().remove();
        details = newDetails.merge(details);
        details.text(d => d)
            .attr("x", -19)
            .attr("y", function(d, i){
                return (i+1)*21.5;
            })
            .style("font-size", "17px")
            .style("font-weight","bolder")
            .attr("class", function(d){return "driver-text";})
            .attr("transform", "translate("+20+","+20+")");
    }
     
}

