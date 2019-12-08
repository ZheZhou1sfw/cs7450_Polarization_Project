$(document).ready(function() {

// Check for click events on the navbar burger icon
$(".navbar-burger").click(function() {

  // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
  $(".navbar-burger").toggleClass("is-active");
  $(".navbar-menu").toggleClass("is-active");

});
});
function simulate(element, eventName)
{
  var options = extend(defaultOptions, arguments[2] || {});
  var oEvent, eventType = null;

  for (var name in eventMatchers)
  {
    if (eventMatchers[name].test(eventName)) { eventType = name; break; }
  }

  if (!eventType)
    throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

  if (document.createEvent)
  {
    oEvent = document.createEvent(eventType);
    if (eventType == 'HTMLEvents')
    {
      oEvent.initEvent(eventName, options.bubbles, options.cancelable);
    }
    else
    {
      oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
          options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
          options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
    }
    element.dispatchEvent(oEvent);
  }
  else
  {
    options.clientX = options.pointerX;
    options.clientY = options.pointerY;
    var evt = document.createEventObject();
    oEvent = extend(evt, options);
    element.fireEvent('on' + eventName, oEvent);
  }
  return element;
}

function extend(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
}

var eventMatchers = {
  'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
  'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}
var defaultOptions = {
  pointerX: 0,
  pointerY: 0,
  button: 0,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
  bubbles: true,
  cancelable: true
}
















// init controller
var controller = new ScrollMagic.Controller();

// lock the first image
new ScrollMagic.Scene({
  triggerElement: "#imageToLock1",
  duration: 1500,
  offset: 300, // move trigger to center of element
})
    .setPin("#imageToLock1", {pushFollowers: false})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);


new ScrollMagic.Scene({
  triggerElement: "#testPart1",
  triggerHook: 0.4,
  offset: 0, // move trigger to center of element
  duration: 200
})
    .setClassToggle("#testPart1", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);


new ScrollMagic.Scene({
  triggerElement: "#testPart2",
  triggerHook: 0.4,
  offset: 0, // move trigger to center of element
  duration: 200
})
    .setClassToggle("#testPart2", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

new ScrollMagic.Scene({
  triggerElement: "#testPart3",
  triggerHook: 0.4,
  offset: 0, // move trigger to center of element
  duration: 200
})
    .setClassToggle("#testPart3", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

new ScrollMagic.Scene({
  triggerElement: "#testPart4",
  triggerHook: 0.4,
  offset: 0, // move trigger to center of element
  duration: 170
})
    .setClassToggle("#testPart4", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

new ScrollMagic.Scene({
  triggerElement: "#testPart5",
  triggerHook: 0.4,
  offset: 0, // move trigger to center of element
  duration: 200
})
    .setClassToggle("#testPart5", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

new ScrollMagic.Scene({
  triggerElement: "#testPart6",
  triggerHook: 0.4,
  offset: 0, // move trigger to center of element
  duration: 200
})
    .setClassToggle("#testPart6", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

new ScrollMagic.Scene({
  triggerElement: "#testPart7",
  triggerHook: 0.4,
  offset: 0, // move trigger to center of element
  duration: 200
})
    .setClassToggle("#testPart7", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

new ScrollMagic.Scene({
  triggerElement: "#testPart8",
  triggerHook: 0.4,
  offset: 0, // move trigger to center of element
  duration: 200
})
    .setClassToggle("#testPart8", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

// lock the first image

new ScrollMagic.Scene({
  triggerElement: "#imageToLock2",
  duration: 500,
  offset: 200, // move trigger to center of element
})
    .setPin("#imageToLock2", {pushFollowers: true})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);


// lock viz1
new ScrollMagic.Scene({
  triggerElement: "#viz1ToLock",
  duration: 3000,
  offset: 0, // move trigger to center of element
  triggerHook: 'onLeave'
})
    .setPin("#viz1ToLock", {pushFollowers: true})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

// highlight 3 lines
new ScrollMagic.Scene({
  triggerElement: "#viz1ToLock",
  triggerHook: 0.4,
  offset: 0, // move trigger to center of element
  duration: 300,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      $('#viz1Text').text('Visualizing these scores, we can indeed see some interesting patterns.');


    });

// highlight 3 lines
new ScrollMagic.Scene({
  triggerElement: "#viz1ToLock",
  triggerHook: 0.4,
  offset: 300, // move trigger to center of element
  duration: 300,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      jQuery('.highlightTwoLines')[0].click();
      jQuery('.toggleViz1Tooltips')[0].click();
    });


new ScrollMagic.Scene({
  triggerElement: "#viz1ToLock",
  triggerHook: 0.4,
  offset: 600, // move trigger to center of element
  duration: 300,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      jQuery('.resumeTwoLines')[0].click();
      $('#viz1Text').text('Here, the lines represents the median ideologies of the two parties, the Republicans and the Democrats. Also, the congressional median is shown between the two party medians.');
    });




// highlight 2019
new ScrollMagic.Scene({
  triggerElement: "#viz1ToLock",
  triggerHook: 0.4,
  offset: 900, // move trigger to center of element
  duration: 300,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      jQuery('.highlightTwoLines')[0].click();
      jQuery('.resumeMemberDots')[0].click();
      jQuery('.highlight2019')[0].click();
      $('#viz1Text').text('The parties are the most ideologically separate than ever before in U.S. history.');

    });

// resume 2019
new ScrollMagic.Scene({
  triggerElement: "#viz1ToLock",
  triggerHook: 0.4,
  offset: 1200, // move trigger to center of element
  duration: 300,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      jQuery('.resume2019')[0].click();
      jQuery('.highlightTwoLines')[0].click();
    });

// highlight 0040
new ScrollMagic.Scene({
  triggerElement: "#viz1ToLock",
  triggerHook: 0.4,
  offset: 1500, // move trigger to center of element
  duration: 300,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      jQuery('.highlight0040')[0].click();
      $('#viz1Text').text('There existed divergent ideologies at the turn of the 20th century. The country was undergoing major economic transitions and debating its role in a changing international order.');
    });

// highlight 4080
new ScrollMagic.Scene({
  triggerElement: "#viz1ToLock",
  triggerHook: 0.4,
  offset: 1800, // move trigger to center of element
  duration: 300,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      jQuery('.highlight4080')[0].click();
      $('#viz1Text').text('In the post-war era, as issues like civil rights, the Vietnam War, and the environment emerged as dividing issues, voters continued to exhibit high levels of cross-party voting in congressional elections.');
    });

// highlight 8020
new ScrollMagic.Scene({
  triggerElement: "#viz1ToLock",
  triggerHook: 0.4,
  offset: 2100, // move trigger to center of element
  duration: 300,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      jQuery('.highlight8020')[0].click();
      $('#viz1Text').text('In recent history, increasing partisanship has led to divisive politics and politicians barely voting across party lines. Note the diverging trend in the visualization.')
    });

// resume everything
new ScrollMagic.Scene({
  triggerElement: "#viz1ToLock",
  triggerHook: 0.4,
  offset: 2400, // move trigger to center of element
  duration: 300,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      jQuery('.resumeMemberDots')[0].click();
      jQuery('.resumeTwoLines')[0].click();
      jQuery('.toggleViz1Tooltips')[0].click();
      $('#viz1Text').text('Feel free to explore the visualization. When ready, scroll down.')
    });

new ScrollMagic.Scene({
  triggerElement: "#testPart11",
  triggerHook: 0.4,
  offset: -50, // move trigger to center of element
  duration: 180
})
    .setClassToggle("#testPart11", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

new ScrollMagic.Scene({
  triggerElement: "#testPart12",
  triggerHook: 0.4,
  offset: -50, // move trigger to center of element
  duration: 180
})
    .setClassToggle("#testPart12", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

new ScrollMagic.Scene({
  triggerElement: "#testPart13",
  triggerHook: 0.4,
  offset: -50, // move trigger to center of element
  duration: 180
})
    .setClassToggle("#testPart13", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e){
      jQuery('.toggleLineChart')[0].click(); // show line
    });

new ScrollMagic.Scene({
  triggerElement: "#testPart14",
  triggerHook: 0.4,
  offset: -50, // move trigger to center of element
  duration: 180
})
    .setClassToggle("#testPart14", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

// lock politician2
new ScrollMagic.Scene({
  triggerElement: "#politician2Place",
  duration: 300,
  offset: 300, // move trigger to center of element
})
    .setPin("#politician2Place", {pushFollowers: true})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

// lock image#5
new ScrollMagic.Scene({
  triggerElement: "#imageToLock5",
  duration: 300,
  offset: 150, // move trigger to center of element
})
    .setPin("#imageToLock5", {pushFollowers: true})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

new ScrollMagic.Scene({
  triggerElement: "#testPart16",
  triggerHook: 0.4,
  offset: -60, // move trigger to center of element
  duration: 200
})
    .setClassToggle("#testPart16", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

new ScrollMagic.Scene({
  triggerElement: "#testPart17",
  triggerHook: 0.4,
  offset: -60, // move trigger to center of element
  duration: 200
})
    .setClassToggle("#testPart17", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

// lock image#6
new ScrollMagic.Scene({
  triggerElement: "#imageToLock6",
  duration: 300,
  offset: 150, // move trigger to center of element
})
    .setPin("#imageToLock6", {pushFollowers: true})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

new ScrollMagic.Scene({
  triggerElement: "#testPart18",
  triggerHook: 0.4,
  offset: -30, // move trigger to center of element
  duration: 200
})
    .setClassToggle("#testPart18", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);


new ScrollMagic.Scene({
  triggerElement: "#testPart19",
  triggerHook: 0.4,
  offset: -30, // move trigger to center of element
  duration: 200
})
    .setClassToggle("#testPart19", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);


// lock viz2 here
new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  duration: 4000,
  offset: 0, // move trigger to center of element
  triggerHook: 'onLeave'
})
    .setPin("#viz2ToLock", {pushFollowers: true})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function() {
      $('#viz2Text').text('In the 1980s, ideologies are spread across the political spectrum.');
    });

// highlight 1980-1995
new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 500, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      //circleGroup.selectAll('circle').transition().duration(500).style('opacity', 0.2);
      //jQuery('.toggleMemberDots')[0].click();
      //sliderTime.value(new Date(1981, 10, 3));
      setMembersTransparent();
      $('#viz2Text').text('For the first time since the 1950s, both chambers had a Republican majority. In reaction, democrats more left sharply.');
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 600, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      setMembersTransparent();
      sliderTime.value(new Date(1983, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 700, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      setMembersTransparent();
      sliderTime.value(new Date(1985, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 800, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      setMembersTransparent();
      sliderTime.value(new Date(1987, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 900, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(1989, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 1000, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(1991, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 1100, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(1993, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 1200, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(1995, 10, 3));
      $('#viz2Text').text('However, since then, the Democrats have been moving further left at a much slower rate than the Republicans.');
    });




// highlight 1995-2011
new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 1700, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(1997, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 1800, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(1999, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 1900, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(2001, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 2000, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(2003, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 2100, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(2005, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 2200, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(2007, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 2300, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(2009, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 2400, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(2011, 10, 3));
      $('#viz2Text').text('Democrats respond to the increased friction from the Republicans. Break their trend and move further left during the end of Obama’s first presidential term.');
    });





// highlight 2011 - 2013
new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 2900, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(2013, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 3000, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(2015, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 3100, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(2017, 10, 3));
    });

new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 3200, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      sliderTime.value(new Date(2019, 10, 3));
    });

// resume everything
new ScrollMagic.Scene({
  triggerElement: "#viz2ToLock",
  triggerHook: 0.4,
  offset: 3400, // move trigger to center of element
  duration: 150,
  triggerHook: 'onLeave'
})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller)
    .on('enter', function(e) {
      jQuery('.toggleCentroid')[0].click();
      setMembersOpaque();
      $('#viz2Text').text('Feel free to explore the visualization. When ready, scroll down.');
    });








new ScrollMagic.Scene({
  triggerElement: "#testPart21",
  triggerHook: 0.4,
  offset: -30, // move trigger to center of element
  duration: 180
})
    .setClassToggle("#testPart21", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

new ScrollMagic.Scene({
  triggerElement: "#testPart22",
  triggerHook: 0.4,
  offset: -30, // move trigger to center of element
  duration: 180
})
    .setClassToggle("#testPart22", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

new ScrollMagic.Scene({
  triggerElement: "#testPart23",
  triggerHook: 0.4,
  offset: -30, // move trigger to center of element
  duration: 180
})
    .setClassToggle("#testPart23", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

new ScrollMagic.Scene({
  triggerElement: "#testPart24",
  triggerHook: 0.4,
  offset: -30, // move trigger to center of element
  duration: 180
})
    .setClassToggle("#testPart24", "changeColor") // add class toggle
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);


// lock image#8
new ScrollMagic.Scene({
  triggerElement: "#imageToLock8",
  duration: 650,
  offset: 300, // move trigger to center of element
})
    .setPin("#imageToLock8", {pushFollowers: false})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);
