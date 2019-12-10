// Setting up global width and length, and padding sizes

//let pol2globalWidth = $('#politician2Place').width, pol2globalHeight = $('#politician2Place').height;
let pol2globalWidth = screen.width * 0.55, pol2globalHeight = screen.height * 1.2;
pol2paddings = {top : 50, bottom : 50, left : 50, right : 20};

// create and select the global svg
let pol2svg = d3.select(".politician2Place")
    .append("svg")
    .attr("width", pol2globalWidth)
    .attr("height", pol2globalHeight);

// Create the main visualization group
let pol2mainG = pol2svg.append('g')
    .attr('transform', 'translate('+[pol2paddings.left, pol2paddings.top]+')');

// Create the group for that person data
let personG = pol2mainG.append('g')
    .attr('transform', function(){
        var tempX = pol2globalWidth / 8;
        var tempY = pol2globalHeight / 10;
        return 'translate('+[tempX, tempY]+')'
    });


// Set color used for yea and nay
var yeaColor = '#4553E2';
var nayColor = '#D34444';


// create legends
let legendG = pol2mainG.append('g')
    .attr('transform', function(){
        var tempX = pol2globalWidth  * 2 / 4;
        var tempY = pol2paddings.top * 3.5;
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
    .attr('class', 'legend-text')
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
    .attr('class', 'legend-text')
    .text('Vote followed the trend of the party');

var mainUnitG = pol2mainG.append('g')
    .attr('transform', function(){
        var tempX = 0;
        var tempY = pol2globalHeight * 3 / 4;
        return 'translate('+[tempX, tempY]+')'
    });

// subgroup from mainUnitG
var unitsG = mainUnitG.append('g');
var labelG = mainUnitG.append('g');
var percentageG = mainUnitG.append('g')
    //.attr('visibility', 'hidden');
    .attr('visibility', 'visible');


var lineChartG = pol2mainG.append('g')
    //.attr('visibility', 'hidden');
    .attr('visibility', 'visible');


// load the data and do the job
Promise.all([
    d3.csv('data/politician2/10713Trend.csv', dataPreprocessorForFigure),
    d3.csv('data/politician2/rollcalls.csv', dataPreprocessorForBills),
    d3.csv('data/viz1/real_initial_data.csv', dataPreprocessor)
])
.then(function(dataset) {
    var original_data = dataset[0];
    //console.log(original_data);

    // nest rollcallData
    var rollcallData = dataset[1];
    //console.log(rollcallData);

    var billsByCongress = d3.nest()
        .key(function (d) {
            return d.congress;
        })
        .entries(rollcallData);


    //console.log(billsByCongress);



    // nest by congress
    var votesByCongress = d3.nest()
        .key(function (d) {
            return d.congress;
        })
        .entries(original_data);

    //console.log(votesByCongress);

    // second nest by supportAgainst
    for (var i = 0; i < votesByCongress.length; i++) {
        var curObj = votesByCongress[i];
        curObj.values = d3.nest()
            .key(function (d) {
                return d.supportAgainst;
            })
            .entries(curObj.values);
    }
    //console.log(votesByCongress);

    // Set up a place holder for text
    var textG = labelG.append('g')
        .attr('transform', function(){
            var tempX = pol2globalWidth / 6;
            var tempY = -pol2globalHeight / 2.1;
            return 'translate('+[tempX, tempY]+')';
        });


    // draw rectangles

    var unitWidth = 2;
    var unitGap = 1;
    var unitPerRow = 12;
    var selectedWith = 4 * unitWidth;
    var prevColor;

    // scales used for line chart

    // reposition the lineChartG
    var xOffset = (pol2globalWidth / (votesByCongress.length + 10)) / 2; // only take half of the width of a bar as offset

    var xScale = d3.scaleLinear()
        .domain([0, votesByCongress.length - 1])
        .range([xOffset, pol2globalWidth - pol2paddings.right - pol2paddings.left - xOffset]);

    var yScale = d3.scaleLinear()
        .domain([50, 100])
        .range([-100, -pol2globalHeight * 2 / 3]);

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
            .attr('x', 0)
            .attr('class','legend-text')
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
        // curPercentageG.append('text')
        //     .attr('x', -2)
        //     .attr('class','percentage-text')
        //     //.attr('y', -(allData.length / unitPerRow * (unitWidth + unitGap) + 10))
        //     .attr('y', function() {
        //         //console.log(yScale(percentage));
        //         return yScale(percentage * 7.1 / 8) - 24 ;
        //     })
        //     .text(function() {
        //         return percentage.toString(10) + "%";
        //     });

        curPercentageG.append('rect')
            .attr('x', -2)
            .attr('y', function() {
                //console.log(yScale(percentage));
                return yScale(percentage * 7 / 8) - 35 ;
            })
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('fill', '#141414')
            .attr('height', '1rem')
            .attr('width', '2.5rem');

        curPercentageG.append('text')
            .attr('x', 2)
            .attr('class','percentage-text')
            .attr('fill', '#FFFFFF')
            //.attr('y', -(allData.length / unitPerRow * (unitWidth + unitGap) + 10))
            .attr('y', function() {
                //console.log(yScale(percentage));
                return yScale(percentage * 7 / 8) - 24 ;
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
                //console.log(d);

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
                //console.log(d);
                textG.selectAll('text').remove();

                textG.append('text')
                    .attr('x', 0)
                    .attr('y', 0)
                    .text(function() {
                        return "This bill took place in the " +  d.chamber + " of the " + d.congress + "th congress on day " + d.date + ".";
                    });

                textG.append('text')
                    .attr('x', 0)
                    .attr('y', 30)
                    .text(function() {
                        var temp = d.billNumber ? d.billNumber : 'unknown';
                        return "The roll number is " + d.rollnumber + " and the bill number is " + d.billNumber;
                    });

                textG.append('text')
                    .attr('x', 0)
                    .attr('y', 60)
                    .text(function() {
                        return "This bill has " + d.yeaCount + " yeas and " + d.nayCount + " nays.";
                    });
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

        curXOffset += pol2globalWidth / (votesByCongress.length + 1);
    }



    // draw something about that person

    var curIcpsr = '10713';

    var personData;

    for (var i = 0; i < dataset[2].length; i++) {
        var curRow = dataset[2][i];
        if (curRow.icpsr === curIcpsr) {
            personData = curRow;
            break;
        }
    }

    var pictureSize = 90;

    personG.append('svg:image')
        .attr("xlink:href", function() {
            var patchedIcpsr = ("00000" + curIcpsr).slice(-6);
            return "https://voteview.com/static/img/bios/" + patchedIcpsr + ".jpg";
        })
        .attr('width', pictureSize)
        .attr('height', pictureSize)
        .attr('transform', function() {
            var x = -100;
            var y = 50;
            return 'translate(' + [x, y] +')';
        });

    var newPersonG = personG.append('g');

    newPersonG.attr('transform', function(){
        var tempX = pictureSize * 0.3;
        var tempY = -100;
        return 'translate('+[tempX, tempY]+')';
    });

    var text = newPersonG.selectAll("text")
        .data([personData])
        .enter();

    text.exit().remove();

    text.append('text')
        .attr('x', 5)
        .attr('y', 180)
        .attr('class', 'zoomedInText')
        .text(function(d) {
            var str = d.name;
            return str;
        });

    text.append('text')
        .attr('x', 5)
        .attr('y', 180 + 25)
        .attr('class', 'zoomedInText')
        .text(function(d) {
            //console.log('here');
            //console.log(d);
            return "Ideological Score: " + (d.dim1 === "" ? "Unknown" : d.dim1);
        })
        .attr("font-weight", 700);

    text.append('text')
        .attr('x', 5)
        .attr('y', 180 + 50)
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



    // draw line chart

    lineChartG
        .attr('transform', function(){
            var tempX = 0;
            var tempY = pol2globalHeight * 7 / 8;
            return 'translate('+[tempX, tempY]+')'
        });


    lineChartG.append('path')
        .datum(lineChartData)
        .attr("fill", "none")
        .attr("stroke", "#141414")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d) {
                //console.log(xScale(d.idx));
                return xScale(d.idx) * 1.03;
            })
            .y(function(d) {
                //console.log(yScale(d.percentage))
                return yScale(d.percentage) * 1.05;
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
        if (lineVisible == true) {
            lineChartG.selectAll('path').transition().duration(500).style('opacity', 0);
            percentageG.selectAll('text').transition().duration(500).style('opacity', 0);
            //lineChartG.attr('visibility', 'hidden');
            //percentageG.attr('visibility', 'hidden');
        } else {
            lineChartG.selectAll('path').transition().duration(500).style('opacity', 1);
            percentageG.selectAll('text').transition().duration(500).style('opacity', 1);
            //lineChartG.attr('visibility', 'visible');
            //percentageG.attr('visibility', 'visible');
        }
        lineVisible = !lineVisible;
    });
