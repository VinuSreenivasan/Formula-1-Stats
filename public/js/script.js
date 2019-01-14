function openTab(event, tabName) {

    let tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}

document.getElementById("defaultOpen").click();

d3.json('data/world.json').then(world => {

        const worldMap = new Map();
        worldMap.drawMap(world);

});


async function loadData() {

    let data = await d3.csv('data/driver_data.csv');

    let reducedData = data.map(d =>{
        return {
            season : +d.season,
            driver_name : d.givenName+" "+d.familyName,
            dob : d.dateOfBirth,
            nationality : d.nationality,
            team : d.name_x,
            points : +d.points,
            laps : +d["results.laps"]
        };
    });
    return reducedData;
}


function updateYear (reducedData)
{
    let from = document.getElementById('YearFrom').value;
    let to = document.getElementById('YearTo').value;
    let newData = reducedData.filter(d => (from <= d.season && d.season <= to))
        .sort(function(a,b) { return a.season - b.season; });

    let nestData = d3.nest()
        .key(function (d) { return d.driver_name; })
        .key(function (d) { return d.season; })
        .rollup(function (value) {
            let myObj = new Object;
            myObj.dob = value[0].dob;
            myObj.nationality =  value[0].nationality;
            myObj.team = value[0].team;
            myObj.points = d3.sum(value, function (p) { return p.points; });
            myObj.laps = d3.sum(value, function (l) { return l.laps; });
            return myObj;
        })
        .entries(newData);

    let distinctValue = [];
    nestData.forEach(function(d){
        if (d.values.length >= 4) {
            distinctValue.push({"driver_name": d.key, "values": d.values});
        }
    });

    return distinctValue;
}


loadData().then(data => {

    let min = 1970, max = 2018;
    let from = document.getElementById('YearFrom');
    let to = document.getElementById('YearTo');

    for (let i = min; i<=max; i++){
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        from.appendChild(opt);
    }

    for (let i = max; i>=min; i--){
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        to.appendChild(opt);
    }

    let retData = updateYear(data);
    let selectedDriver = retData[0].driver_name;
    let selectedAttribute = "points";
    let driverChart = new DriverChart(retData, selectedDriver, selectedAttribute);
    const driverObj = new Drivers(retData, driverChart, selectedDriver, selectedAttribute);

    d3.select('#YearFrom').on('change', function () {
        let retVal = updateYear(data);
        driverObj.populateNames(retVal);
        driverObj.update(retVal[0].driver_name);
        driverChart.playerDropdown(retVal, selectedAttribute);
        driverChart.update([retVal[0].driver_name], selectedAttribute);
    });

    d3.select('#YearTo').on('change', function () {
        let retVal = updateYear(data);
        driverObj.populateNames(retVal);
        driverObj.update(retVal[0].driver_name);
        driverChart.playerDropdown(retVal, selectedAttribute);
        driverChart.update([retVal[0].driver_name], selectedAttribute);
    });

});


d3.csv('data/consolidated_f1_stats.csv').then(csv_data => {
    const teamObj = new Teams(csv_data);
});