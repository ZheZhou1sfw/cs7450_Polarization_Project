// Setting up global width and length, and padding sizes
//let viz2globalWidth = 2000, viz2globalHeight = 800;
let viz2globalWidth = screen.width * (10 / 11), viz2globalHeight = screen.height*(9/10)  ;
viz2paddings = {top : 100, bottom : 120, left : 70, right : 20};

// create and select the global svg
let viz2svg = d3.select(".viz2Place")
    .append("svg")
    .attr("class", "mainSVG")
    .attr("width", viz2globalWidth)
    .attr("height", viz2globalHeight);

// Create the main visualization group
let viz2mainG = viz2svg.append('g')
    .attr('transform', 'translate('+[viz2paddings.left, viz2paddings.top]+')');

//
var viz2Opacity = 1;




// Create the group for placing state selectors
let viz2stateG = viz2svg.append('g')
    .attr('class', 'states')
    .attr('transform', function() {
        var left = 0;
        var top = -viz2paddings.top / 2;
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
var viz2zoomedInPos = {
    left: viz2globalWidth * 3 / 5,
    top: viz2paddings.top / 2,
};

let viz2zoomedInG = viz2svg.append('g')
    .attr('transform', 'translate('+[viz2zoomedInPos.left, viz2zoomedInPos.top]+')')
    .attr('visibility', 'hidden');
    //.attr('visibility', 'visible');



// Create a pre-rendered rectangle frame for zoomed in viz
var zoomedInWidth = viz2globalWidth / 3;
var zoomedInHeight = viz2globalHeight / 5;

var viz2ZoomedInFrame = viz2zoomedInG.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', zoomedInWidth)
    .attr('height', zoomedInHeight)
    .attr('rx', 5)
    .attr('ry', 5)
    .style('fill', '#FFFFFF');

// create two groups for zoomed in bars
let repubBarG = viz2zoomedInG.append('g');
let democBarG = viz2zoomedInG.append('g');


// Set up the global title
var globalTitleG = viz2mainG.append('g')
    .attr('class', 'title');


// Add a group for legends
var viz2legendG = viz2svg.append('g')
    .attr('transform', function() {
        var tempWidth = viz2globalWidth * 4 / 5;
        var tempHeight = viz2globalHeight / 3.5;
        return 'translate('+[tempWidth, tempHeight]+')'
    });

// draw legends
var legendDelta = 12;

viz2legendG.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 2)
    .style('fill', 'red');

viz2legendG.append('text')
    .attr('x', 10)
    .attr('y', 2)
    .attr('class', 'legendText')
    .style('font-size', 12)
    .text('Republicans')

viz2legendG.append('circle')
    .attr('cx', 0)
    .attr('cy', 1 * legendDelta)
    .attr('r', 2)
    .style('fill', 'blue');

viz2legendG.append('text')
    .attr('x', 10)
    .attr('y', 1 * legendDelta + 3)
    .attr('class', 'legendText')
    .style('font-size', 12)
    .text('Democrats')

viz2legendG.append('circle')
    .attr('cx', 0)
    .attr('cy', 2 * legendDelta + 3)
    .attr('r', 5)
    .style('fill', 'gold');

viz2legendG.append('text')
    .attr('x', 10)
    .attr('y', 2 * legendDelta + 3 + 3)
    .attr('class', 'legendText')
    .style('font-size', 12)
    .text('Presidents')

viz2legendG.append('circle')
    .attr('cx', 0)
    .attr('cy', 3 * legendDelta + 3 + 3)
    .attr('r', 5)
    .style('fill', 'Sienna');

viz2legendG.append('text')
    .attr('x', 10)
    .attr('y', 3 * legendDelta + 3 + 3 + 3)
    .attr('class', 'legendText')
    .style('font-size', 12)
    .text(function() {
        return 'Ideology Score Unknown';
    });

// viz2legendG.append('circle')
//     .attr('cx', 0)
//     .attr('cy', 4 * legendDelta + 3 + 3 + 3)
//     .attr('r', 5)
//     .style('fill', 'pink');

// viz2legendG.append('text')
//     .attr('x', 10)
//     .attr('y', 4 * legendDelta + 3 + 3 + 3 + 3)
//     .attr('class', 'legendText')
//     .style('font-size', 12)
//     .text('Medium Democratic Ideology');

// viz2legendG.append('circle')
//     .attr('cx', 0)
//     .attr('cy', 5 * legendDelta + 3 + 3 + 3 + 3)
//     .attr('r', 5)
//     .style('fill', 'green');
//
// viz2legendG.append('text')
//     .attr('x', 10)
//     .attr('y', 5 * legendDelta + 3 + 3 + 3 + 3 + 3)
//     .attr('class', 'legendText')
//     .style('font-size', 12)
//     .text('Medium Republican Ideology');

viz2legendG.selectAll('text').attr('fill', 'white');


// Add a group for state information
var politicianCountG = viz2svg.append('g')
    .attr('transform', function() {
        var tempWidth = viz2globalWidth * 1 / 9;
        var tempHeight = viz2globalHeight / 3.5;
        return 'translate('+[tempWidth, tempHeight]+')'
}).attr('fill', '#ffffff');

// global variable that traces the number of republicans for current congress & state
var republicansNumbers;
var democratsNumbers;



// load the data and do the job
Promise.all([
    d3.csv('data/viz2/initial_data.csv', dataPreprocessor)

])
.then(function(dataset) {
    var original_data = dataset[0];

    //console.log(original_data);



    // get the map
    compressData(original_data);

    // register functions used to show and remove personDetail

    showPersonDetail = function (icpsr) {

        // show image

        // show image
        var images = viz2zoomedInG.selectAll("image")
            .data([0]) // number of images, [0] for 1, [0, 0] for 2
            .enter();

        images.exit().remove();

        images.append('svg:image')
            .attr("xlink:href", function() {
                var patchedIcpsr = ("00000" + icpsr).slice(-6);
                //console.log("https://voteview.com/static/img/bios/" + patchedIcpsr + ".jpg");
                return "https://voteview.com/static/img/bios/" + patchedIcpsr + ".jpg";
            })
            .attr('width', 90)
            .attr('height', 90)
            .attr('transform', function () {
                var tempX = 10;
                var tempY = 20;
                return 'translate('+[tempX,tempY]+')';
            });

        //console.log(viz1IcpsrToPersonMap[icpsr]);

        var text = viz2zoomedInG.selectAll("text")
            .data([viz1IcpsrToPersonMap[icpsr]])
            .enter();

        text.exit().remove();

        text.append('text')
            .attr('x', 120)
            .attr('y', 40)
            .attr('class', 'zoomedInTextHeader')
            .text(function(d) {
                var str = d.name;
                return str;
            });

        text.append('text')
            .attr('x', 120)
            .attr('y', 40+35)
            .attr('class', 'zoomedInText')
            .text(function(d) {
                //console.log(d);
                var intCongArr = [];
                for (var i = 0; i < d.congress.length; i++) intCongArr.push(parseInt(d.congress[i]));
                var minCong = d3.extent(intCongArr)[0].toString();
                var maxCong = d3.extent(intCongArr)[1].toString();
                if (maxCong == '116' || d.name === "TRUMP, Donald John"){
                    var str = "Tenure: " + minCong + "th to now"
                }
                else{
                    var str = "Tenure: " + minCong + "th to " + maxCong + "th Congresses";
                }

                //console.log(str);
                return str;
            });

        text.append('text')
            .attr('x', 120)
            .attr('y', 40+70)
            .attr('class', 'zoomedInText')
            .text(function(d) {
                //console.log('here');
                //console.log(d);
                return "Ideological Score: " + (d.dim1 === "" ? "Unknown" : d.dim1);
            })
            .attr("font-weight", 700);



        text.append('text')
            .attr('x', 120)
            .attr('y', 40+20)
            .attr('class', 'zoomedInText')
            .text(function(d) {
                var tempStr = "";
                if(d.chamber === 'House'){
                    tempStr = 'House Representative';
                }
                else if(d.chamber === 'President'){
                    tempStr = 'President';
                }
                else{
                    tempStr = 'Senator';
                }
                return ((d.party === '200') ? 'Republican ' : 'Democratic ')+tempStr;
            });
    }

    // function that clears out the detailed view
    clearDetailView = function() {
        viz2zoomedInG.selectAll("image").remove();
        viz2zoomedInG.selectAll("text").remove();
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

    // process traceData: trace[97][0][0] - republican's median dim1 of 97th congress. trace[97][0][1] - median dim2 of republican's 97th congress
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
    //console.log(dataByStateByCong);

    // Step1: create the X and Y scale for the major visualization
    viz2XScale = d3.scaleLinear()
        .domain([-1, 1])
        .range([0, viz2globalWidth - viz2paddings.left - viz2paddings.right]);

    viz2YScale = d3.scaleLinear()
        .domain([-1, 1])
        .range([viz2globalHeight - viz2paddings.top - viz2paddings.bottom, zoomedInHeight + viz2paddings.top]);



    // preprocess datapoints for two path

    allRepubDataPoints = [];
    for (var i = 97; i <= 116; i++) {
        allRepubDataPoints.push([viz2XScale(traceData[i][0][0]), viz2YScale(traceData[i][0][1])]);
    }
    //console.log(allRepubDataPoints);

    allDemocDataPoints = [];
    for (var i = 97; i <= 116; i++) {
        allDemocDataPoints.push([viz2XScale(traceData[i][1][0]), viz2YScale(traceData[i][1][1])]);
    }
    //console.log(allRepubDataPoints);



    // create the X and Y axis for the major visualization
    var xAxis = d3.axisBottom()
        .scale(viz2XScale);

    var yAxis = d3.axisLeft()
        .scale(viz2YScale);

    // Append two axes to our main group
    var axisGroup = viz2mainG.append('g');

    var xAxisPadding = 0;

    var mainVizXAxis = axisGroup.append('g')
        .attr('class', 'axis x')
        .attr('transform', 'translate('+[0, viz2globalHeight - xAxisPadding - viz2paddings.bottom - viz2paddings.top]+')')
        .call(xAxis);

    // add label to xAxis
    var xAxisText = mainVizXAxis.append('text')
        .attr('x', viz2globalWidth / 2)
        .attr('y', 90)
        .attr('class', 'xAxisLabel')
        .text("dw-nominate dim1 score")
        .attr("font-size", "1rem")
        .attr("fill", '#494949')
        .attr("font-family", 'IBM Plex Mono');
        
    var mainVizYAxis = axisGroup.append('g')
        .attr('class', 'axis y')
        .attr('transform', 'translate('+[0, -xAxisPadding]+')')
        .call(yAxis);

    // add label to xAxis
    var yAxisText = mainVizYAxis.append('text')
        .attr("transform", "rotate(-90)")
        .attr('x', function() {
            return -1 * viz2globalHeight / 3;
        })
        .attr('y', function() {
            return -35;
        })
        .attr('class', 'yAxisLabel')
        .text("dw-nominate dim2 score")
        .attr("font-size", "1rem")
        .attr("fill", '#494949')
        .attr("font-family", 'IBM Plex Mono');

    var xAxisTickMods = mainVizXAxis.selectAll(".tick text")
    .attr("font-size","0.5rem")
    .attr("font-family","IBM Plex Mono")
    .attr("color", "#FFFFFF");

    var yAxisTickMods = mainVizYAxis.selectAll(".tick text")
    .attr("font-size","0.5rem")
    .attr("font-family","IBM Plex Mono")
    .attr("color", "#FFFFFF");
    // draw basic circles:
    circleGroup.selectAll('circle')
        .data(dataByCong[97])
        .enter()
        .append('circle')
        .attr('cx', function (d, i) {
            return viz2XScale(d.dim1);
        })
        .attr('cy', function (d, i) {
            return viz2YScale(d.dim2);
        })
        .attr('r', function (d, i) {
            return 3;
        })
        .style('fill', function(d, i) {
            if (d.party === '200') return '#d34444';
            else return '#4451D3';
        })
        .style('opacity', viz2Opacity)
        // details on demand for each member dot
        .on('click', function(d) {
            clearDetailView();
            showPersonDetail(d.icpsr);
        })
        .on('mouseover', function(d) {
            viz2tooltip1.show(d);

        })
        .on('mouseout', function(d) {
            viz2tooltip1.hide();
        });

    // draw default number counts
    //console.log(dataByCong['97']);

    republicansNumbers = 0;
    democratsNumbers = 0;
    for (var i = 0; i < dataByCong['97'].length; i++) {
        var curRow = dataByCong['97'][i];
        if (curRow.party === '200') republicansNumbers += 1;
        else democratsNumbers += 1;
    }

    // politicianCountG.append('text')
    //     .attr('x', 0)
    //     .attr('y', 25)
    //     .text(function() {
    //         return "Republicans: " + republicansNumbers;
    //     })
    //     .attr("font-size", "0.6rem")
    //     .attr("fill", "#494949")
    //     .attr("font-family", "IBM Plex Mono");
    //
    // politicianCountG.append('text')
    //     .attr('x', 0)
    //     .attr('y', 50)
    //     .text(function() {
    //         return "Democrats: " + democratsNumbers;
    //     })
    //     .attr("font-size", "0.6rem")
    //     .attr("fill", "#494949")
    //     .attr("font-family", "IBM Plex Mono");

    // draw default title
    globalTitleG.append('text')
        .attr('x', 50)
        .attr('y', 120)
        .text("USA")
        .attr("font-size", "2rem")
        .attr("fill", "#FFFFFF")
        .attr("font-family", "Miller Text");


    // draw default trace:

    repubTraceG//.selectAll('circle')
        //.data(traceData[97])
        //.enter()
        .append('circle')
        .attr('cx', function (d, i) {
            return viz2XScale(traceData[97][0][0]);
        })
        .attr('cy', function (d, i) {
            return viz2YScale(traceData[97][0][1]);
        })
        .attr('r', function (d, i) {
            return 8;
        })
        // Republicans(200), Democrats(100)
        .style('fill', function(d, i) {
            return "#4451D3";
        });

    repubDataPoints.push([viz2XScale(traceData[97][0][0]), viz2YScale(traceData[97][0][1])]);


    democTraceG//.selectAll('circle')
    //.data(traceData[97])
    //.enter()
        .append('circle')
        .attr('cx', function (d, i) {
            return viz2XScale(traceData[97][1][0]);
        })
        .attr('cy', function (d, i) {
            return viz2YScale(traceData[97][1][1]);
        })
        .attr('r', function (d, i) {
            return 8;
        })
        // Republicans(200), Democrats(100)
        .style('fill', function(d, i) {
            return "#d34444";
        });


    democDataPoints.push([viz2XScale(traceData[97][1][0]), viz2YScale(traceData[97][1][1])]);

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
    // repubBarG.append('rect')
    //     .attr('x', zoomedScaleX(traceData[97][0][0]) - zoomedInBarWidth)
    //     .attr('y', zoomedInHeight * 1 / 4)
    //     .attr('width', zoomedInBarWidth)
    //     .attr('height', zoomedInHeight * 3 / 4)
    //     .style('fill', 'blue');
    //
    // democBarG.append('rect')
    //     .attr('x', zoomedScaleX(traceData[97][1][0]) - zoomedInBarWidth)
    //     .attr('y', zoomedInHeight * 1 / 4)
    //     .attr('width', zoomedInBarWidth)
    //     .attr('height', zoomedInHeight * 3 / 4)
    //     .style('fill', 'red');

    // // draw initial text with bars
    // repubBarG.append('text')
    //     .attr('x', zoomedScaleX(traceData[97][0][0]) - 5 * zoomedInBarWidth)
    //     .attr('y', zoomedInHeight * 1 / 5)
    //     .text(traceData[97][0][0]);
    //
    // democBarG.append('text')
    //     .attr('x', zoomedScaleX(traceData[97][1][0]) - 5 * zoomedInBarWidth)
    //     .attr('y', zoomedInHeight * 1 / 5)
    //     .text(traceData[97][1][0]);

    //console.log(democBarG);

    // create a slider
    var dataTime = d3.range(97, 116).map(function(d) {
        return new Date(1981 + (d - 97) * 2, 10, 3);
    });

    sliderTime = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365 * 2)
        .width(1000)
        .tickFormat(d3.timeFormat('%Y'))
        .tickValues(dataTime)
        .default(new Date(1981, 10, 3))
        .on('onchange', val => {
            var congInt = (parseInt(d3.timeFormat('%Y')(val)) - 1981) / 2 + 97;
            globalCong = congInt;
            if (!showState) {
                drawPoints(dataByCong[congInt]);
                drawTrace(congInt);
                //drawBars(traceData[congInt]);
            } else {
                drawTrace(congInt);
                drawPoints(dataByStateByCong[globalTitleG.select('text').text()][congInt]);
            }
        });

    var gTime = viz2mainG.append('g')
        .attr('transform', 'translate('+[40, viz2globalHeight - viz2paddings.bottom - viz2paddings.top + 40]+')');

    gTime.call(sliderTime);


});

circleGroup = viz2mainG.append('g');

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
        .merge(circles)
        .style('opacity', viz2Opacity);

    circles.on('click', function(d) {
        clearDetailView();
        showPersonDetail(d.icpsr);
    })
        .on('mouseover', function(d) {
            viz2tooltip1.show(d);

        })
        .on('mouseout', function(d) {
            viz2tooltip1.hide();
        });



    // update
    circles.transition()
        .duration(500)
        .attr('cx', function (d, i) {
            return viz2XScale(d.dim1);
        })
        .attr('cy', function (d, i) {
            return viz2YScale(d.dim2);
        })
        .attr('r', function (d, i) {
            if (d.chamber === 'President') return 7;
            return 3;
        })
        // Republicans(200), Democrats(100)
        .style('fill', function(d, i) {
            if (d.icpsr === '99912') return 'Sienna'; // trump
            else if (d.chamber === 'President') return 'gold';
            else if (d.party === '200') return '#d34444';
            else return '#4451D3';
        });

    // Update politician counts text
        // console.log(thatCongressData);
    politicianCountG.selectAll('text').remove();

    republicansNumbers = 0;
    democratsNumbers = 0;

    for (var i = 0; i < thatCongressData.length; i++) {
        var curRow = thatCongressData[i];
        if (curRow.party === '200') republicansNumbers += 1;
        else democratsNumbers += 1;
    }

    // politicianCountG.append('text')
    //     .attr('x', 0)
    //     .attr('y', 0)
    //     .text(function() {
    //         return "#republicans: " + republicansNumbers;
    //     })
    //     .attr("font-size", "0.8rem")
    //     .attr("fill", "#494949")
    //     .attr("font-family", "IBM Plex Mono");

    // politicianCountG.append('text')
    //     .attr('x', 0)
    //     .attr('y', 25)
    //     .text(function() {
    //         return "#democrats: " + democratsNumbers;
    //     })
    //     .attr("font-size", "0.8rem")
    //     .attr("fill", "#494949")
    //     .attr("font-family", "IBM Plex Mono");


    //console.log(circles);
}

//

let traceGroup = viz2mainG.append('g');
let repubTraceG = traceGroup.append('g');
let democTraceG = traceGroup.append('g');

// Generate trace path

// Overall line generator
var lineGenerator = d3.line()
    .curve(d3.curveCardinal);

var repubDataPoints = [];
var democDataPoints = [];

    // trace[0][0] - republican's median dim1 of 97th congress. trace[97][1] - median dim2 of 97th congress
function drawTrace(congInt) {
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
            return viz2XScale(traceData[congInt][0][0]);
        })
        .attr('cy', function (d, i) {
            return viz2YScale(traceData[congInt][0][1]);
        })
        .attr('r', function (d, i) {
            return 8;
        })
        // Republicans(200), Democrats(100)
        .style('fill', function(d, i) {
            return "#4451D3";
        });

    repubTraceG.selectAll('path').remove();
    var tempRepubDataPoints = allRepubDataPoints.slice(0, congInt - 97 + 1);
    var repubPathData = lineGenerator(tempRepubDataPoints);
    repubTraceG.append('path')
        .attr('d', repubPathData)
        .style('fill', 'none')
        .style('stroke', '#4451D3')
        .attr("stroke-width", 3);


/*
    repubDataPoints.push([xScale(thatTraceData[0][0]), yScale(thatTraceData[0][1])])
    //console.log(repubDataPoints);
    var repubPathData = lineGenerator(repubDataPoints);
    //console.log(repubPathData);
    repubTraceG.append('path')
        .attr('d', repubPathData)
        .style('fill', 'none')
        .style('stroke', 'steelblue')
        .attr("stroke-width", 2);
*/

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
            return viz2XScale(traceData[congInt][1][0]);
        })
        .attr('cy', function (d, i) {
            return viz2YScale(traceData[congInt][1][1]);
        })
        .attr('r', function (d, i) {
            return 8;
        })
        // Republicans(200), Democrats(100)
        .style('fill', function(d, i) {
            return "#d34444";
        });


    democTraceG.selectAll('path').remove();
    var tempDemocDataPoints = allDemocDataPoints.slice(0, congInt - 97 + 1);
    var democPathData = lineGenerator(tempDemocDataPoints);
    democTraceG.append('path')
        .attr('d', democPathData)
        .style('fill', 'none')
        .style('stroke', '#d34444')
        .attr("stroke-width", 3);
    /*
    democDataPoints.push([xScale(thatTraceData[1][0]), yScale(thatTraceData[1][1])])
    //console.log(democDataPoints);
    var democPathData = lineGenerator(democDataPoints);
    //console.log(democPathData);
    democTraceG.append('path')
        .attr('d', democPathData)
        .style('fill', 'none')
        .style('stroke', 'orange')
        .attr("stroke-width", 2);
    */
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
        .style('fill', '#4451D3');

    var democBar = democBarG.select('rect');

    democBar.transition()
        .duration(500)
        .attr('x', zoomedScaleX(thatTraceData[1][0]) - zoomedInBarWidth)
        .attr('y', zoomedInHeight * 1 / 4)
        .attr('width', zoomedInBarWidth)
        .attr('height', zoomedInHeight * 3 / 4)
        .style('fill', '#d34444');

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
            curObj['chamber'] = curRow.chamber;
            curObj['party'] = curRow.party;
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
var viz2tooltip1 = d3.tip()
    .attr('class', 'd3-tip tip1')
    .offset([-8, 0])
    .html(function(d) {
        var partyName = (d.party === '200') ? "Republicans" : "Democrats";
        return "<strong>" + d.name + " </strong>" + " (" + partyName + ")";
    });

// Tooltip2 is the tooltip for state selectors
var viz2tooltip2 = d3.tip()
    .attr('class', 'd3-tip tip2')
    .offset([0, 0])
    .html(function(d) {
        var abbr = abbrState(d.properties.name, 'abbr');
        return "<strong>" + abbr + " </strong>";
    });



// register tooltips
viz2svg.call(viz2tooltip1);
viz2svg.call(viz2tooltip2);

// set up the topojson
var viz2path = d3.geoPath();
//console.log(path);


    d3.json("lib/states-10m.json").then(function(topology) {
        //console.log('We are in state selector!');
        //console.log(topology);
        // default scale is 1000!
        var projection = d3.geoAlbersUsa().scale([280]);
        var path = d3.geoPath().projection(projection);
        var geojson = topojson.feature(topology, topology.objects.states).features;

        viz2stateG.selectAll("path")
            .data(geojson)
            .enter()

            .append('path')
            .attr('d', path)
            .attr('class', 'statesPath')
            .style('fill', '#292929')
            .on('mouseover', function(d) {
                viz2tooltip2.show(d);
                d3.select(this).style('fill', '#ffffff');
            })
            .on('mouseout', function(d) {
                viz2tooltip2.hide(d);
                d3.select(this).style('fill', '#292929');
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
                    drawTrace(congInt);
                } else {
                    //drawPoints(dataByCong[congInt]);
                    drawPoints(dataByCong[congInt]);
                    drawTrace(congInt);
                    drawBars(traceData[congInt]);
                }
            });
    });



// Button controls
var centroidsAreVisible = true;
var membersAreVisible = true;
var selectorIsVisible = true;

d3.selectAll('.toggleCentroid')
    .on('click', function() {
        if (centroidsAreVisible) {
            traceGroup.attr('visibility', 'hidden');
        } else {
            traceGroup.attr('visibility', 'visible');
        }
        centroidsAreVisible = !centroidsAreVisible;
    });

function setMembersTransparent() {
    viz2Opacity = 0.2;
    circleGroup.selectAll('circle').transition().duration(500).style('opacity', viz2Opacity);
}

function setMembersOpaque() {
    viz2Opacity = 1;
    circleGroup.selectAll('circle').transition().duration(500).style('opacity', viz2Opacity);
}



d3.selectAll('.toggleMemberDots')
    .on('click', function() {
        if (membersAreVisible) {
            //circleGroup.selectAll('circle').transition().duration(500).style('opacity', 0.2);
            circleGroup.attr('visibility', 'hidden');
        } else {
            circleGroup.attr('visibility', 'visible');
        }
        membersAreVisible = !membersAreVisible;
    });

d3.selectAll('.toggleSelector')
    .on('click', function() {
        if (selectorIsVisible == true) {
            viz2stateG.attr('visibility', 'hidden');
        } else {
            viz2stateG.attr('visibility', 'visible');
        }
        selectorIsVisible = !selectorIsVisible;
    });

