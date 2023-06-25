---
cover: 'covers/pixi.png'
title: 'Scatter chart PIXI.js example'
short: 'PIXI.JS'
description: 'Scatter chart PIXI.js example'
chart: '/charts/scatter/pixi.js'
---

``` js
function makeScatter() {
  // Basic settings for plot customisation
  const padding = 90
  const height = width
  const max = 1000
  // Data item visual element radius
  const r = 5
  const fontSize = 14
  const container = document.getElementById('canvasContainer')
  const axisNames = {
    x: 'valx',
    y: 'valy'
  }
  // Simple dataset with random values
  const data = new Array(1000).fill(null).map((_, i) => ({
    id: i,
    valx: Math.ceil((Math.random() * (max))),
    valy: Math.ceil((Math.random() * (max)))
  }))
  
  // The plot function call
  scatter({
    axisNames,
    container,
    width,
    height,
    data,
    padding,
    r,
    max, 
    fontSize
  })
}

window.onload = init

// Main plot function
// Contains general rendering logic and interactivity update callback
function scatter(params) {
  // Extracting parameters used in the main function
  const { container, data, max, ...options } = params

  // Getting scale function for horizontal values
  const scalex = new Scale(
    // Values range
    [0, max],
    // Plot horizontal size range
    [options.padding, options.width - options.padding]
  )

  // Getting scale function for vertical values
  const scaley = new Scale(
    // Values range
    [0, max],
    // Plot vertical size range
    [options.padding, options.height - options.padding]
  )

  // Creating the default PIXI app
  const app = new PIXI.Application({
    // PIXI app container width
    width: options.width,
    // PIXI app container height
    height: options.height,
    // PIXI app container background
    background: '#2e2e2e'
  })

  // Getting popup container component and methods
  const { popup, ...popupMethods } = getPopup(options)

  // Getting dots container with items
  const dots = renderDots(
    // Using scale functions on each data item to get values from coordinates
    data.map(item => ({
      ...item,
      x: scalex.scale(item[options.axisNames.x]),
      y: scaley.scale(item[options.axisNames.y])
    })),
    // Passing popupMethods as parameters to bind popup event to items interactions
    popupMethods,
    // Passing other plot options
    options
  )

  // Getting xAxis container and elements using scalex
  let axisX = getAxisX(scalex, options)

  // Getting yAxis container and elements using scaley
  let axisY = getAxisY(scaley, options)

  // Getting interactivity callbacks from Interactivity instance
  const {
    zoom,
    startScroll,
    stopScroll,
    onScroll
    // Passing onInteraction callback as the constructor parameter
    // (which will be called after each interaction event is fired)
  } = new Interactivity(onInteraction)

  // Applying interactivity events on app container
  app.view.addEventListener('mousedown', startScroll, true)
  app.view.addEventListener('mouseup', stopScroll, true)
  app.view.addEventListener('mousemove', onScroll, true)
  // Touch events need to get initial touch with coordinates first
  app.view.addEventListener('touchstart', (e) => startScroll(e.touches[0]), true)
  app.view.addEventListener('touchend', (e) => stopScroll(e.touches[0]), true)
  app.view.addEventListener('touchmove', (e) => onScroll(e.touches[0]), true)
  app.view.onwheel = zoom

  // Applying plot components to the app
  app.stage.addChild(dots, axisX, axisY, popup)

  // Adding the application canvas to the container element
  container.appendChild(app.view)

  // Creating the onInteraction callback
  // Offset represents the current plot x and y coordinate offsets
  // (value does not take scale into account)
  // Scale represents the current plot scale
  function onInteraction(offset, scale) {
    // Setting the scale of the data items container
    // (only data items need to be scaled visually)
    dots.scale.set(scale, scale)

    // Removing outdated axes
    app.stage.removeChild(axisX, axisY)

    // Applying the new offset to the data items container
    // (only data items need to be moved visually)
    dots.x = offset.x
    dots.y = offset.y

    // Calculating the new scale data values range
    // This must be done to recalculate axes values
    const newMaxX = scalex.invert(
      (scalex.scale(max) / scale) - (offset.x / scale)
    )
    const newMinX = scalex.invert(
      (scalex.scale(1) / scale) - (offset.x / scale)
    )
    const newMaxY = max - scaley.invert(
      (scaley.scale(1) / scale) - (offset.y / scale)
    )
    const newMinY = max - scaley.invert(
      (scaley.scale(max) / scale) - (offset.y / scale)
    )

    // Creating new horizontal and vertical scales with the new data range values
    const newScaley = new Scale(
      [newMinY, newMaxY],
      [options.padding, options.height - options.padding]
    )
    const newScalex = new Scale(
      [newMinX, newMaxX],
      [options.padding, options.width - options.padding]
    )

    // Creating new axes with recalculated scales
    // This way axes will show values taking into account
    // the updated shift and scale values
    axisX = getAxisX(newScalex, options)
    axisY = getAxisY(newScaley, options)

    // Applying the new axes to the app container
    app.stage.addChild(axisX, axisY)
  }
}

// Function that creates a container for data item elements
// and adds them to it
function renderDots(data, handlers, options) {
  // Creating the main container for data items
  const container = new PIXI.Container()

  // Getting necessary parameters from the options object
  const { r, axisNames } = options

  // Getting interactivity handlers from the handlers parameter
  const { showPopup, hidePopup } = handlers

  // Calling the renderDot function for each data item
  data.forEach(renderDot)

  // Returning the container with data items
  return container

  // Function that adds data item graphics to the data items container
  function renderDot(data) {
    // Creating PIXI graphics for the data item
    const dot = new PIXI.Graphics()

    // Setting the event mode to 'dynamic' so
    // interactivity events can be called for this graphics
    dot.eventMode = 'dynamic'

    // Adding item data to the current graphics object as a custom property,
    // so this data can be used later in interactivity events
    dot.__data__ = data

    // Setting the cursor style on element hover
    dot.cursor = 'pointer'

    // Setting the element line style
    dot.lineStyle(2, 0xBB86FC, 1)

    // Setting the element fill (background) style
    dot.beginFill(0x755A96, 1)

    // Drawing the actual graphic (circle) in the graphics element
    // For the y coordinate, the position is calculated
    //  from the bottom of the canvas as values should grow from bottom to top
    dot.drawCircle(data.x, options.height - data.y, r)

    // Setting interactivity handlers for the graphic element
    dot.onmouseenter = onmouseenter
    dot.onmouseleave = onmouseleave

    // Adding the graphic element for the specific data item
    // to the data items main container
    container.addChild(dot)
  }

  // Creating the mouseenter event handler
  // e - PIXI event object
  // 'this' in this function will refer to the graphic element
  // for which the event handler was called
  function onmouseenter(e) {
    // Setting the tint for the item element to 'highlight'
    // the element that was hovered by the pointer
    this.tint = 0xBB86FC

    // Getting the original browser event object
    // which contains global pointer coordinates
    const event = e.originalEvent

    // Calling the showPopup interactivity handler,
    // which renders a popup with the interactivity event target data
    showPopup(
      // Creating the popup content from the data info 
      // that was stored in the graphic element
      `id: ${this.__data__.id}
${axisNames.x}: ${this.__data__[axisNames.x]}
${axisNames.y}: ${this.__data__[axisNames.y]}
      `,
      // Passing the pointer coordinates from the original event object,
      //  so the popup will be rendered where the pointer is
      event.global.x,
      event.global.y
    )
  }

  // Creating the mouseleave event handler
  function onmouseleave() {
    // Removing the element 'highlight'
    this.tint = 0xFFFFFF
    // Calling the hidePopup interactivity handler
    // to remove the popup with the selected item data
    hidePopup()
  }
}

// Function that creates a container with the y-axis and its elements
function getAxisY(values, { height, padding, fontSize, axisNames }) {
  // Count of ticks that will be rendered on the axis
  const steps = 10;

  // Initial axis coordinates (top-left corner, accounting for padding)
  const startx = padding;
  const starty = padding;

  // Calculating the total length of the axis
  // It should have a length of the total height minus padding
  // and minus the distance to the start y-coordinate
  const length = height - padding - starty;

  // Calling the general getAxis function to get the axis container
  // and the axis line of a specific size
  const axis = getAxis(1, length);

  // Calling the getTicks function that creates the ticks container,
  // calculates the values, and adds the tick elements to the container
  const ticks = getTicks(values, steps, fontSize);

  // For every tick, calling the applyTickCoord function
  // that applies the tick coordinates
  ticks.children.forEach(applyTickCoord);

  // Slight offset of the entire ticks for better visibility
  ticks.x -= 10;

  // Calling the getLabel function
  // that creates the label object for the axis
  const label = getLabel(axisNames.y, fontSize + 4);

  // Applying the label coordinates
  label.x = -label.width / 2;
  label.y = -label.height * 2;

  // Adding the ticks and label to the axis container
  axis.addChild(ticks, label);

  // Applying the axis coordinates
  axis.x = startx;
  axis.y = starty;

  // Returning the axis container
  return axis;

  // Function that applies the tick coordinates for the Y axis
  function applyTickCoord(tick, i) {
    // Calculation of the width of one step (tick)
    const stepWidth = length / (steps - 1);

    // Calculating the offset for each step
    const offset = stepWidth * i;

    // Calculating the x-coordinate (to the left from the axis line)
    tick.x = -tick.width;

    // Calculating the y-coordinate for the tick (from bottom to top)
    tick.y = (height - padding * 2) - offset - fontSize / 2;
  }
}

// Function that creates a container with the x-axis and its elements
// The base logic is the same as in getAxisY 
// but with different coordinate calculations
function getAxisX(values, { width, height, padding, fontSize, axisNames }) {
  const steps = 10;
  const startx = padding;
  const starty = height - padding;
  const length = width - padding - startx;
  const axis = getAxis(length, 1);
  const ticks = getTicks(values, steps, fontSize);
  const stepWidth = length / (steps - 1);

  // For every tick, calling the applyTickCoord function
  // that applies the tick coordinates
  ticks.children.forEach(applyTickCoord);

  // Slight offset for better visibility (below the axis line)
  ticks.y += 10;

  // Calling the getLabel function
  // that creates the label object for the axis
  const label = getLabel(axisNames.x, fontSize + 4);

  // Applying the label coordinates
  label.x = length + label.width / 2;
  label.y = -label.height / 2;

  // Adding the ticks and label to the axis container
  axis.addChild(ticks, label);

  // Applying the axis coordinates
  axis.x = startx;
  axis.y = starty;

  // Returning the axis container
  return axis;

  // Function that applies the tick coordinates for the X axis
  function applyTickCoord(tick, i) {
    const offset = stepWidth * i;

    tick.x = offset - tick.width / 2;
    tick.y = 0;
  }
}

// Function that creates an axis label object
function getLabel(name, fontSize) {
  // Creating a label text object by calling PIXI.Text
  const label = new PIXI.Text(name, {
    // Applying text options
    fill: 0xFFFFFF,
    fontSize: fontSize,
    fontWeight: 'bold'
  });

  // Returning the label object
  return label;
}

// Function that creates an axis container and axis line
function getAxis(endx, endy) {
  // Creating the axis container
  const container = new PIXI.Container();
  // Creating the axis line graphics
  const graphics = new PIXI.Graphics();

  // Setting the axis line style
  graphics.lineStyle(1, 0xFFFFFF, 1);
  // Setting the line fill color (if it will be wider than 1 px)
  graphics.beginFill(0xFFFFFF, 1);
  // Drawing the axis line by calling the drawRect function
  graphics.drawRect(0, 0, endx, endy);
  // Adding the axis line to the axis container
  container.addChild(graphics);

  // Returning the axis container
  return container;
}

// Function that creates an axis ticks container and fills it with calculated ticks
function getTicks(scale, steps, fontSize) {
  // Creating the ticks container
  const container = new PIXI.Container();
  // Getting the axis data range from the scale as these values are used to create the scale
  const range = scale.valueRange;
  // Calculating and rounding the final (biggest) value
  const finalValue = Math.ceil(range[1] / 10) * 10;
  // Calculating the value for each step
  const step = (finalValue - range[0]) / (steps - 1);

  // Creating a temporary ticks array that will be used for value calculations
  Array.from({ length: steps }).forEach((_, i) => {
    // Calling the getTickValue function that returns the value for each tick based on its position
    const value = getTickValue(i);
    // Calling the getTick function that creates the graphical tick object
    const tick = getTick(value);
    // Adding the tick object to the ticks container
    container.addChild(tick);
  });

  // Returning the ticks container
  return container;

  // Helper function for getting the tick value based on its position in the line
  function getTickValue(position) {
    // Calculating the tick value
    const value = range[0] + position * step;
    // Rounding the tick value and returning it
    return Math.ceil(value / 10) * 10;
  }

  // Function that creates the tick graphical object
  function getTick(value) {
    // Returning the tick object using the PIXI.Text function
    return new PIXI.Text(value, {
      // Applying tick options
      fill: 0xFFFFFF,
      fontSize: fontSize
    });
  }
}
// Function that returns a container and handlers for the popup
function getPopup({ fontSize }) {
  // Setting the internal popup padding
  const padding = 20;
  // Creating the general popup container
  const popup = new PIXI.Container();
  // Creating the popup graphics object
  const wrapper = new PIXI.Graphics();
  // Creating the internal popup content object
  let text = new PIXI.Text('', {
    // Setting the popup content options
    fill: 0xFFFFFF,
    fontSize: fontSize
  });

  // Applying the popup graphics and content objects to the container
  popup.addChild(wrapper, text);

  // Returning the popup container and handlers
  return {
    popup,
    hidePopup,
    showPopup
  };

  // Handler to be called when the popup should be opened
  function showPopup(data, x, y) {
    // Setting the popup text content
    text.text = data;
    // Setting the popup text content coordinates
    text.x = x + padding;
    text.y = y + padding;

    // Making the popup container graphics visible by drawing it
    // Setting the container border style
    wrapper.lineStyle(1, 0xFFFFFF, 1);
    // Setting the container background style
    wrapper.beginFill(0x2E2E2E, 1);
    // Drawing the container rectangle with a size to fit the popup text
    wrapper.drawRect(x, y, padding * 2 + text.width, padding * 2 + text.height);
  }

  // Handler to be called when the popup should be hidden
  function hidePopup() {
    // Removing the popup text from the container
    text.text = '';
    // Clearing the popup container graphics
    wrapper.clear();
  }
}

```

``` js
// This is a class that contains state and an API for interactive plot calculations
class Interactivity {
  // Property that stores the scale (zoom) value
  scale = 1
  // Property that stores the current offset value
  offset = {
    x: 0,
    y: 0,
  }
  // Property that stores the total (global) offset
  // It stores the offset value before the current scrolling
  _totalOffset = {
    x: 0,
    y: 0,
  }
  // Property that contains the mouse position
  // at the moment of scrolling start
  _mousePosition = {
    x: 0,
    y: 0
  }
  // Property that indicates whether the mouse button is pressed
  isDown = false
  // Property that will contain the update callback
  // The value will be assigned in the constructor
  onUpdate

  constructor(onInteraction) {
    // Assigning the update callback to its property
    this.onUpdate = onInteraction
  }

  // Zoom handler that should be called on the onwheel event in PIXI
  zoom = (e) => {
    // Scale borders
    const scaleMin = 1
    const scaleMax = 2
    // Getting the rounded value of how much was 'scrolled'
    const path = Math.floor(e.deltaY)
    // Calculating the scale change step
    const scaleStep = path / 10000
    // Calculating the new scale value
    const newScale = this.scale + scaleStep

    // Checking scale borders to prevent excessive scaling
    if(newScale > scaleMax || newScale < scaleMin) return

    // Setting the new scale
    this.scale = newScale
    // Calling the update handler
    this.update()

    // Returning false to prevent page scrolling
    return false
  }

  // Scroll start handler that needs to be assigned
  // to the app container's mousedown event
  startScroll = (e) => {
    // Checking if scrolling is not in progress to prevent conflict
    if(!this.isDown) {
      // Setting the isDown property to indicate
      // that the mouse button is pressed
      this.isDown = true
      // Setting the mouse position at the moment of scrolling start
      this._mousePosition = {
        x: e.clientX,
        y: e.clientY
      }
    }
  }

  // Scroll stop handler that needs to be assigned
  // to the app container's mouseup event
  stopScroll = () => {
    // Checking if scrolling is in progress
    if(this.isDown) {
      // Setting the isDown property to false
      // to indicate that the mouse button is not pressed
      this.isDown = false
      // Setting the total offset data
      // that will be used for the next scrolling
      this._totalOffset = {
        ...this.offset
      }
    }
  }

  // Scroll handler that needs to be assigned to the app container's mousemove event
  onScroll = (e) => {
    // Checking if scrolling is in progress
    if(this.isDown) {
      // Calculating and saving the new offset coordinates
      this.offset.x = -(this._mousePosition.x - e.clientX) + this._totalOffset.x
      this.offset.y = -(this._mousePosition.y - e.clientY) + this._totalOffset.y
      // Calling the update handler
      this.update()
    }
  }

  // Update handler
  update() {
    // Calling the onUpdate callback and passing offset and scale data to it
    this.onUpdate(this.offset, this.scale)
  }
}
```

``` js
// This is a class that provides an API for value scaling calculations between two ranges
class Scale {
  // Property that stores the range of possible values
  valueRange = null
  // Property that stores the target range
  targetRange = null
  // Property that stores the scaling factor
  m = 0

  constructor(valueRange, targetRange) {
    // Save the value and target ranges
    this.valueRange = valueRange
    this.targetRange = targetRange
    // Calculate and save the scaling factor
    this.m = (1.0 * targetRange[1] - targetRange[0]) / (valueRange[1] - valueRange[0])
  }

  // A method that allows scaling a value from the value range
  // to a value in the target range
  scale(num){
    // Calculate and return the scaled value
    return this.targetRange[0] + (
      this.m * (num - this.valueRange[0])
    );
  }

  // A method that allows inverting a scaled value
  // to its original value in the original range
  invert(num){
    // Calculate and return the original value
    return (num - this.targetRange[0]) / this.m + this.valueRange[0]
  }
}
```
