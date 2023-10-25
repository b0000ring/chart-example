---
  cover: 'covers/d3.png'
  title: 'Stacked chart D3 example'
  short: 'D3'
  description: 'Stacked chart D3.js example'
  chart: '/charts/stacked/d3.js'
---

``` js
function makeStacked() {
  //empty data set
  let data = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]

  // max data item value
  const max = 10
  // min data item value
  const min = 0
  // setting values for margins of svg content
  const margin = {top: 30, left: 50, right: 30, bottom: 30}
  // selecting root element for plot
  const svg = d3.select('#chart')
  // getting root element width
  const width = parseInt(svg.style('width')) 
  // getting root element height
  const height = parseInt(svg.style('height')) 

  // creating linear scaling for X axis
  // depends on item count, not values
  const scaleX = d3.scaleLinear()
    // setting X scale domain
    // from 0 to 4 because inner data array length is 5
    .domain([0, 4])
    // setting scale range
    .range([margin.left, width - margin.right])
  // creating linear scaling for Y axis
  const scaleY = d3.scaleLinear()
    // setting Y scale domain
    // Y is representing values so using min and max value
    // max and min should be swapped because value should be represented
    // from down to top
    .domain([max, min])
    .range([margin.top, height - margin.bottom])

  // creating of colors scale
  const scaleColors = d3.scaleQuantize()
      .domain([0, data.length])
      .range([
        '#00b6e9', '#008ae6',  '#4b59d2'
      ]) 

  // creating of X axis
  const axisX = d3.axisBottom(scaleX)
    // setting ticks for x axis
    // according to data array length
    .ticks(5)
    // settin x axis tick format
    .tickFormat(function(d, i) {
      // for better readability increase the value on 1
      // to show values from 1 to 5 (0 to 4 by default)
      return i + 1
    })
  
  // creating of Y axis
  // swapping range values because they should increase
  // from bottom to top. its opposite by default
  const axisY = d3.axisLeft(
    d3.scaleLinear()
      .domain([min, max])
      .range([height - margin.bottom, margin.top])
    ) 
  
  // creating area generator function
  const area = d3.area()

  // applying options to area generator
  area
    // x coord according to data item index
    .x((d, i) => scaleX(i))
    // y0 is static and should be the bottom of the plot
    .y0(height - margin.bottom)
    // y1 is the data item value
    .y1(d => scaleY(d))

  // creating group for plot items
  const items = svg.append('g')

  // creating empty selection
  items.selectAll('path')
    // applying data
    .data(data)
    // joining data to new path elements
    .join('path')
    // setting d attr of every path element by calling area generator
    .attr('d', d => area(d))
    // setting fill color
    .attr('fill', (d, i) => scaleColors(i))
    // setting stroke color
    .attr('stroke', '#00b6e9')
    // setting stroke width
    .attr('stroke-width', 2)

  // creating wrapper element for Y axis
  svg.append('g')
    // calling Y axis component function
    .call(axisY)
    // setting Y axis position to be on the plot left
    // -5 is slight corretion for better visibility
    .attr('transform', `translate(${margin.left - 5}, 0)`)

  // creating wrapper element for X axis
  svg.append('g')
    // calling X axis component function
    .call(axisX)
    // setting X axis position to be on the plot bottom
    // +5 is slight corretion for better visibility
    .attr('transform', `translate(0, ${height - margin.bottom + 5})`)

  // function for showing dynamic data and view change
  // it generates new data, applies to plot and
  // changes the view with animation
  function change() {
    // updating of dataset
    data = data.map(
      (item, i) => item.map(
        () => Math.floor(Math.random() * max / (i + 1))
      )
    )

    // selecting of all path elements on plot
    items.selectAll('path')
      // applying data to items selection
      .data(data) 
      // creating transition
      .transition() 
      // setting transition duration
      .duration(300) 
      // setting new value for d attribute of every path element
      .attr('d', d => area(d))
  }

  // calling change function every second
  setInterval(change, 1000)
}
```