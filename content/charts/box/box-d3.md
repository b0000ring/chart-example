---
  cover: 'covers/d3.png'
  title: 'D3'
  chart: '/charts/box/d3.js'
---

``` js
function makeBox() {
  //empty data set
  let data = new Array(10).fill()

  // max data item value
  const max = 15
  // min data item value
  const min = 5
  const padding = 10

  // selecting root element for plot
  const svg = d3.select('#chart')
  // getting root element width
  const width = parseInt(svg.style('width')) 
  // getting root element height
  const height = parseInt(svg.style('height')) 

  // creating scale for Y axis
  // because x axis will be static
  const scaleY = d3.scaleLinear()
    .domain([0, max + 5])
    .range([padding, height - padding])

  // creating axis with scale usage
  const axis = d3.axisRight(scaleY)
  // creating wrapper for plot items
  const items = svg.append('g')

  // creating vertical helping line
  items.append('line')
    // applying coords
    .attr('x1', width / 2)
    .attr('y1', padding)
    .attr('x2', width / 2)
    .attr('y2', height-padding)
    // applying line color
    .style('stroke', '#a9a9b3')
    // applying line style (dashing)
    .style('stroke-dasharray', '4')

  // creating top horizontal helping line
  items.append('line')
    // most of the attributes the same
    // as for vertical line
    .attr('x1', width / 3)
    .attr('y1', padding)
    .attr('x2', width / 1.5)
    .attr('y2', padding)
    .attr('stroke', '#a9a9b3')
  // creating bottom horizontal helping line
  items.append('line')
    .attr('x1', width / 3)
    .attr('y1', height - padding)
    .attr('x2', width / 1.5)
    .attr('y2', height - padding)
    .attr('stroke', '#a9a9b3')

  // creating rect element for box
  // we dont really need to connect data
  // to the element itself
  // so there is no direct data binding steps
  items.append('rect')
    // applying id
    .attr('id', 'box')
    // setting x coord (its static)
    .attr('x', width / 4)
    // setting y coord
    // using scaling to get correct positioning from
    // minimum data value (because this is a beginning point) 
    .attr('y', scaleY(d3.min(data)))
    // setting width
    .attr('width', width / 2)
    // setting rect fill color
    .style('fill', '#a9a9b3')
    // setting stroke color
    .style('stroke', 'black')

  // creating line for mean value
  items.append('line')
    // setting id to element
    .attr('id', 'mean')
    // setting line x1 coord (its constant)
    .attr('x1', width / 4)
    // setting initial y1 coord
    // (-10 to hide the line for initial render)
    .attr('y1', -10)
    // setting x2 coord (its constant)
    // also defines the line width
    .attr('x2', width / 2 + width / 4)
    // setting initial y2 coord
    // (-10 to hide the line for initial render)
    .attr('y2', -10)
    // setting stroke color
    .style('stroke', 'black')
    // setting stroke width
    .style('stroke-width', '4')

  // creating g element for Y axis and calling its component function
  svg.append('g')
    .call(axis)

  // function for showing dynamic data and view change
  // it generates new data, applies to plot and
  // changes the view with animation
  function change() {
    // selecting box element by id
    const rect = d3.select('#box')
    // select mean line element by id
    const line = d3.select('#mean')
    // updating of dataset
    data = data.map(() => Math.floor(Math.random() * (max - min)) + min)
    // calculation of mean value from data
    const mean = d3.mean(data)
    
    // changing elements attributes based on new data
    // applying new box attributes
    rect
        // creating transition
        .transition() 
        // setting transition duration
        .duration(300)
        // applying new y coord
        .attr('y', scaleY(d3.min(data)))
        // applying height to box element
        // scaled min value should be substracted from scaled max
        // to get correct box size
        .attr('height', scaleY(d3.max(data)) - scaleY(d3.min(data)))

    // applying new mean line attributes
    line.transition() 
      // setting transition duration
      .duration(300)
      // setting new y1 coord
      .attr('y1', scaleY(mean))
      // setting new y2 coord
      .attr('y2', scaleY(mean))
  }

  // calling change function every second
  setInterval(change, 1000)
}
```