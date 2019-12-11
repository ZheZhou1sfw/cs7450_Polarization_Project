// Setting up global width and length, and padding sizes

var globalWidth = screen.width * 10 / 10, globalHeight = screen.height * 8.6 / 10 ;
paddings = {top : 100, bottom : 55, left : 60, right : 20};

// create and select the global svg

var svg = d3.select(".viz1Place")
    .append("svg")
    .attr('class', "mainSVG")
    .attr("width", globalWidth)
    .attr("height", globalHeight)
    //.attr('visibility', 'hidden');
    .attr('opacity', 0);



//
var showTooltips = false;

// Create the main visualization group
var mainG = svg.append('g')
    .attr('transform', 'translate('+[paddings.left, paddings.top]+')');



// Create a pre-rendered rectangle frame for zoomed in viz
var zoomedInWidth = globalWidth / 3;
var zoomedInHeight = globalHeight / 5;

var zoomedInPos = {
    left: globalWidth * 3 / 5,
    top: paddings.top / 2,
};

// Create the zoomed-in visualization group
var zoomedInG = svg.append('g')
    .attr('transform', 'translate('+[zoomedInPos.left, zoomedInPos.top]+')')
    .attr('visibility', 'hidden');
    //.attr('visibility', 'visible');

var zoomedInFrame = zoomedInG.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('width', zoomedInWidth)
    .attr('height', zoomedInHeight)
    .style('fill', '#ffffff');


// load the data and do the job
d3.csv('data/viz1/real_initial_data.csv', viz1dataPreprocessor).then(function(dataset) {
    var original_data = dataset;
    //console.log(original_data);

    var autocompleteData = viz1compressData(original_data);
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
            .attr('width', 90)
            .attr('height', 90)
            .attr('transform', function () {
                var tempX = 10;
                var tempY = 20;
                return 'translate('+[tempX,tempY]+')';
            });

        //console.log(viz1IcpsrToPersonMap[icpsr]);

        var text = zoomedInG.selectAll("text")
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
                //console.log('congres');
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




        // show a dot in the main viz that emphesizes this person
        personDots = personDotsG.selectAll('circle')
            .data(viz1IcpsrToPersonMap[icpsr].congress)
            .enter()
            .append('circle')
            .attr('cx', function(d) {
                var curYear = (d - 57) * 2  + 1900;
                return viz1xScale(curYear)
            })
            .attr('cy', function(d) {
                return viz1yScale(viz1IcpsrToPersonMap[icpsr].dim1)
            })
            .attr('r', function(d) {
                return 4;
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
                //console.log(autocompleteData);
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
        placeHolder: "Search for a politician.",     // Place Holder text                 | (Optional)
        selector: "#autoComplete",           // Input field selector              | (Optional)
        threshold: 3,                        // Min. Chars length to start Engine | (Optional)
        debounce: 300,                       // Post duration for engine to start | (Optional)
        searchEngine: "strict",              // Search Engine type/mode           | (Optional)
        resultsList: {                       // Rendered results list object      | (Optional)
            render: true,
            container: source => {
                //console.log(source)
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
                console.log(source);
                console.log(data.match);
                source.innerHTML = data.match;
            },
            element: "li"
        },
        noResults: () => {                     // Action script on noResults      | (Optional)
            console.log("no result!");
            const result = document.createElement("li");
            result.setAttribute("class", "no_result");
            result.setAttribute("tabindex", "1");
            result.innerHTML = "No Results";
            document.querySelector("#autoComplete_list").appendChild(result);
        },
        onSelection: feedback => {             // Action script onSelection event | (Optional)
            var person = feedback.selection.value;
            //console.log(person);
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

    //console.log(democData);
    //console.log(repubData);
    //console.log(combinedData);

    // create the X and Y scale for the major visualization
    viz1xScale = d3.scaleLinear()
        .domain([1900, 2019])
        .range([0, globalWidth - paddings.left - paddings.right]);

    viz1yScale = d3.scaleLinear()
        .domain([-0.6, 0.7])
        .range([globalHeight - paddings.top - paddings.bottom, zoomedInHeight]);

    // create the X and Y axis for the major visualization
    var viz1xAxis = d3.axisBottom()
        .scale(viz1xScale)
        .tickFormat(d3.format('d'));


    var viz2yAxis = d3.axisLeft()
        .scale(viz1yScale);

    // Set up the points data for line generators:


    var viz1democPoints = [];
    var viz1repubPoints = [];
    var viz1combinedPoints = [];

    for (var i = 57; i <= 116; i += 1) {

        var curYear = (i - 57) * 2  + 1900;

        var tempDemoc = [];
        tempDemoc.push(viz1xScale(curYear));
        tempDemoc.push(viz1yScale(democData[i - 57]['median_dim1']));
        viz1democPoints.push(tempDemoc);

        var tempRepub = [];
        tempRepub.push(viz1xScale(curYear));
        tempRepub.push(viz1yScale(repubData[i - 57]['median_dim1']));
        viz1repubPoints.push(tempRepub);

        var tempCombined = [];
        tempCombined.push(viz1xScale(curYear));
        tempCombined.push(viz1yScale(combinedData[i - 57]['median_dim1']));
        viz1combinedPoints.push(tempCombined);
    }

    // ------ Get three paths' data: -------

    var viz1democPathData = viz1lineGenerator(viz1democPoints);
    // :>

    var viz1repubPathData = viz1lineGenerator(viz1repubPoints);
    // :p

    //var viz1combinedPathData = viz1lineGenerator(viz1combinedPoints);


    // Draw three lines(paths)
    viz1pathGroup = mainG.append('g');


    var democPath = viz1pathGroup.append('path')
        .attr('class', 'path main')
        .attr('d', viz1democPathData)
        .attr('fill', 'none')
        .attr('stroke', '#4451D3')
        .attr("stroke-width", 3)
        .style('opacity', 0.5);

    //console.log(viz1repubPathData.length);
    var repubPath = viz1pathGroup.append('path')
        .attr('class', 'path main')
        .attr('d', viz1repubPathData)
        .style('fill', 'none')
        .style('stroke', '#D34444')
        .attr("stroke-width", 3)
        .style('opacity', 0.5);

    // var combinedPath = viz1pathGroup.append('path')
    //     .attr('class', 'path main')
    //     .attr('d', viz1combinedPathData)
    //     .style('fill', 'none')
    //     .style('stroke', '#494949')
    //     .attr("stroke-width", 1);


    // draw two axes for our main visualization
    var viz1axisGroup = mainG.append('g');

    var xAxisPadding = 0;

    var mainVizXAxis = viz1axisGroup.append('g')
        .attr('class', 'axis x')
        .attr('transform', 'translate('+[0, globalHeight - xAxisPadding - paddings.bottom - paddings.top]+')')
        .call(viz1xAxis)
        .call(g => g.select(".domain")
            .remove());

    // add label to xAxis
    var xAxisText = mainVizXAxis.append('text')
        .attr('x', globalWidth*(45/100))
        .attr('y', 50)
        .attr('class', 'xAxisLabel')
        .text("Year")
        .attr("font-size", "1rem")
        .attr("fill", '#494949')
        .attr("font-family", 'IBM Plex Mono');


    var mainVizYAxis = viz1axisGroup.append('g')
        .attr('class', 'axis y')
        .attr('transform', 'translate('+[0, -xAxisPadding]+')')
        .call(viz2yAxis)
        .call(g => g.select(".domain")
            .remove());

    // add label to yAxis
    var yAxisText = mainVizYAxis.append('text')
        .attr("transform", "rotate(-90)")
        .attr('x', function() {
            return -1 * globalHeight / 4;
        })
        .attr('y', function() {
            return -35;
        })
        .attr('class', 'yAxisLabel')
        .text("dw-nominate dim1")
        .attr("font-size", "1rem")
        .attr("fill", '#494949')
        .attr("font-family", 'IBM Plex Mono');

    // customize tick text attributes

    var xAxisTickMods = mainVizXAxis.selectAll(".tick text")
     .attr("font-size","0.5rem")
     .attr("font-family","IBM Plex Mono")
     .attr("color", "#FFFFFF");

    var yAxisTickMods = mainVizYAxis.selectAll(".tick text")
     .attr("font-size","0.5rem")
     .attr("font-family","IBM Plex Mono")
     .attr("color", "#FFFFFF");

    // Create the elements that tooltips use
    var viz1tooltipGroup = mainG.append('g')
        .attr('class', 'tooltips');

    var democCircles = viz1tooltipGroup.append('g')
        .selectAll('circle')
        .data(democData)
        .enter()
        .append('circle')
        .attr("class", "democDots")
        .attr('cx', function(d) {
            var curIdx = d['congress'] - 57;
            return viz1democPoints[curIdx][0];
        })
        .attr('cy', function(d) {
            var curIdx = d['congress'] - 57;
            return viz1democPoints[curIdx][1];
        })
        .attr('r', 8)
        .style('fill', '#4451D3')
        .style('opacity', 0);

    var repubCircles = viz1tooltipGroup.append('g')
        .selectAll('circle')
        .data(repubData)
        .enter()
        .append('circle')
        .attr("class", "repubDots")
        .attr('cx', function(d) {
            var curIdx = d['congress'] - 57;
            return viz1repubPoints[curIdx][0];
        })
        .attr('cy', function(d) {
            var curIdx = d['congress'] - 57;
            return viz1repubPoints[curIdx][1];
        })
        .attr('r', 8)
        .style('fill', '#D34444')
        .style('opacity', 0);

    var combinedCircles = viz1tooltipGroup.append('g')
        .selectAll('circle')
        .data(combinedData)
        .enter()
        .append('circle')
        .attr("class", "combinedDots")
        .attr('cx', function(d) {
            var curIdx = d['congress'] - 57;
            return viz1combinedPoints[curIdx][0];
        })
        .attr('cy', function(d) {
            var curIdx = d['congress'] - 57;
            return viz1combinedPoints[curIdx][1];
        })
        .attr('r', 8)
        .style('fill', 'grey')
        .style('opacity', 0);


    // the hover function that shows/hides tooltips for three lines
    var allCircles = viz1tooltipGroup.selectAll('circle');

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

    verticalLineG = mainG.append('g').attr('visibility', 'hidden');;

    verticalLineG.append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", zoomedInHeight)
        .attr("y2", globalHeight - paddings.top - paddings.bottom)
        .attr("stroke-width", 2)
        .attr("stroke", "white")
        .attr('visibility', 'hidden');


    // get the svg absolute position
    var svgPosRect = document.getElementsByClassName("mainSVG").item(0).getBoundingClientRect();


    d3.select('body').on('mousemove', function() {
        var xPos = d3.mouse(this)[0] - svgPosRect.x - paddings.left + 2;



        verticalLineG.select('line')
            .attr("transform", function() {
                if (xPos < 0) {
                    d3.select(this).attr('stroke-width', 0);
                } else {
                    d3.select(this).attr('stroke-width', 2);
                }
                var deltaX = xPos;
                return "translate(" + deltaX + ",0)";
            });

        var curXPosToMainG = d3.mouse(this)[0] - svgPosRect.x - paddings.left;

        var closestIdx = 0;
        var minVal = 10000;

        for (var i = 0; i < viz1combinedPoints.length; i++) {
            var delta = Math.abs(viz1combinedPoints[i][0] - curXPosToMainG);
            if (delta < minVal) {
                minVal = delta;
                closestIdx = i;
            }
        }

        var tempX = viz1combinedPoints[closestIdx][0];
        var circlesInLine = [];
        allCircles.each(function(d, i) {
            if (d3.select(this).attr('cx') == tempX) {
                circlesInLine.push(this);
            } else {
                d3.select(this).style('opacity', 0);
                d3.select(this).attr('stroke-width', '0');
            }
        });

        for (var i = 0; i < circlesInLine.length; i++) {
            var curCircle = circlesInLine[i];

            if ((d3.select(curCircle).attr('class') === 'repubDots' || d3.select(curCircle).attr('class') === 'democDots') && showTooltips) {
                d3.select(curCircle).attr('stroke', 'white').attr('storke-width', 2);
                d3.select(curCircle).attr('visibility', 'visible');
                d3.select(curCircle).style('opacity', 1);
            }

            if (d3.select(curCircle).attr('class') === 'democDots' && showTooltips) {

                tooltip1.show(democData[closestIdx], curCircle);
            } else if (d3.select(curCircle).attr('class') === 'repubDots' && showTooltips) {
                tooltip2.show(repubData[closestIdx], curCircle);
            } else if (showTooltips) {
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
            return viz1xScale(curYear)
        })
        .attr('cy', function(d) {
            if (d.congress == 116) memberDots2019.push(d3.select(this));
            return viz1yScale(d.dim1)
        })
        .attr('r', function(d) {
            if (d.dim1 > 0.7 || d.dim1 < -0.6) return 0;
            else if (d.chamber === 'President') return 3; // president
            else return 2; // democrats
        })
        .style('opacity', function(d) {
            if (d.chamber === 'President') return 1;
            else return 0.06;
        })
        .style('fill', function(d) {
            if (d.icpsr === '99912') return 'Sienna';// trump
            else if (d.chamber === 'President') return '#E8BB43'; // president
            else if (d.party === '200') return '#D34444'; // republican
            else return '#4451D3'; // democrats
        })
        .on('click', function(d) {
            var curCong = d.congress;
            //console.log(curCong)
            //console.log(d3.select(this));
            clearDetailView();
            console.log(d);
            showPersonDetail(d.icpsr);
        })
        .on('mouseover', function(d) {
            tooltip4.show(d);
            console.log('testttt');
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
var viz1lineGenerator = d3.line()
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
        return "<div id=tip_container1><div id=rep_text>Democratic Party Median</div><div id=custom_tip_dem><div id=tip_dem_score>" + d.median_dim1.toFixed(3) + "</div></div></div";
    });

var tooltip2 = d3.tip()
    .attr('class', 'd3-tip tip2')
    .offset([-12, 0])
    .html(function(d) {
        return "<div id=tip_container1><div id=rep_text>Republican Party Median</div><div id=custom_tip_rep><div id=tip_rep_score>" + d.median_dim1.toFixed(3) + "</div></div></div";
    });

var tooltip3 = d3.tip()
    .attr('class', 'd3-tip tip3')
    .offset([-12, 0])
    .html(function(d) {
        return "<div id=custom_tip2><div id=tip_median_score>" + "</div><div id=med_text><strong></strong><br>" + ((2*(d.congress-1)+1789)) + " - " +  ((2*(d.congress-1)+1789)+2) + " , " + d.congress + "th Congress</div></div>";
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
function viz1dataPreprocessor(row) {
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
function viz1compressData(originalData) {
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
    viz1IcpsrToPersonMap = res;
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
    viz1pathGroup.selectAll('path')
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
        //console.log(memberDots2019);
        for (var i = 0; i < memberDots2019.length; i++) {
            memberDots2019[i].transition().duration(500).attr('r', 4)
                .style('opacity', 0.3);
        }
    });

d3.selectAll('.resume2019')
    .on('click', function() {
        //console.log(memberDots2019);
        for (var i = 0; i < memberDots2019.length; i++) {
            memberDots2019[i].transition().duration(500).attr('r', 3)
                .style('opacity', 0.06);
        }
    });

d3.selectAll('.highlight0040')
    .on('click', function() {
        viz1pathGroup.selectAll('path').remove();
        var democPoints = [];
        var repubPoints = [];
        var combinedPoints = [];

        for (var i = 57; i <= 77; i += 1) { // 1900 - 1940

            var curYear = (i - 57) * 2  + 1900;

            var tempDemoc = [];
            tempDemoc.push(viz1xScale(curYear));
            tempDemoc.push(viz1yScale(democData[i - 57]['median_dim1']));
            democPoints.push(tempDemoc);

            var tempRepub = [];
            tempRepub.push(viz1xScale(curYear));
            tempRepub.push(viz1yScale(repubData[i - 57]['median_dim1']));
            repubPoints.push(tempRepub);

            var tempCombined = [];
            tempCombined.push(viz1xScale(curYear));
            tempCombined.push(viz1yScale(combinedData[i - 57]['median_dim1']));
            combinedPoints.push(tempCombined);
        }
        var democPathData = viz1lineGenerator(democPoints);

        var repubPathData = viz1lineGenerator(repubPoints);

        //var combinedPathData = viz1lineGenerator(combinedPoints);

        // Draw three lines(paths)
        var democPath = viz1pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', democPathData)
            .attr('fill', 'none')
            .attr('stroke', '#4451D3')
            .attr("stroke-width", 3)
            .style('opacity', 1);

        //console.log(repubPathData.length);
        var repubPath = viz1pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', repubPathData)
            .style('fill', 'none')
            .style('stroke', '#D34444')
            .attr("stroke-width", 3)
            .style('opacity', 1);

        // var combinedPath = viz1pathGroup.append('path')
        //     .attr('class', 'path main')
        //     .attr('d', combinedPathData)
        //     .style('fill', 'none')
        //     .style('stroke', '#494949')
        //     .attr("stroke-width", 1);

        // -------------------------- part of the path that should be dimed
        var democPoints = [];
        var repubPoints = [];
        var combinedPoints = [];

        for (var i = 77; i <= 116; i += 1) { // 1900 - 1940

            var curYear = (i - 57) * 2  + 1900;

            var tempDemoc = [];
            tempDemoc.push(viz1xScale(curYear));
            tempDemoc.push(viz1yScale(democData[i - 57]['median_dim1']));
            democPoints.push(tempDemoc);

            var tempRepub = [];
            tempRepub.push(viz1xScale(curYear));
            tempRepub.push(viz1yScale(repubData[i - 57]['median_dim1']));
            repubPoints.push(tempRepub);

            var tempCombined = [];
            tempCombined.push(viz1xScale(curYear));
            tempCombined.push(viz1yScale(combinedData[i - 57]['median_dim1']));
            combinedPoints.push(tempCombined);
        }
        var democPathData = viz1lineGenerator(democPoints);

        var repubPathData = viz1lineGenerator(repubPoints);

        //var combinedPathData = viz1lineGenerator(combinedPoints);

        // Draw three lines(paths)
        var democPath = viz1pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', democPathData)
            .attr('fill', 'none')
            .attr('stroke', '#4451D3')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);
        //console.log(repubPathData.length);
        var repubPath = viz1pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', repubPathData)
            .style('fill', 'none')
            .style('stroke', '#D34444')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);

        // var combinedPath = viz1pathGroup.append('path')
        //     .attr('class', 'path main')
        //     .attr('d', combinedPathData)
        //     .style('fill', 'none')
        //     .style('stroke', '#494949')
        //     .attr("stroke-width", 1)
        //     .style('opacity', 0.2);

    });

d3.selectAll('.highlight4080')
    .on('click', function() {
            viz1pathGroup.selectAll('path').remove();
            var democPoints = [];
            var repubPoints = [];
            var combinedPoints = [];

            for (var i = 57; i <= 77; i += 1) { // 1900 - 1940

                var curYear = (i - 57) * 2  + 1900;

                var tempDemoc = [];
                tempDemoc.push(viz1xScale(curYear));
                tempDemoc.push(viz1yScale(democData[i - 57]['median_dim1']));
                democPoints.push(tempDemoc);

                var tempRepub = [];
                tempRepub.push(viz1xScale(curYear));
                tempRepub.push(viz1yScale(repubData[i - 57]['median_dim1']));
                repubPoints.push(tempRepub);

                var tempCombined = [];
                tempCombined.push(viz1xScale(curYear));
                tempCombined.push(viz1yScale(combinedData[i - 57]['median_dim1']));
                combinedPoints.push(tempCombined);
            }
            var democPathData = viz1lineGenerator(democPoints);

            var repubPathData = viz1lineGenerator(repubPoints);

            //var combinedPathData = viz1lineGenerator(combinedPoints);

            // Draw three lines(paths)
            var democPath = viz1pathGroup.append('path')
                .attr('class', 'path main')
                .attr('d', democPathData)
                .attr('fill', 'none')
                .attr('stroke', '#4451D3')
                .attr("stroke-width", 3)
                .style('opacity', 0.2);

            var repubPath = viz1pathGroup.append('path')
                .attr('class', 'path main')
                .attr('d', repubPathData)
                .style('fill', 'none')
                .style('stroke', '#D34444')
                .attr("stroke-width", 3)
                .style('opacity', 0.2);

            // var combinedPath = viz1pathGroup.append('path')
            //     .attr('class', 'path main')
            //     .attr('d', combinedPathData)
            //     .style('fill', 'none')
            //     .style('stroke', '#494949')
            //     .attr("stroke-width", 1)
            //     .style('opacity', 0.2);

            // -------------------------- part of the path that should be dimed
            var democPoints = [];
            var repubPoints = [];
            var combinedPoints = [];

            for (var i = 77; i <= 97; i += 1) { // 1900 - 1940

                var curYear = (i - 57) * 2  + 1900;

                var tempDemoc = [];
                tempDemoc.push(viz1xScale(curYear));
                tempDemoc.push(viz1yScale(democData[i - 57]['median_dim1']));
                democPoints.push(tempDemoc);

                var tempRepub = [];
                tempRepub.push(viz1xScale(curYear));
                tempRepub.push(viz1yScale(repubData[i - 57]['median_dim1']));
                repubPoints.push(tempRepub);

                var tempCombined = [];
                tempCombined.push(viz1xScale(curYear));
                tempCombined.push(viz1yScale(combinedData[i - 57]['median_dim1']));
                combinedPoints.push(tempCombined);
            }
            var democPathData = viz1lineGenerator(democPoints);

            var repubPathData = viz1lineGenerator(repubPoints);

            //var combinedPathData = viz1lineGenerator(combinedPoints);

            // Draw three lines(paths)
            var democPath = viz1pathGroup.append('path')
                .attr('class', 'path main')
                .attr('d', democPathData)
                .attr('fill', 'none')
                .attr('stroke', '#4451D3')
                .attr("stroke-width", 3)
                .style('opacity', 1);

            var repubPath = viz1pathGroup.append('path')
                .attr('class', 'path main')
                .attr('d', repubPathData)
                .style('fill', 'none')
                .style('stroke', '#D34444')
                .attr("stroke-width", 3)
                .style('opacity', 1);

            // var combinedPath = viz1pathGroup.append('path')
            //     .attr('class', 'path main')
            //     .attr('d', combinedPathData)
            //     .style('fill', 'none')
            //     .style('stroke', '#494949')
            //     .attr("stroke-width", 1);

        // -------------------------- part of the path that should be dimed
        var democPoints = [];
        var repubPoints = [];
        var combinedPoints = [];

        for (var i = 97; i <= 116; i += 1) { // 1900 - 1940

            var curYear = (i - 57) * 2  + 1900;

            var tempDemoc = [];
            tempDemoc.push(viz1xScale(curYear));
            tempDemoc.push(viz1yScale(democData[i - 57]['median_dim1']));
            democPoints.push(tempDemoc);

            var tempRepub = [];
            tempRepub.push(viz1xScale(curYear));
            tempRepub.push(viz1yScale(repubData[i - 57]['median_dim1']));
            repubPoints.push(tempRepub);

            var tempCombined = [];
            tempCombined.push(viz1xScale(curYear));
            tempCombined.push(viz1yScale(combinedData[i - 57]['median_dim1']));
            combinedPoints.push(tempCombined);
        }
        var democPathData = viz1lineGenerator(democPoints);

        var repubPathData = viz1lineGenerator(repubPoints);

        //var combinedPathData = viz1lineGenerator(combinedPoints);

        // Draw three lines(paths)
        var democPath = viz1pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', democPathData)
            .attr('fill', 'none')
            .attr('stroke', '#4451D3')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);
        var repubPath = viz1pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', repubPathData)
            .style('fill', 'none')
            .style('stroke', '#D34444')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);

        // var combinedPath = viz1pathGroup.append('path')
        //     .attr('class', 'path main')
        //     .attr('d', combinedPathData)
        //     .style('fill', 'none')
        //     .style('stroke', '#494949')
        //     .attr("stroke-width", 1)
        //     .style('opacity', 0.2);
    });

d3.selectAll('.highlight8020')
    .on('click', function() {
        viz1pathGroup.selectAll('path').remove();
        var democPoints = [];
        var repubPoints = [];
        var combinedPoints = [];

        for (var i = 57; i <= 97; i += 1) { // 1900 - 1940

            var curYear = (i - 57) * 2  + 1900;

            var tempDemoc = [];
            tempDemoc.push(viz1xScale(curYear));
            tempDemoc.push(viz1yScale(democData[i - 57]['median_dim1']));
            democPoints.push(tempDemoc);

            var tempRepub = [];
            tempRepub.push(viz1xScale(curYear));
            tempRepub.push(viz1yScale(repubData[i - 57]['median_dim1']));
            repubPoints.push(tempRepub);

            var tempCombined = [];
            tempCombined.push(viz1xScale(curYear));
            tempCombined.push(viz1yScale(combinedData[i - 57]['median_dim1']));
            combinedPoints.push(tempCombined);
        }
        var democPathData = viz1lineGenerator(democPoints);

        var repubPathData = viz1lineGenerator(repubPoints);

        //var combinedPathData = viz1lineGenerator(combinedPoints);

        // Draw three lines(paths)
        var democPath = viz1pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', democPathData)
            .attr('fill', 'none')
            .attr('stroke', '#4451D3')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);


        var repubPath = viz1pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', repubPathData)
            .style('fill', 'none')
            .style('stroke', '#D34444')
            .attr("stroke-width", 3)
            .style('opacity', 0.2);


        // var combinedPath = viz1pathGroup.append('path')
        //     .attr('class', 'path main')
        //     .attr('d', combinedPathData)
        //     .style('fill', 'none')
        //     .style('stroke', '#494949')
        //     .attr("stroke-width", 1)
        //     .style('opacity', 0.2);


        // -------------------------- part of the path that should be dimed
        var democPoints = [];
        var repubPoints = [];
        var combinedPoints = [];

        for (var i = 97; i <= 116; i += 1) { // 1900 - 1940

            var curYear = (i - 57) * 2  + 1900;

            var tempDemoc = [];
            tempDemoc.push(viz1xScale(curYear));
            tempDemoc.push(viz1yScale(democData[i - 57]['median_dim1']));
            democPoints.push(tempDemoc);

            var tempRepub = [];
            tempRepub.push(viz1xScale(curYear));
            tempRepub.push(viz1yScale(repubData[i - 57]['median_dim1']));
            repubPoints.push(tempRepub);

            var tempCombined = [];
            tempCombined.push(viz1xScale(curYear));
            tempCombined.push(viz1yScale(combinedData[i - 57]['median_dim1']));
            combinedPoints.push(tempCombined);
        }
        var democPathData = viz1lineGenerator(democPoints);

        var repubPathData = viz1lineGenerator(repubPoints);

        //var combinedPathData = viz1lineGenerator(combinedPoints);

        // Draw three lines(paths)
        var democPath = viz1pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', democPathData)
            .attr('fill', 'none')
            .attr('stroke', '#4451D3')
            .attr("stroke-width", 3)
            .style('opacity', 1);

        var repubPath = viz1pathGroup.append('path')
            .attr('class', 'path main')
            .attr('d', repubPathData)
            .style('fill', 'none')
            .style('stroke', '#D34444')
            .attr("stroke-width", 3)
            .style('opacity', 1);

        // var combinedPath = viz1pathGroup.append('path')
        //     .attr('class', 'path main')
        //     .attr('d', combinedPathData)
        //     .style('fill', 'none')
        //     .style('stroke', '#494949')
        //     .attr("stroke-width", 1);

    });

d3.selectAll('.resumeMemberDots')
    .on('click', function() {
        memberCircleG.transition()
            .duration(500)
            .ease(d3.easeLinear).style('opacity', 1);
        }
    )

tooltip1.hide();
tooltip2.hide();
tooltip3.hide();


d3.selectAll('.toggleViz1Tooltips')
    .on('click', function() {
            tooltip1.hide();
            tooltip2.hide();
            tooltip3.hide();

            if (showTooltips == true) {
                //zoomedInG.attr('visibility', 'hidden');
                showTooltips = false;
                verticalLineG.attr('visibility', 'hidden');
            } else {
                //zoomedInG.attr('visibility', 'visible');
                showTooltips = true;
                verticalLineG.attr('visibility', 'visible');
            }
        }
    )
