// Setting up global width and length, and padding sizes
let globalWidth = 1200, globalHeight = 1000;
paddings = {top : 100, bottom : 120, left : 40, right : 20};

// create and select the global svg
let svg = d3.select("body")
    .append("svg")
    .attr("width", globalWidth)
    .attr("height", globalHeight);

// Create the main visualization group
let mainG = svg.append('g')
    .attr('transform', 'translate('+[paddings.left, paddings.top]+')');


// Create the group for placing state selectors
let stateG = svg.append('g')
    .attr('class', 'states')
    .attr('transform', function() {
        var left = paddings.left + 500;
        var top = paddings.top + 400;
        return 'translate('+[left, top]+')';
    });

// Set the function that updates title
function updateTitle(stateAbbr) {
    var textElem = globalTitleG.select('text');
    var curTitle = textElem.text();
    if (stateAbbr === curTitle) {
        textElem.text(function() {
            return "USA";
        });
        return false;
    } else {
        textElem.text(function() {
            return stateAbbr;
        });
        return true;
    }
}
var globalCong = 97;
var showState = false;




// Create the zoomed-in visualization group
var zoomedInPos = {
    left: globalWidth / 2.5,
    top: paddings.top / 3,
};

let zoomedInG = svg.append('g')
    .attr('transform', 'translate('+[zoomedInPos.left, zoomedInPos.top]+')')
    //.attr('visibility', 'hidden');
    .attr('visibility', 'visible');



// Create a pre-rendered rectangle frame for zoomed in viz
var zoomedInWidth = globalWidth / 4;
var zoomedInHeight = globalHeight / 4;

var zoomedInFrame = zoomedInG.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', zoomedInWidth)
    .attr('height', zoomedInHeight)
    .style('fill', '#FDEBD0');

// create two groups for zoomed in bars
let repubBarG = zoomedInG.append('g');
let democBarG = zoomedInG.append('g');


// Set up the global title
var globalTitleG = mainG.append('g')
    .attr('class', 'title');


// load the data and do the job
d3.csv('initial_data.csv', dataPreprocessor).then(function(dataset) {
    var original_data = dataset;

    console.log(original_data);



    // get the map
    compressData(original_data);

    // register functions used to show and remove personDetail

    showPersonDetail = function (icpsr) {

        // show image


        var images = zoomedInG.selectAll("image")
            .data([0]) // number of images, [0] for 1, [0, 0] for 2
            .enter();

        images.exit().remove();

        images.append('svg:image')
            .attr("xlink:href", function() {
                var patchedIcpsr = ("00000" + icpsr).slice(-6);
                return "https://voteview.com/static/img/bios/" + patchedIcpsr + ".jpg";
            })
            .attr('width', "150")
            .attr('height', "150");

        console.log(icpsrToPersonMap[icpsr]);

        var text = zoomedInG.selectAll("text")
            .data([icpsrToPersonMap[icpsr]])
            .enter();

        text.exit().remove();

        text.append('text')
            .attr('x', 5)
            .attr('y', 180)
            .text(function(d) {
                console.log(d);
                var intCongArr = [];
                for (var i = 0; i < d.congress.length; i++) intCongArr.push(parseInt(d.congress[i]));
                var minCong = d3.extent(intCongArr)[0].toString();
                var maxCong = d3.extent(intCongArr)[1].toString();
                if (maxCong == '116' || d.name === "TRUMP, Donald John") maxCong = " to now";
                else maxCong = " ~ " + maxCong;
                var str = "Name: " + d.name + "\n" + "Congress: " + minCong + maxCong;
                console.log(str);
                return str;
            })
            .attr("font-size", "20px")
            .attr("fill", 'steelblue');

        // show a dot in the main viz that emphesizes this person
        /*
        personDots = personDotsG.selectAll('circle')
            .data(icpsrToPersonMap[icpsr].congress)
            .enter()
            .append('circle')
            .attr('cx', function(d) {
                var curYear = (d - 57) * 2  + 1900;
                return xScale(curYear)
            })
            .attr('cy', function(d) {
                return yScale(icpsrToPersonMap[icpsr].dim1)
            })
            .attr('r', function(d) {
                return 10;
            })
            .style('opacity', function(d) {
                if (d.chamber === 'President') return 1;
                else return 1;
            })
            .style('fill', function(d) {
                if (d.chamber === 'President') return 'gold'; // president
                else if (d.party === '200') return 'red'; // republican
                else return 'blue'; // democrats
            })

         */
    }

    // function that clears out the detailed view
    clearDetailView = function() {
        zoomedInG.selectAll("image").remove();
        zoomedInG.selectAll("text").remove();
        //personDotsG.selectAll("circle").remove();
    }




    // process data to group them by congress
    dataByCong = {};
    for (var cong = 97; cong <= 116; cong++) {
        dataByCong[cong] = [];
    }
    for (var i = 0; i < original_data.length; i++) {
        var curRow = original_data[i];
        dataByCong[curRow.congress].push(curRow);
    }

    // process traceData: trace[97][0][0] - republican's median dim1 of 97th congress. trace[97][1] - median dim2 of 97th congress
    traceData = {};
    for (var cong = 97; cong <= 116; cong++) {
        var RepubAllDim1 = [];
        var RepubAllDim2 = [];
        var DemocAllDim1 = [];
        var DemocAllDim2 = [];
        for (var i = 0; i < dataByCong[cong].length; i++) {
            if (dataByCong[cong][i].party === '100') {
                RepubAllDim1.push(dataByCong[cong][i].dim1);
                RepubAllDim2.push(dataByCong[cong][i].dim2);
            } else {
                DemocAllDim1.push(dataByCong[cong][i].dim1);
                DemocAllDim2.push(dataByCong[cong][i].dim2);
            }
        }
        traceData[cong] = [];
        traceData[cong].push([d3.median(RepubAllDim1), d3.median(RepubAllDim2)]);
        traceData[cong].push([d3.median(DemocAllDim1), d3.median(DemocAllDim2)]);
    }

    dataByStateByCong = processData(dataByCong);
    console.log(dataByStateByCong);

    // Step1: create the X and Y scale for the major visualization
    xScale = d3.scaleLinear()
        .domain([-1, 1])
        .range([0, globalWidth - paddings.left - paddings.right]);

    yScale = d3.scaleLinear()
        .domain([-1, 1])
        .range([globalHeight - paddings.top - paddings.bottom, 0]);

    // create the X and Y axis for the major visualization
    var xAxis = d3.axisBottom()
        .scale(xScale);

    var yAxis = d3.axisLeft()
        .scale(yScale);

    // Append two axes to our main group
    var axisGroup = mainG.append('g');

    var xAxisPadding = 0;

    var mainVizXAxis = axisGroup.append('g')
        .attr('class', 'axis x')
        .attr('transform', 'translate('+[0, globalHeight - xAxisPadding - paddings.bottom - paddings.top]+')')
        .call(xAxis);

    var mainVizYAxis = axisGroup.append('g')
        .attr('class', 'axis y')
        .attr('transform', 'translate('+[0, -xAxisPadding]+')')
        .call(yAxis);

    // draw basic circles:
    circleGroup.selectAll('circle')
        .data(dataByCong[97])
        .enter()
        .append('circle')
        .attr('cx', function (d, i) {
            return xScale(d.dim1);
        })
        .attr('cy', function (d, i) {
            return yScale(d.dim2);
        })
        .attr('r', function (d, i) {
            return 3;
        })
        .style('fill', function(d, i) {
            if (d.party === '200') return 'blue';
            else return 'red';
        })
        // details on demand for each member dot
        .on('click', function(d) {
            clearDetailView();
            showPersonDetail(d.icpsr);
        })
        .on('mouseover', function(d) {
            tooltip1.show(d);

        })
        .on('mouseout', function(d) {
            tooltip1.hide();
        });

    // draw default title
    globalTitleG.append('text')
        .attr('x', 100)
        .attr('y', 20)
        .text("USA")
        .attr("font-size", "40px");


    // draw default trace:

    repubTraceG//.selectAll('circle')
        //.data(traceData[97])
        //.enter()
        .append('circle')
        .attr('cx', function (d, i) {
            return xScale(traceData[97][0][0]);
        })
        .attr('cy', function (d, i) {
            return yScale(traceData[97][0][1]);
        })
        .attr('r', function (d, i) {
            return 6;
        })
        // Republicans(200), Democrats(100)
        .style('fill', function(d, i) {
            return "black";
        });

    repubDataPoints.push([xScale(traceData[97][0][0]), yScale(traceData[97][0][1])]);


    democTraceG//.selectAll('circle')
    //.data(traceData[97])
    //.enter()
        .append('circle')
        .attr('cx', function (d, i) {
            return xScale(traceData[97][1][0]);
        })
        .attr('cy', function (d, i) {
            return yScale(traceData[97][1][1]);
        })
        .attr('r', function (d, i) {
            return 6;
        })
        // Republicans(200), Democrats(100)
        .style('fill', function(d, i) {
            return "green";
        });


    democDataPoints.push([xScale(traceData[97][1][0]), yScale(traceData[97][1][1])]);

    // set up the second viz scales
    // set up the zoomed-in scale
    zoomedScaleX = d3.scaleLinear()
        .range([0, zoomedInWidth]);

        //var zoomedScaleY = d3.scaleLinear()
            //.range([zoomedInHeight, 0]);

    // Set the domain of zoomedIn scales
    zoomedScaleX.domain([-0.6, 0.6]);
        //zoomedScaleY.domain([-0.25, 0.4]);

    zoomedInBarWidth = 4;

    // draw initial bars
    repubBarG.append('rect')
        .attr('x', zoomedScaleX(traceData[97][0][0]) - zoomedInBarWidth)
        .attr('y', zoomedInHeight * 1 / 4)
        .attr('width', zoomedInBarWidth)
        .attr('height', zoomedInHeight * 3 / 4)
        .style('fill', 'blue');

    democBarG.append('rect')
        .attr('x', zoomedScaleX(traceData[97][1][0]) - zoomedInBarWidth)
        .attr('y', zoomedInHeight * 1 / 4)
        .attr('width', zoomedInBarWidth)
        .attr('height', zoomedInHeight * 3 / 4)
        .style('fill', 'red');

    // draw initial text with bars
    repubBarG.append('text')
        .attr('x', zoomedScaleX(traceData[97][0][0]) - 5 * zoomedInBarWidth)
        .attr('y', zoomedInHeight * 1 / 5)
        .text(traceData[97][0][0]);

    democBarG.append('text')
        .attr('x', zoomedScaleX(traceData[97][1][0]) - 5 * zoomedInBarWidth)
        .attr('y', zoomedInHeight * 1 / 5)
        .text(traceData[97][1][0]);

    //console.log(democBarG);

    // create a slider
    var dataTime = d3.range(97, 116).map(function(d) {
        return new Date(1981 + (d - 97) * 2, 10, 3);
    });

    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365)
        .width(1000)
        .tickFormat(d3.timeFormat('%Y'))
        .tickValues(dataTime)
        .default(new Date(1981, 10, 3))
        .on('onchange', val => {
            var congInt = (parseInt(d3.timeFormat('%Y')(val)) - 1981) / 2 + 97;
            globalCong = congInt;
            if (!showState) {
                drawPoints(dataByCong[congInt]);
                drawTrace(traceData[congInt]);
                drawBars(traceData[congInt]);
            } else {
                drawPoints(dataByStateByCong[globalTitleG.select('text').text()][congInt]);
            }
        });

    var gTime = mainG.append('g')
        .attr('transform', 'translate('+[40, globalHeight - paddings.bottom - paddings.top + 40]+')');

    gTime.call(sliderTime);


});

circleGroup = mainG.append('g');

// The function to draw member data points based on congress number (year)
function drawPoints(thatCongressData) {
    //console.log(thatCongressData);

    //circleGroup.selectAll('circle').remove();

    var circles = circleGroup.selectAll("circle")
        /*
        .data(thatCongressData, function (d) {
            return d.name;
        }); */
        .data(thatCongressData);
    //console.log(circles);

    circles.exit().remove(); // exit and remove unneeded circles


    circles = circles.enter() // enter
        .append('circle')
        .attr('r', 0)
        .merge(circles);

    circles.on('click', function(d) {
        clearDetailView();
        showPersonDetail(d.icpsr);
    })
        .on('mouseover', function(d) {
            tooltip1.show(d);

        })
        .on('mouseout', function(d) {
            tooltip1.hide();
        });



    // update
    circles.transition()
        .duration(500)
        .attr('cx', function (d, i) {
            return xScale(d.dim1);
        })
        .attr('cy', function (d, i) {
            return yScale(d.dim2);
        })
        .attr('r', function (d, i) {
            if (d.chamber === 'President') return 7;
            return 3;
        })
        // Republicans(200), Democrats(100)
        .style('fill', function(d, i) {
            if (d.chamber === 'President') return 'gold';
            else if (d.party === '200') return 'blue';
            else return 'red';
        });




    console.log(circles);
}

//

let traceGroup = mainG.append('g');
let repubTraceG = traceGroup.append('g');
let democTraceG = traceGroup.append('g');

// Generate trace path

// Overall line generator
var lineGenerator = d3.line()
    .curve(d3.curveCardinal);

var repubDataPoints = [];
var democDataPoints = [];

    // trace[0][0] - republican's median dim1 of 97th congress. trace[97][1] - median dim2 of 97th congress
function drawTrace(thatTraceData) {
    //console.log(thatTraceData);
    var repubCircle = repubTraceG.select('circle');
        //.data(thatTraceData[0]);

    repubCircle.exit().remove();

    //repubCircle.enter()
        //.append('circle')
        //.attr('r', 0);

    repubCircle.transition()
        .duration(500)
        .attr('cx', function (d, i) {
            return xScale(thatTraceData[0][0]);
        })
        .attr('cy', function (d, i) {
            return yScale(thatTraceData[0][1]);
        })
        .attr('r', function (d, i) {
            return 6;
        })
        // Republicans(200), Democrats(100)
        .style('fill', function(d, i) {
            return "black";
        });

    repubDataPoints.push([xScale(thatTraceData[0][0]), yScale(thatTraceData[0][1])])
    //console.log(repubDataPoints);
    var repubPathData = lineGenerator(repubDataPoints);
    //console.log(repubPathData);
    repubTraceG.append('path')
        .attr('d', repubPathData)
        .style('fill', 'none')
        .style('stroke', 'steelblue')
        .attr("stroke-width", 2);


// ----------------------------------------------------------

    var democCircle = democTraceG.select('circle');
    //.data(thatTraceData[0]);

    democCircle.exit().remove();

    //repubCircle.enter()
    //.append('circle')
    //.attr('r', 0);

    democCircle.transition()
        .duration(500)
        .attr('cx', function (d, i) {
            return xScale(thatTraceData[1][0]);
        })
        .attr('cy', function (d, i) {
            return yScale(thatTraceData[1][1]);
        })
        .attr('r', function (d, i) {
            return 6;
        })
        // Republicans(200), Democrats(100)
        .style('fill', function(d, i) {
            return "green";
        });

    democDataPoints.push([xScale(thatTraceData[1][0]), yScale(thatTraceData[1][1])])
    //console.log(democDataPoints);
    var democPathData = lineGenerator(democDataPoints);
    //console.log(democPathData);
    democTraceG.append('path')
        .attr('d', democPathData)
        .style('fill', 'none')
        .style('stroke', 'orange')
        .attr("stroke-width", 2);

}

// the function for drawing bars for zoomedIn Graph
function drawBars(thatTraceData) {
    var repubBar = repubBarG.select('rect');

    repubBar.transition()
        .duration(500)
        .attr('x', zoomedScaleX(thatTraceData[0][0]) - zoomedInBarWidth)
        .attr('y', zoomedInHeight * 1 / 4)
        .attr('width', zoomedInBarWidth)
        .attr('height', zoomedInHeight * 3 / 4)
        .style('fill', 'blue');

    var democBar = democBarG.select('rect');

    democBar.transition()
        .duration(500)
        .attr('x', zoomedScaleX(thatTraceData[1][0]) - zoomedInBarWidth)
        .attr('y', zoomedInHeight * 1 / 4)
        .attr('width', zoomedInBarWidth)
        .attr('height', zoomedInHeight * 3 / 4)
        .style('fill', 'red');

    // update text
    repubBarG.select('text')
        .transition()
        .duration(500)
        .attr('x', zoomedScaleX(thatTraceData[0][0]) - 5 * zoomedInBarWidth)
        .attr('y', zoomedInHeight * 1 / 5)
        .text(thatTraceData[0][0]);

    democBarG.select('text')
        .transition()
        .duration(500)
        .attr('x', zoomedScaleX(thatTraceData[1][0]) - 5 * zoomedInBarWidth)
        .attr('y', zoomedInHeight * 1 / 5)
        .text(thatTraceData[1][0]);

}




// create the data preprocessor
function dataPreprocessor(row) {
    return {
        'congress': row['congress'],
        'chamber': row['chamber'],
        'icpsr': row['icpsr'],
        'party': row['party_code'],
        'name': row['bioname'],
        'state': row['state_abbrev'],
        'dim1': row['nominate_dim1'],
        'dim2': row['nominate_dim2'],
    };
}

// data compressing for fast individual look up based on icpsr

function compressData(originalData) {
    var res = {};
    for (var i = 0; i < originalData.length; i++) {
        var curRow = originalData[i];
        var curIcpsr = curRow.icpsr;
        var curObj;
        if (!(curIcpsr in res)) {
            curObj = {};
            curObj['name'] = curRow.name;
            curObj['congress'] = [curRow.congress];
            curObj['dim1'] = curRow.dim1;
            res[curIcpsr] = curObj;
        } else {
            curObj = res[curIcpsr];
            curObj['congress'].push(curRow.congress);
        }
    }

    // important -> global map for fast person lookup based on icpsr
    icpsrToPersonMap = res;
}

// process function for dataByStateByCong
function processData(dataByCong) {
    var res = {}; // res['va'][116]
    for (var i = 97; i <= 116; i++) {
        var thatYear = dataByCong[i];
        for (var j = 0; j < thatYear.length; j++) {
            var person = thatYear[j];
            var personStateAbbr = person.state;
            //if (personStateAbbr === 'USA') continue;
            //console.log(personStateAbbr);
            if (! (personStateAbbr in res)) {
                res[personStateAbbr] = {};
                //console.log(res[personStateAbbr]);
            }
            if (! (i in res[personStateAbbr])) {
                res[personStateAbbr][i] = [];
            }
            res[personStateAbbr][i].push(person);
        }
    }
    return res;
    //console.log(res);
}

// Set a tooltip for each member
var tooltip1 = d3.tip()
    .attr('class', 'd3-tip tip1')
    .offset([-8, 0])
    .html(function(d) {
        var partyName = d.party === 200 ? "Republicans" : "Democrats";
        return "<strong>" + d.name + " </strong>" + " (" + partyName + ")";
    });

// Tooltip2 is the tooltip for state selectors
var tooltip2 = d3.tip()
    .attr('class', 'd3-tip tip2')
    .offset([0, 0])
    .html(function(d) {
        var abbr = abbrState(d.properties.name, 'abbr');
        return "<strong>" + abbr + " </strong>";
    });



// register tooltips
svg.call(tooltip1);
svg.call(tooltip2);

// set up the topojson
var path = d3.geoPath();
//console.log(path);


    d3.json("./states-10m.json").then(function(topology) {

        //console.log(topology);
        // default scale is 1000!
        var projection = d3.geoAlbersUsa().scale([500]);
        var path = d3.geoPath().projection(projection);
        var geojson = topojson.feature(topology, topology.objects.states).features;

        stateG.selectAll("path")
            .data(geojson)
            .enter()

            .append('path')
            .attr('d', path)
            .attr('class', 'statesPath')
            .style('fill', 'steelblue')
            .on('mouseover', function(d) {
                tooltip2.show(d);
                d3.select(this).style('fill', 'red');
            })
            .on('mouseout', function(d) {
                tooltip2.hide(d);
                d3.select(this).style('fill', 'steelblue');
            })
            .on('click', function(d) {
                //console.log(d);
                var stateFullName = d.properties.name;
                var stateAbbr = abbrState(stateFullName, 'abbr');
                //console.log(stateAbbr);


                // true means use individual state data, false means use the whole country data
                showState = updateTitle(stateAbbr);
                var congInt = globalCong;
                if (showState) {
                    drawPoints(dataByStateByCong[stateAbbr][congInt]);
                    drawPoints(dataByStateByCong[stateAbbr][congInt]);
                } else {
                    //drawPoints(dataByCong[congInt]);
                    drawPoints(dataByCong[congInt]);
                    drawTrace(traceData[congInt]);
                    drawBars(traceData[congInt]);
                }

            });

    });


