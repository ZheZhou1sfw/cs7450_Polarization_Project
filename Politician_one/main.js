// Setting up global width and length, and padding sizes
let globalWidth = 1200, globalHeight = 1000;
paddings = {top : 50, bottom : 50, left : 50, right : 20};

// create and select the global svg
let svg = d3.select("body")
    .append("svg")
    .attr("width", globalWidth)
    .attr("height", globalHeight);

// Create the main visualization group
let mainG = svg.append('g')
    .attr('transform', 'translate('+[paddings.left, paddings.top]+')');

// Create the group for that person data
let personG = mainG.append('g')
    .attr('transform', function(){
        var tempX = globalWidth / 8;
        var tempY = globalHeight / 10;
        return 'translate('+[tempX, tempY]+')'
    });


// Set color used for yea and nay
var yeaColor = 'blue';
var nayColor = 'red';


// create legends
let legendG = mainG.append('g')
    .attr('transform', function(){
        var tempX = globalWidth  * 2 / 3;
        var tempY = paddings.top;
        return 'translate('+[tempX, tempY]+')'
    });

legendG.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 8)
    .attr('height', 8)
    .style('fill', nayColor);

legendG.append('text')
    .attr('x', 12)
    .attr('y', 8)
    .text('Vote went against the trend of the party');

legendG.append('rect')
    .attr('x', 0)
    .attr('y', 15)
    .attr('width', 8)
    .attr('height', 8)
    .style('fill', yeaColor);

legendG.append('text')
    .attr('x', 12)
    .attr('y', 8 + 15)
    .text('Vote followed the trend of the party');

var mainUnitG = mainG.append('g')
    .attr('transform', function(){
        var tempX = 0;
        var tempY = globalHeight * 3 / 4;
        return 'translate('+[tempX, tempY]+')'
    });

// subgroup from mainUnitG
var unitsG = mainUnitG.append('g');
var labelG = mainUnitG.append('g');
var percentageG = mainUnitG.append('g')
    .attr('visibility', 'hidden');


var lineChartG = mainG.append('g')
    .attr('visibility', 'hidden');

// load the data and do the job
Promise.all([
    d3.csv('20304Trend.csv', dataPreprocessorForFigure),
    d3.csv('rollcalls.csv', dataPreprocessorForBills),
    d3.csv('real_initial_data.csv', dataPreprocessor)
])
    .then(function(dataset) {
        var original_data = dataset[0];
        console.log(original_data);

        // nest rollcallData
        var rollcallData = dataset[1];
        console.log(rollcallData);

        var billsByCongress = d3.nest()
            .key(function (d) {
                return d.congress;
            })
            .entries(rollcallData);


        console.log(billsByCongress);



        // nest by congress
        var votesByCongress = d3.nest()
            .key(function (d) {
                return d.congress;
            })
            .entries(original_data);

        console.log(votesByCongress);

        // second nest by supportAgainst
        for (var i = 0; i < votesByCongress.length; i++) {
            var curObj = votesByCongress[i];
            curObj.values = d3.nest()
                .key(function (d) {
                    return d.supportAgainst;
                })
                .entries(curObj.values);
        }
        console.log(votesByCongress);

        // Set up a place holder for text
        var textG = labelG.append('g')
            .attr('transform', function(){
                var tempX = globalWidth / 3;
                var tempY = globalHeight / 8;
                return 'translate('+[tempX, tempY]+')'
            });


        // draw rectangles

        var unitWidth = 2;
        var unitGap = 1;
        var unitPerRow = 15;
        var selectedWith = 4 * unitWidth;
        var prevColor;

        // scales used for line chart

        // reposition the lineChartG
        var xOffset = (globalWidth / (votesByCongress.length + 10)) / 2; // only take half of the width of a bar as offset

        var xScale = d3.scaleLinear()
            .domain([0, votesByCongress.length])
            .range([xOffset, globalWidth - paddings.right - paddings.left - xOffset]);

        var yScale = d3.scaleLinear()
            .domain([50, 100])
            .range([-100, -globalHeight * 2 / 3]);

        // create the data that will be used in drawing the line chart
        var lineChartData = []; // lineChartData[0] = {idx : 0, percentage: 50}

        var curXOffset = 0;
        for (var i = 0; i < votesByCongress.length; i++) {
            var curG = unitsG.append('g')
                .attr('transform', function(){
                    var tempX = curXOffset;
                    var tempY = 0;
                    return 'translate('+[tempX, tempY]+')'
                });


            var curTextG = labelG.append('g')
                .attr('transform', function(){
                    var tempX = curXOffset;
                    var tempY = 0;
                    return 'translate('+[tempX, tempY]+')'
                });

            // append a label
            curTextG.append('text')
                .attr('x', 3)
                .attr('y', 30)
                .text(function() {
                    return votesByCongress[i].key + "th";
                })

            var curPercentageG = percentageG.append('g')
                .attr('transform', function(){
                    var tempX = curXOffset;
                    var tempY = 0;
                    return 'translate('+[tempX, tempY]+')'
                });



            var supportThatCong = votesByCongress[i].values[0].values;
            var againstThatCong = votesByCongress[i].values[1].values;
            var allData = supportThatCong.concat(againstThatCong);



            var percentage = supportThatCong.length / allData.length * 100;
            percentage = percentage.toFixed(1);
            lineChartData.push({percentage: percentage, idx: i});

            // append a percentage
            curPercentageG.append('text')
                .attr('x', 3)
                //.attr('y', -(allData.length / unitPerRow * (unitWidth + unitGap) + 10))
                .attr('y', function() {
                    console.log(yScale(percentage));
                    return yScale(percentage * 7.1 / 8) ;
                })
                .text(function() {
                    return percentage.toString(10) + "%";
                });


            curG.selectAll('rect')
                .data(allData)
                .enter()
                .append('rect')
                .attr('x', function(d, i) {
                    return (i % unitPerRow) * (unitWidth + unitGap);
                })
                .attr('y', function(d, i) {
                    return -Math.floor(i / unitPerRow) * (unitWidth + unitGap);
                })
                .attr('width', unitWidth)
                .attr('height', unitWidth)
                .style('fill', function(d) {
                    if (d.supportAgainst === '1') return yeaColor;
                    else return nayColor;
                })
                .on('click', function(d) {
                    console.log(d);

                    // search
                    var target;
                    for (var i = 0; i < billsByCongress[d.congress - '97'].values.length; i++) {
                        var curRow = billsByCongress[d.congress - '97'].values[i];
                        if (curRow.rollnumber === d.rollnumber) {
                            target = curRow;
                            break;
                        }
                    }
                    d = target;
                    console.log(d);
                    textG.selectAll('text').remove();

                    textG.append('text')
                        .attr('x', 0)
                        .attr('y', 0)
                        .text(function() {
                            return "This bill took place in the " +  d.chamber + " of the " + d.congress + "th congress on day " + d.date + ".";
                        })

                    textG.append('text')
                        .attr('x', 0)
                        .attr('y', 30)
                        .text(function() {
                            var temp = d.billNumber ? d.billNumber : 'unknown';
                            return "The roll number is " + d.rollnumber + " and the bill number is " + d.billNumber;
                        })

                    textG.append('text')
                        .attr('x', 0)
                        .attr('y', 60)
                        .text(function() {
                            return "This bill has " + d.yeaCount + " yeas and " + d.nayCount + " nays.";
                        })
                    if (d.description !== "") {
                        textG.append('text')
                            .attr('x', 0)
                            .attr('y', 90)
                            .text(function () {
                                return "About this bill: " + d.description;
                            })
                    }
                })
                .on('mouseover', function() {
                    d3.select(this).attr('width', selectedWith);
                    d3.select(this).attr('height', selectedWith);
                    prevColor = d3.select(this).style('fill');
                    d3.select(this).style('fill', 'gold');
                })
                .on('mouseout', function() {
                    d3.select(this).attr('width', unitWidth);
                    d3.select(this).attr('height', unitWidth);
                    d3.select(this).style('fill', prevColor);
                })
            ;

            curXOffset += globalWidth / (votesByCongress.length + 1);
        }



        // draw something about that person

        var curIcpsr = '20304';

        var personData;

        for (var i = 0; i < dataset[2].length; i++) {
            var curRow = dataset[2][i];
            if (curRow.icpsr === curIcpsr) {
                personData = curRow;
                break;
            }
        }

        var pictureSize = 150;

        personG.append('svg:image')
            .attr("xlink:href", function() {
                var patchedIcpsr = ("00000" + curIcpsr).slice(-6);
                return "https://voteview.com/static/img/bios/" + patchedIcpsr + ".jpg";
            })
            .attr('width', pictureSize)
            .attr('height', pictureSize);


        personG.attr('transform', function(){
            var tempX = 0;
            var tempY = pictureSize;
            return 'translate('+[tempX, tempY]+')'
        });

        var text = personG.selectAll("text")
            .data([personData])
            .enter();

        text.exit().remove();

        text.append('text')
            .attr('x', 5)
            .attr('y', 180)
            .attr('class', 'zoomedInText')
            .text(function(d) {
                var str = "Name: " + d.name;
                return str;
            })
            .attr("font-size", "20px")
            .attr("fill", 'steelblue');

        text.append('text')
            .attr('x', 5)
            .attr('y', 180 + 25)
            .attr('class', 'zoomedInText')
            .text(function(d) {
                console.log('here');
                console.log(d);
                return "Dimension1 Ideology Score: " + (d.dim1 === "" ? "Unknown" : d.dim1);
            })
            .attr("font-size", "20px")
            .attr("fill", 'steelblue');

        text.append('text')
            .attr('x', 5)
            .attr('y', 180 + 50)
            .attr('class', 'zoomedInText')
            .text(function(d) {
                return "Party: " + ((d.party === '200') ? 'Republican' : 'Democratic');
            })
            .attr("font-size", "20px")
            .attr("fill", 'steelblue');

        text.append('text')
            .attr('x', 5)
            .attr('y', 180 + 75)
            .attr('class', 'zoomedInText')
            .text(function(d) {
                return "Chamber: " + d.chamber;
            })
            .attr("font-size", "20px")
            .attr("fill", 'steelblue');


        // draw line chart

        lineChartG
            .attr('transform', function(){
                var tempX = 0;
                var tempY = globalHeight * 7 / 8;
                return 'translate('+[tempX, tempY]+')'
            });

        console.log(billsByCongress);

        console.log(lineChartData);

        lineChartG.append('path')
            .datum(lineChartData)
            .attr("fill", "none")
            .attr("stroke", "DarkCyan")
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(function(d) {
                    //console.log(xScale(d.idx));
                    return xScale(d.idx);
                })
                .y(function(d) {
                    //console.log(yScale(d.percentage))
                    return yScale(d.percentage);
                })
            )
    });




// create the data preprocessor for two specific figure
function dataPreprocessorForFigure(row) {
    return {
        'congress': row['congress'],
        'chamber': row['chamber'],
        'icpsr': row['icpsr'],
        'party': row['party'],
        'supportAgainst': row['supportAgainst'],
        'rollnumber': row['rollnumber']
    };
}

// create the data preprocessor for two specific figure
function dataPreprocessorForBills(row) {
    return {
        'congress': row['congress'],
        'chamber': row['chamber'],
        'yeaCount': row['yeacount'],
        'nayCount': row['naycount'],
        'date': row['date'],
        'rollnumber': row['rollnumber'],
        'billNumber': row['billnumber'],
        'description': row['dtldesc']
    };
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

var lineVisible = false;

// button function
d3.selectAll('.toggleLineChart')
    .on('click', function() {
        if (lineVisible) {
            lineChartG.attr('visibility', 'hidden');
            percentageG.attr('visibility', 'hidden');
        } else {
            lineChartG.attr('visibility', 'visible');
            percentageG.attr('visibility', 'visible');
        }
        lineVisible = !lineVisible;
    });