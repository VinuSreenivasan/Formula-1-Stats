class Drivers {

    constructor (driverData, driverChart, selectedDriver, selectedAttribute) {

        this.driverData = driverData;
        this.selectedDriver = selectedDriver;
        this.populateNames(driverData);
        this.update(this.selectedDriver);

        d3.select("#driver-select-btn").on("click", this.showNames);

        this.driverChart = driverChart;
        this.driverChart.update([this.selectedDriver], selectedAttribute);
    };

    populateNames (driverData){

        this.driverData = driverData;

        let drivers = [];
        driverData.forEach(function(d){
            if (drivers.length < 60) // Fix
                drivers.push(d.driver_name);
        });

        let that = this;
        let li = d3.select("#driver-names").selectAll('li').data(drivers);
        let newLi = li.enter().append('li');
        li.exit().remove();
        li = newLi.merge(li);

        li.on('click', function(d){
            that.selectedDriver = d;
            that.showNames();
            that.update(d);
            that.driverChart.update([d], "points");
        });

        li.transition()
            .duration(1000)
            .text(d => d);
    };

    showNames (){
        let x = document.getElementById("driver-names");
        if (x.style.display === "none" || x.style.display === "") {
            x.style.display = "flex";
        } else {
            x.style.display = "none";
        }
    };

    update (name) {
        let imageUrl = null;
        let driverDetails= [];
        let singleDriverData = null;
        this.driverData.forEach(function(driver){
            if(driver.driver_name === name){
                singleDriverData = driver;
                imageUrl = "data/images/drivers/"+name+".jpg";
                driverDetails.push(driver.driver_name);
                driverDetails.push("DOB : "+driver.values[0].value.dob);
                driverDetails.push("Nationality : "+driver.values[0].value.nationality);
            }
        });
        
        let teamSet = d3.set(singleDriverData.values, function (d) {
            return d.value.team;
        });

        let teamNames = Object.values(teamSet);
        let tempNames = [];
        for (let i=0; i < teamNames.length; i++) {
            tempNames.push(teamNames[i]);
            if (i === 2)
                break;
        }

        let teamString = "";
        for (let i=0; i < tempNames.length; i++) {
            if (i === tempNames.length - 1)
                teamString += tempNames[i];
            else
                teamString += tempNames[i] + ", ";
        }

        let start = singleDriverData.values[0].key;
        let end = singleDriverData.values[singleDriverData.values.length - 1].key;
        let seasons = "";
        if (start === end)
            seasons = start;
        else
            seasons = start+" - "+end;

        // Adding season and teams
        driverDetails.push("Seasons : "+seasons);
        driverDetails.push("Teams : "+teamString);

        let imageSvg = d3.select("#image");
        imageSvg.select(".player-image").remove();
        imageSvg.append("svg:image")
            .attr("class", "player-image")
            .attr("xlink:href", imageUrl)
            .attr("x", "10")
            .attr("y", "10")
            .attr("width", "300")
            .attr("height", "300");

        let details = d3.select("#details").selectAll("text").data(driverDetails);
        let newDetails = details.enter().append("text");
        details.exit().remove();
        details = newDetails.merge(details);
        details.text(d => d)
            .attr("x", 50)
            .attr("y", function(d, i){
                return (i+1)*40+40;
            })
            .attr("class", function(d, i){
                if (i === 0) {
                    return "unique-name";
                } else {
                    return "driver-text";
                }
            });
    };
}