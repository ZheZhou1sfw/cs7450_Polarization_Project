// Setting up global width and length, and padding sizes
var globalWidth = 1500, globalHeight = 800;
paddings = {top : 100, bottom : 55, left : 60, right : 20};

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



// Create a pre-rendered rectangle frame for zoomed in viz
var zoomedInWidth = globalWidth / 5;
var zoomedInHeight = globalHeight - paddings.top - paddings.bottom;

var zoomedInPos = {
    left: globalWidth - paddings.right - zoomedInWidth,
    top: paddings.top,
};

// Create the zoomed-in visualization group
var zoomedInG = svg.append('g')
    .attr('transform', 'translate('+[zoomedInPos.left, zoomedInPos.top]+')')
    //.attr('visibility', 'hidden');
    .attr('visibility', 'visible');

var zoomedInFrame = zoomedInG.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', zoomedInWidth)
    .attr('height', zoomedInHeight)
    .style('fill', '#e9fdbb');


// load the data and do the job
d3.csv('real_initial_data.csv', dataPreprocessor).then(function(dataset) {
    var original_data = dataset;
    console.log(original_data);

    var autocompleteData = compressData(original_data);
    console.log(autocompleteData);

    /*
    // initialize the search engine with fuse.js
    var fuseOptions = {
        shouldSort: true,
        threshold: 0.2,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 4,
        keys: [
            "name"
        ]
    };
    fuse = new Fuse(original_data, fuseOptions); // "list" is the item array
    //console.log(fuse.search("Hillary"));
    */



    function showPersonDetail(icpsr) {

        // show image


        var images = zoomedInG.selectAll("image")
            .data([0]) // number of images, [0] for 1, [0, 0] for 2
            .enter();

        images.exit().remove();

        images.append('svg:image')
            .attr("xlink:href", function() {
                var patchedIcpsr = ("00000" + icpsr).slice(-6);
                //console.log("https://voteview.com/static/img/bios/" + patchedIcpsr + ".jpg");
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
                console.log(d);
                var intCongArr = [];
                for (var i = 0; i < d.congress.length; i++) intCongArr.push(parseInt(d.congress[i]));
                var minCong = d3.extent(intCongArr)[0].toString();
                var maxCong = d3.extent(intCongArr)[1].toString();
                if (maxCong == '116' || d.name === "TRUMP, Donald John") maxCong = " to now";
                else maxCong = " ~ " + maxCong;
                var str = "Congress: " + minCong + maxCong;
                console.log(str);
                return str;
            })
            .attr("font-size", "20px")
            .attr("fill", 'steelblue');

        text.append('text')
            .attr('x', 5)
            .attr('y', 180 + 50)
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
            .attr('y', 180 + 75)
            .attr('class', 'zoomedInText')
            .text(function(d) {
                return "Party: " + ((d.party === '200') ? 'Republican' : 'Democratic');
            })
            .attr("font-size", "20px")
            .attr("fill", 'steelblue');

        text.append('text')
            .attr('x', 5)
            .attr('y', 180 + 100)
            .attr('class', 'zoomedInText')
            .text(function(d) {
                return "Chamber: " + d.chamber;
            })
            .attr("font-size", "20px")
            .attr("fill", 'steelblue');



        // show a dot in the main viz that emphesizes this person
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
                return 8;
            })
            .style('opacity', function(d) {
                if (d.chamber === 'President') return 1;
                else return 1;
            })
            .style('fill', function(d) {
                return 'white';
                /*
                if (d.chamber === 'President') return 'gold'; // president
                else if (d.party === '200') return 'red'; // republican
                else return 'blue'; // democrats

                 */
            })
    }

    // function that clears out the detailed view
    function clearDetailView() {
        zoomedInG.selectAll("image").remove();
        zoomedInG.selectAll("text").remove();
        personDotsG.selectAll("circle").remove();
    }


    // Register the autocomplete feature
    new autoComplete({
        data: {                              // Data src [Array, Function, Async] | (REQUIRED)
            src: async () => {
                // API key token
                //const token = "this_is_the_API_token_number";
                // User search query
                const query = document.querySelector("#autoComplete").value;
                // Fetch External Data Source
                //const source = autocompleteData;

                // Format data into JSON
                //const data = await source.json();
                // Return Fetched data
                return autocompleteData;
            },
            key: ["name"],
            cache: false
        },
        /*
        query: {                               // Query Interceptor               | (Optional)
            manipulate: (query) => {
                return query.replace("pizza", "burger");
            }
        },

         */
        sort: (a, b) => {                    // Sort rendered results ascendingly | (Optional)
            if (a.match < b.match) return -1;
            if (a.match > b.match) return 1;
            return 0;
        },
        placeHolder: "Enter a name",     // Place Holder text                 | (Optional)
        selector: "#autoComplete",           // Input field selector              | (Optional)
        threshold: 3,                        // Min. Chars length to start Engine | (Optional)
        debounce: 300,                       // Post duration for engine to start | (Optional)
        searchEngine: "strict",              // Search Engine type/mode           | (Optional)
        resultsList: {                       // Rendered results list object      | (Optional)
            render: true,
            container: source => {
                console.log(source)
                source.setAttribute("id", "autoComplete_list");
            },
            destination: document.querySelector("#autoComplete"),
            position: "afterend",
            element: "ul"
        },
        maxResults: 5,                         // Max. number of rendered results | (Optional)
        highlight: true,                       // Highlight matching results      | (Optional)
        resultItem: {                          // Rendered result item            | (Optional)
            content: (data, source) => {
                source.innerHTML = data.match;
            },
            element: "li"
        },
        noResults: () => {                     // Action script on noResults      | (Optional)
            const result = document.createElement("li");
            result.setAttribute("class", "no_result");
            result.setAttribute("tabindex", "1");
            result.innerHTML = "No Results";
            document.querySelector("#autoComplete_list").appendChild(result);
        },
        onSelection: feedback => {             // Action script onSelection event | (Optional)
            var person = feedback.selection.value;
            console.log(person);
            // show detail about that person
            document.querySelector("#autoComplete").value = "";
            clearDetailView();
            showPersonDetail(person.icpsr);

        }
    });





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
    democData = [];
    repubData = [];
    combinedData = [];

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
    xScale = d3.scaleLinear()
        .domain([1900, 2019])
        .range([0, globalWidth - paddings.left - paddings.right - zoomedInWidth]);

    yScale = d3.scaleLinear()
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
    pathGroup = mainG.append('g');


    var democPath = pathGroup.append('path')
        .attr('class', 'path main')
        .attr('d', democPathData)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr("stroke-width", 3);
    console.log(repubPathData.length);
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

    // add label to xAxis
    var xAxisText = mainVizXAxis.append('text')
        .attr('x', globalWidth / 2)
        .attr('y', 50)
        .attr('class', 'xAxisLabel')
        .text("Year / #Congress")
        .attr("font-size", "30px")
        .attr("fill", '#ffffff');


    var mainVizYAxis = axisGroup.append('g')
        .attr('class', 'axis y')
        .attr('transform', 'translate('+[0, -xAxisPadding]+')')
        .call(yAxis);

    // add label to xAxis
    var yAxisText = mainVizYAxis.append('text')
        .attr("transform", "rotate(-90)")
        .attr('x', function() {
            return -1 * globalHeight / 4;
        })
        .attr('y', function() {
            return -35;
        })
        .attr('class', 'yAxisLabel')
        .text("Dimension one score")
        .attr("font-size", "30px")
        .attr("fill", '#ffffff');

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


    d3.select('body').on('mousemove', function() {
        var xPos = d3.mouse(this)[0] - svgPosRect.x - paddings.left + 2;



        verticalLineG.select('line')
            .attr("transform", function() {
                if (xPos < 0) {
                    d3.select(this).attr('stroke-width', 0);
                } else {
                    d3.select(this).attr('stroke-width', 4);
                }
                var deltaX = xPos;
                return "translate(" + deltaX + ",0)";
            });

        var curXPosToMainG = d3.mouse(this)[0] - svgPosRect.x - paddings.left;

        var closestIdx = 0;
        var minVal = 10000;

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

    //


    // add all individual members circles
    memberCircleG = mainG.append('g');
    personDotsG = memberCircleG.append('g');

    // special container for 2019 dots
    memberDots2019 = [];

    memberCircleG.selectAll('circle')
        .data(original_data)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
            if (d.icpsr === '14920') specialPersonCircle = d3.select(this);
            var curYear = (d.congress - 57) * 2  + 1900;
            return xScale(curYear)
        })
        .attr('cy', function(d) {
            if (d.congress == 116) memberDots2019.push(d3.select(this));
            return yScale(d.dim1)
        })
        .attr('r', function(d) {
            if (d.dim1 > 0.7 || d.dim1 < -0.6) return 0;
            else if (d.chamber === 'President') return 5; // president
            else return 2; // democrats
        })
        .style('opacity', function(d) {
            if (d.chamber === 'President') return 1;
            else return 0.06;
        })
        .style('fill', function(d) {
            if (d.icpsr === '99912') return 'Sienna';// trump
            else if (d.chamber === 'President') return 'gold'; // president
            else if (d.party === '200') return 'red'; // republican
            else return 'blue'; // democrats
        })
        .on('click', function(d) {
            var curCong = d.congress;
            console.log(curCong)
            console.log(d3.select(this));
            clearDetailView();
            showPersonDetail(d.icpsr);
        })
        .on('mouseover', function(d) {
            tooltip4.show(d);

        })
        .on('mouseout', function(d) {
            tooltip4.hide();
        });


    /*   <<<<<< Brushing is currently disabled, and the zoomed-in view is temporarily used for detail for each person >>>>>

    // set up the zoomed-in scale
    var zoomedScaleX = d3.scaleLinear()
        .range([0, zoomedInWidth]);

    var zoomedScaleY = d3.scaleLinear()
        .range([zoomedInHeight, 0]);

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
                tempCombined.push(zoomedScaleY(combinedData[congIdx]['median_dim1']));
                zoomedInPoints.push(tempCombined);
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

    console.log(brush);

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

    // add a event listener to out search box
    //console.log(d3.select('#submitButton'));

    */


    // search using fuse.js
    /*
    d3.select('#submitButton')
        .on('click', function() {
            var textVal = document.getElementById("searchValue").value;
            //console.log(textVal);
            //console.log(fuse.search(textVal));
            var tempSearchResult = fuse.search(textVal);
            // step 1 get processed result
            var searchByIcpsr = compressSearch(tempSearchResult);
            console.log(searchByIcpsr);
            // step 2 if result length == 0: wrong name
            // else if length == 1, output the detail result
            // else (length > 1) prompt the user with possible results

        });
    */
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
        return "<div id=tip_container1><div id=rep_text>The Democratic Party</div><div id=custom_tip><div id=tip_dem_score>" + d.median_dim1 + "</div></div></div";
    });

var tooltip2 = d3.tip()
    .attr('class', 'd3-tip tip2')
    .offset([-12, 0])
    .html(function(d) {
        return "<div id=tip_container1><div id=rep_text>The Republican Party</div><div id=custom_tip><div id=tip_rep_score>" + d.median_dim1 + "</div></div></div";
    });

var tooltip3 = d3.tip()
    .attr('class', 'd3-tip tip3')
    .offset([-12, 0])
    .html(function(d) {
        return "<div id=custom_tip2><div id=tip_median_score>" + d.median_dim1 + "</div><div id=tip_text><strong>Median Ideology Score</strong><br>" + ((2*(d.congress-1)+1789)) + " - " +  ((2*(d.congress-1)+1789)+2) + " , " + d.congress + "th Congress</div></div>";
    });

// Set a tooltip for each member
var tooltip4 = d3.tip()
    .attr('class', 'd3-tip tip4')
    .offset([-8, 0])
    .html(function(d) {
        var partyName = d.party === 200 ? "Democrats" : "Republicans";
        return "<strong>" + d.name + " </strong>" + " (" + partyName + ")";
    });

// register tooltips
svg.call(tooltip1);
svg.call(tooltip2);
svg.call(tooltip3);
svg.call(tooltip4);

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

// the data preprocessing function used with fuse.js
/*
function compressSearch(tempSearchRes) {
    var res = {};
    for (var i = 0; i < tempSearchRes.length; i++) {
        var curRow = tempSearchRes[i];
        var curIcpsr = curRow.icpsr;
        var curObj;
        if (!(curIcpsr in res)) {
            curObj = {};
            curObj['name'] = curRow.name;
            curObj['congress'] = [curRow.congress];
            res[curIcpsr] = curObj;
        } else {
            curObj = res[curIcpsr];
            curObj['congress'].push([curRow.congress]);
        }
    }
    return res;
}
 */

// The data preprocessing function used with autocomplete.js
//     which returns an array of people objects
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
    var realRes = [];

    for (let key in res){
        if(res.hasOwnProperty(key)) {
            var temp = {};
            temp['icpsr'] = key;
            for (let subKey in res[key]) {
                if (res[key].hasOwnProperty(subKey)) {
                    temp[subKey] = res[key][subKey];
                }
            }
            realRes.push(temp);
        }
    }
    // important -> global map for fast person lookup based on icpsr
    icpsrToPersonMap = res;
    return realRes;
}


// add more mappings to button action
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}

function changeLineOpacity(op) {
    pathGroup.selectAll('path')
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .style('opacity', op);
}


d3.selectAll('.highlightTwoLines')
    .on('click', function() {
        changeLineOpacity(0.2);
        memberCircleG.style('opacity', 0.2);
    });

d3.selectAll('.resumeTwoLines')
    .on('click', function() {
        changeLineOpacity(1);
    });


jQuery.fn.d3Click = function () {
    this.each(function (i, e) {
        var evt = new MouseEvent("click");
        e.dispatchEvent(evt);
    });
};

d3.selectAll('.highlightOnePoint')
    .on('click', function() {
        specialPersonCircle.dispatch('click');
    });

d3.selectAll('.highlight2019')
    .on('click', function() {
        console.log(memberDots2019);
        for (var i = 0; i < memberDots2019.length; i++) {
            memberDots2019[i].transition().duration(500).attr('r', 8)
                .style('opacity', 0.3);
        }
    });

d3.selectAll('.resume2019')
    .on('click', function() {
        console.log(memberDots2019);
        for (var i = 0; i < memberDots2019.length; i++) {
            memberDots2019[i].transition().duration(500).attr('r', 3)
                .style('opacity', 0.06);
        }
    });

d3.selectAll('.highlight0040')
    .on('click', function() {
        pathGroup.selectAll('path').remove();
        var democPoints = [];
        var repubPoints = [];
        var combinedPoints = [];

        for (var i = 57; i <= 77; i += 1) { // 1900 - 1940

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
        var democPathData = lineGenerator(democPoints);

        var repubPathData = lineGenerator(repubPoints);

        var combinedPathData = lineGenerator(combinedPoints);

        // Draw three lines(paths)
        var democPath = pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', democPathData)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr("stroke-width", 3);
        console.log(repubPathData.length);
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

        // -------------------------- part of the path that should be dimed
        var democPoints = [];
        var repubPoints = [];
        var combinedPoints = [];

        for (var i = 77; i <= 116; i += 1) { // 1900 - 1940

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
        var democPathData = lineGenerator(democPoints);

        var repubPathData = lineGenerator(repubPoints);

        var combinedPathData = lineGenerator(combinedPoints);

        // Draw three lines(paths)
        var democPath = pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', democPathData)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);
        console.log(repubPathData.length);
        var repubPath = pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', repubPathData)
            .style('fill', 'none')
            .style('stroke', 'red')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);

        var combinedPath = pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', combinedPathData)
            .style('fill', 'none')
            .style('stroke', 'grey')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);

    });

d3.selectAll('.highlight4080')
    .on('click', function() {
            pathGroup.selectAll('path').remove();
            var democPoints = [];
            var repubPoints = [];
            var combinedPoints = [];

            for (var i = 57; i <= 77; i += 1) { // 1900 - 1940

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
            var democPathData = lineGenerator(democPoints);

            var repubPathData = lineGenerator(repubPoints);

            var combinedPathData = lineGenerator(combinedPoints);

            // Draw three lines(paths)
            var democPath = pathGroup.append('path')
                .attr('class', 'path main')
                .attr('d', democPathData)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr("stroke-width", 3)
                .style('opacity', 0.2);
            var repubPath = pathGroup.append('path')
                .attr('class', 'path main')
                .attr('d', repubPathData)
                .style('fill', 'none')
                .style('stroke', 'red')
                .attr("stroke-width", 3)
                .style('opacity', 0.2);

            var combinedPath = pathGroup.append('path')
                .attr('class', 'path main')
                .attr('d', combinedPathData)
                .style('fill', 'none')
                .style('stroke', 'grey')
                .attr("stroke-width", 3)
                .style('opacity', 0.2);

            // -------------------------- part of the path that should be dimed
            var democPoints = [];
            var repubPoints = [];
            var combinedPoints = [];

            for (var i = 77; i <= 97; i += 1) { // 1900 - 1940

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
            var democPathData = lineGenerator(democPoints);

            var repubPathData = lineGenerator(repubPoints);

            var combinedPathData = lineGenerator(combinedPoints);

            // Draw three lines(paths)
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

        // -------------------------- part of the path that should be dimed
        var democPoints = [];
        var repubPoints = [];
        var combinedPoints = [];

        for (var i = 97; i <= 116; i += 1) { // 1900 - 1940

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
        var democPathData = lineGenerator(democPoints);

        var repubPathData = lineGenerator(repubPoints);

        var combinedPathData = lineGenerator(combinedPoints);

        // Draw three lines(paths)
        var democPath = pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', democPathData)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);
        var repubPath = pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', repubPathData)
            .style('fill', 'none')
            .style('stroke', 'red')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);

        var combinedPath = pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', combinedPathData)
            .style('fill', 'none')
            .style('stroke', 'grey')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);
    });

d3.selectAll('.highlight8020')
    .on('click', function() {
        pathGroup.selectAll('path').remove();
        var democPoints = [];
        var repubPoints = [];
        var combinedPoints = [];

        for (var i = 57; i <= 97; i += 1) { // 1900 - 1940

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
        var democPathData = lineGenerator(democPoints);

        var repubPathData = lineGenerator(repubPoints);

        var combinedPathData = lineGenerator(combinedPoints);

        // Draw three lines(paths)
        var democPath = pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', democPathData)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);


        var repubPath = pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', repubPathData)
            .style('fill', 'none')
            .style('stroke', 'red')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);


        var combinedPath = pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', combinedPathData)
            .style('fill', 'none')
            .style('stroke', 'grey')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);


        // -------------------------- part of the path that should be dimed
        var democPoints = [];
        var repubPoints = [];
        var combinedPoints = [];

        for (var i = 97; i <= 116; i += 1) { // 1900 - 1940

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
        var democPathData = lineGenerator(democPoints);

        var repubPathData = lineGenerator(repubPoints);

        var combinedPathData = lineGenerator(combinedPoints);

        // Draw three lines(paths)
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

    });

d3.selectAll('.resumeMemberDots')
    .on('click', function() {
        memberCircleG.transition()
            .duration(500)
            .ease(d3.easeLinear).style('opacity', 1);
        }
    )
