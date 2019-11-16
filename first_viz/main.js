// Setting up global width and length, and padding sizes
var globalWidth = 1200, globalHeight = 1000;
paddings = {top : 100, bottom : 20, left : 40, right : 20};

// create and select the global svg
var svg = d3.select("body")
    .append("svg")
    .attr('class', "mainSVG")
    .attr("width", globalWidth)
    .attr("height", globalHeight)
    .style("fill", "red");

// Create the main visualization group
var mainG = svg.append('g')
    .attr('transform', 'translate('+[paddings.left, paddings.top]+')');

// Create the zoomed-in visualization group
var zoomedInPos = {
    left: globalWidth / 2.5,
    top: paddings.top / 3,
};

var zoomedInG = svg.append('g')
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

// load the data and do the job
d3.csv('real_initial_data.csv', dataPreprocessor).then(function(dataset) {
    var original_data = dataset;

    console.log(original_data);
    // data processing: Find congress - party - median(dim1)

    // step1: Predefine two maps for republicans and democrats
    var democAll = {};
    var repubAll = {};
    var combinedAll = {};
    for (var i = 57; i <= 116; i++) {
        repubAll[i] = [];
        democAll[i] = [];
        combinedAll[i] = [];
    }

    // step2: Get Republicans(200) and Democrats(100)
    for (var i = 0; i < original_data.length; i++) {
        var curRow = original_data[i];
        var curCongress = curRow['congress'];
        if (curRow.party === "200") {
            repubAll[curCongress].push(curRow.dim1);
        } else {
            democAll[curCongress].push(curRow.dim1);
        }
        combinedAll[curCongress].push(curRow.dim1);
    }

    // step3: PreDefine the data we want
    let democData = [];
    let repubData = [];
    let combinedData = [];

    // step4: Calculate the medians
    for (var i = 57; i <= 116; i++) {
        // democrats
        democAll[i].sort();
        var tempDemoc = {};
        tempDemoc['congress'] = i;
        tempDemoc['median_dim1'] = d3.median(democAll[i]);
        democData.push(tempDemoc);

        // republicans
        repubAll[i].sort();
        var tempRepub = {};
        tempRepub['congress'] = i;
        tempRepub['median_dim1'] = d3.median(repubAll[i]);
        repubData.push(tempRepub);

        // combined
        combinedAll[i].sort();
        var tempCombined = {};
        tempCombined['congress'] = i;
        tempCombined['median_dim1'] = d3.median(combinedAll[i]);
        combinedData.push(tempCombined);
    }

    console.log(democData);
    console.log(repubData);
    console.log(combinedData);

    // create the X and Y scale for the major visualization
    var xScale = d3.scaleLinear()
        .domain([1900, 2019])
        .range([0, globalWidth - paddings.left - paddings.right]);

    var yScale = d3.scaleLinear()
        .domain([-0.6, 0.7])
        .range([globalHeight - paddings.top - paddings.bottom, 0]);

    // create the X and Y axis for the major visualization
    var xAxis = d3.axisBottom()
        .scale(xScale);

    var yAxis = d3.axisLeft()
        .scale(yScale);

    // Set up the points data for line generators:


    var democPoints = [];
    var repubPoints = [];
    var combinedPoints = [];

    for (var i = 57; i <= 116; i += 1) {

        var curYear = (i - 57) * 2  + 1900;

        var tempDemoc = [];
        tempDemoc.push(xScale(curYear));
        tempDemoc.push(yScale(democData[i - 57]['median_dim1']));
        democPoints.push(tempDemoc);

        var tempRepub = [];
        tempRepub.push(xScale(curYear));
        tempRepub.push(yScale(repubData[i - 57]['median_dim1']));
        repubPoints.push(tempRepub);

        var tempCombined = [];
        tempCombined.push(xScale(curYear));
        tempCombined.push(yScale(combinedData[i - 57]['median_dim1']));
        combinedPoints.push(tempCombined);
    }

    // ------ Get three paths' data: -------

    var democPathData = lineGenerator(democPoints);
        // :>

    var repubPathData = lineGenerator(repubPoints);
        // :p

    var combinedPathData = lineGenerator(combinedPoints);


    // Draw three lines(paths)
    var pathGroup = mainG.append('g');


    var democPath = pathGroup.append('path')
        .attr('class', 'path main')
        .attr('d', democPathData)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr("stroke-width", 3);

    var repubPath = pathGroup.append('path')
        .attr('class', 'path main')
        .attr('d', repubPathData)
        .style('fill', 'none')
        .style('stroke', 'red')
        .attr("stroke-width", 3);

    var combinedPath = pathGroup.append('path')
        .attr('class', 'path main')
        .attr('d', combinedPathData)
        .style('fill', 'none')
        .style('stroke', 'grey')
        .attr("stroke-width", 3);


    // draw two axes for our main visualization
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

    // Create the elements that tooltips use
    var tooltipGroup = mainG.append('g')
        .attr('class', 'tooltips');

    var democCircles = tooltipGroup.append('g')
        .selectAll('circle')
        .data(democData)
        .enter()
        .append('circle')
        .attr("class", "democDots")
        .attr('cx', function(d) {
            var curIdx = d['congress'] - 57;
            return democPoints[curIdx][0];
        })
        .attr('cy', function(d) {
            var curIdx = d['congress'] - 57;
            return democPoints[curIdx][1];
        })
        .attr('r', 8)
        .style('fill', 'steelblue')
        .style('opacity', 0);

    var repubCircles = tooltipGroup.append('g')
        .selectAll('circle')
        .data(repubData)
        .enter()
        .append('circle')
        .attr("class", "repubDots")
        .attr('cx', function(d) {
            var curIdx = d['congress'] - 57;
            return repubPoints[curIdx][0];
        })
        .attr('cy', function(d) {
            var curIdx = d['congress'] - 57;
            return repubPoints[curIdx][1];
        })
        .attr('r', 8)
        .style('fill', 'red')
        .style('opacity', 0);

    var combinedCircles = tooltipGroup.append('g')
        .selectAll('circle')
        .data(combinedData)
        .enter()
        .append('circle')
        .attr("class", "combinedDots")
        .attr('cx', function(d) {
            var curIdx = d['congress'] - 57;
            return combinedPoints[curIdx][0];
        })
        .attr('cy', function(d) {
            var curIdx = d['congress'] - 57;
            return combinedPoints[curIdx][1];
        })
        .attr('r', 8)
        .style('fill', 'grey')
        .style('opacity', 0);


    // the hover function that shows/hides tooltips for three lines
    var allCircles = tooltipGroup.selectAll('circle');

            /*
            allCircles.on('mouseover', function(d) {
                var curIdx = d['congress'] - 57;
                var tempX = combinedPoints[curIdx][0];
                var circlesInLine = [];
                allCircles.each(function(d, i) {
                    if (d3.select(this).attr('cx') == tempX) {
                        circlesInLine.push(this);
                    }
                });
                //console.log(circlesInLine);
                for (var i = 0; i < circlesInLine.length; i++) {
                    var curCircle = circlesInLine[i];

                    if (d3.select(curCircle).attr('class') === 'democDots') {
                        tooltip1.show(democData[curIdx], curCircle);
                    } else if (d3.select(curCircle).attr('class') === 'repubDots') {
                        tooltip2.show(repubData[curIdx], curCircle);
                    } else {
                        tooltip3.show(combinedData[curIdx], curCircle);
                    }
                }
            })
                .on('mouseout', function(d) {
                    tooltip1.hide();
                    tooltip2.hide();
                    tooltip3.hide();
                });
            */

    // set up the zoomed-in scale
    var zoomedScaleX = d3.scaleLinear()
        .range([0, zoomedInWidth]);

    var zoomedScaleY = d3.scaleLinear()
        .range([zoomedInHeight, 0]);


    // add a overall tooltips for selection

    verticalLineG = mainG.append('g');

    verticalLineG.append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", globalHeight - paddings.top - paddings.bottom)
        .attr("stroke-width", 4)
        .attr("stroke", "green");

    // get the svg absolute position
    var svgPosRect = document.getElementsByClassName("mainSVG").item(0).getBoundingClientRect();
    console.log(svgPosRect);

    d3.select('body').on('mousemove', function() {
        var xPos = d3.mouse(this)[0] - svgPosRect.x - paddings.left + 2;

        verticalLineG.select('line')
            .attr("transform", function() {
                var deltaX = xPos;
                return "translate(" + deltaX + ",0)";
            });

        var curXPosToMainG = d3.mouse(this)[0] - svgPosRect.x - paddings.left;

        var closestIdx = 0;
        var minVal = 10000;
        console.log(combinedPoints);
        for (var i = 0; i < combinedPoints.length; i++) {
            var delta = Math.abs(combinedPoints[i][0] - curXPosToMainG);
            if (delta < minVal) {
                minVal = delta;
                closestIdx = i;
            }
        }

        var tempX = combinedPoints[closestIdx][0];
        var circlesInLine = [];
        allCircles.each(function(d, i) {
            if (d3.select(this).attr('cx') == tempX) {
                circlesInLine.push(this);
            }
        });

        for (var i = 0; i < circlesInLine.length; i++) {
            var curCircle = circlesInLine[i];

            if (d3.select(curCircle).attr('class') === 'democDots') {
                tooltip1.show(democData[closestIdx], curCircle);
            } else if (d3.select(curCircle).attr('class') === 'repubDots') {
                tooltip2.show(repubData[closestIdx], curCircle);
            } else {
                tooltip3.show(combinedData[closestIdx], curCircle);
            }
        }

    });





    // Set up the brush
    var brush = d3.brushX()
        .extent([[0, 0], [globalWidth - paddings.right, globalHeight - 150]])
        .on("brush", function (d) {
            var curStartYearIdx = Math.ceil(d3.event.selection[0] / everyYearPixel);

            // Set the domain of zoomedIn scales
            zoomedScaleX.domain([curStartYearIdx, curStartYearIdx + yearSpan]);
            zoomedScaleY.domain([-0.25, 0.4]);

            // var pathData for zoomed-in viz
            var zoomedInPoints = [];
            for (var s = curStartYearIdx; s < (curStartYearIdx + yearSpan); s += 2) {
                var tempCombined = [];
                var congIdx = Math.floor(s / 2);
                tempCombined.push(zoomedScaleX(s));
                // console.log(congIdx);
                tempCombined.push(zoomedScaleY(combinedData[congIdx]['median_dim1']));
                zoomedInPoints.push(tempCombined);
                // console.log(zoomedInPoints);
            }
            var zoomedInPathData = lineGenerator(zoomedInPoints);

            // clear path
            d3.select('.path.zoomed').remove();
            // draw zoomed-in path
            zoomedInPath = zoomedInG.append('path')
                .attr('class', 'path zoomed')
                .attr('d', zoomedInPathData)
                .style('fill', 'none')
                .style('stroke', 'orange')
                .attr("stroke-width", 1);
        });


    // append the brush effect
    mainG.append('g')
        .attr('class', 'brush')
        .call(brush)
        .call(brush.move, [0, yearSpanPixel]);

    // fix the size of brush and remove the crosshair cursor
        // removes handle to resize the brush
    d3.selectAll('.brush>.handle').remove();
        // removes crosshair cursor
    d3.selectAll('.brush>.overlay').remove();

});



// Overall line generator
var lineGenerator = d3.line()
    .curve(d3.curveCardinal);

// Set up the year-span we are brushing upon
var yearSpan = 16;
var everyYearPixel = (globalWidth - paddings.left - paddings.right) / (2019 - 1900 + 1);
var yearSpanPixel = yearSpan * everyYearPixel;

// Set up the place holder for the path that we will use in zoomed-in view.
var zoomedInPath = zoomedInG.append('path')


// Initialize tooltips
var tooltip1 = d3.tip()
    .attr('class', 'd3-tip tip1')
    .offset([-12, 0])
    .html(function(d) {
        return "<strong>Congress:</strong>" + d.congress + "  <strong>median:</strong>" + d.median_dim1;
    });

var tooltip2 = d3.tip()
    .attr('class', 'd3-tip tip2')
    .offset([-12, 0])
    .html(function(d) {
        return "<strong>Congress:</strong>" + d.congress + "  <strong>median:</strong>" + d.median_dim1;
    });

var tooltip3 = d3.tip()
    .attr('class', 'd3-tip tip3')
    .offset([-12, 0])
    .html(function(d) {
        return "<strong>Congress:</strong>" + d.congress + "  <strong>median:</strong>" + d.median_dim1;
    });

// register tooltips
svg.call(tooltip1);
svg.call(tooltip2);
svg.call(tooltip3);

// create the data preprocessor
function dataPreprocessor(row) {
    return {
        'congress': row['congress'],
        'chamber': row['chamber'],
        'icpsr': row['icpsr'],
        'party': row['party_code'],
        'name': row['bioname'],
        'dim1': row['nominate_dim1']
    };
}


// a global variable that trakcs the active map type
var activeButtonType = 'brushing_on';

d3.selectAll('.btn-group > .btn.btn-secondary')
    .on('click', function() {
        var newButtonType = d3.select(this).attr('data-type');

        d3.selectAll('.btn.btn-secondary.active').classed('active', false);

        cleanUpMap(activeButtonType);
        showOnMap(newButtonType);

        activeButtonType = newButtonType;
    });

function cleanUpMap(type) {
    switch(type) {
        case 'cleared':
            break;
        case 'brushing_on':
            zoomedInG.attr('visibility', 'hidden');
            d3.select('.brush').attr('visibility', 'hidden');
            break;
    }
}

function showOnMap(type) {
    switch (type) {
        case 'cleared':
            break;
        case 'brushing_on':
            zoomedInG.attr('visibility', 'visible');
            d3.select('.brush').attr('visibility', 'visible');
            break;
    }
}

function getNodePos(el)
{
    var body = d3.select('body').node();

    for (var lx = 0, ly = 0;
         el != null && el != body;
         lx += (el.offsetLeft || el.clientLeft), ly += (el.offsetTop || el.clientTop), el = (el.offsetParent || el.parentNode))
        ;
    return {x: lx, y: ly};
}
