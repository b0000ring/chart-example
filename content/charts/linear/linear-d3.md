---
  cover: 'covers/d3.png'
  title: 'Linear chart D3 example'
  short: 'D3'
  description: 'Linear chart D3.js example'
  chart: '/charts/linear/d3.js'
---

``` js
function makeLinear() {
  //empty data set
  let data = [0, 0, 0, 0, 0, 0, 0, 0]

  const strokeColor = '#d0d4fc'
  const fillColor = '#285674'

  // max data item value
  const max = 10
  // min data item value
  const min = 0 
  // setting values for margins of svg content
  const margin = {top: 30, left: 50, right: 30, bottom: 60}

  // selecting root element for plot
  const svg = d3.select('#chart')
  // getting root element width
  const width = parseInt(svg.style('width')) 
  // getting root element height
  const height = parseInt(svg.style('height')) 

  // creating linear scaling for X axis
  // data.length is used because scaling for X axis
  // depends on item count, not values 
  const scaleX = d3.scaleLinear()
    .domain([0, data.length - 1])
    .range([margin.left, width - margin.right])
  // creating linear scaling for Y axis
  const scaleY = d3.scaleLinear()
    .domain([min, max])
    .range([margin.bottom, height - margin.top])

  // creating of X axis 
  const axisX = d3.axisBottom(scaleX)
    // setting amount of ticks  according to data items count
    .ticks(data.length)
    // tick format needed for custom value for every tick
    .tickFormat((d, i) => `item ${i + 1}`)
  // creating of Y axis
  // swapping range values because they should increase
  // from bottom to top. its opposite by default
  const axisY = d3.axisRight(
    d3.scaleLinear()
      .domain([min, max])
      .range([height - margin.bottom, margin.top])
  )
 
  // creating an instance of line generator 
  // passing accessors functions
  const lineMaker = d3.line()
    .x((d, i) => scaleX(i))
    .y((d, i) => height - scaleY(d))

  // dot component function
  function dot(selection) {
    // setting radius for dot element
    selection.attr('r', 5)
      // fill dot with color
      .attr('fill', fillColor)
      .attr('stroke', strokeColor)
      // setting x coord
      .attr('cx', (d, i) => scaleX(i))
      // setting y coord
      .attr('cy', d => height - scaleY(d))
  }

   // line component function
  function line(selection) {
    // setting line path by calling line generator instance
    selection.attr('d', lineMaker(data))
      // setting empty line filling
      .attr('fill', 'none')
      //  setting line color
      .attr('stroke', strokeColor)
  }

  // applying line to the chart
  // creating path element for line
  const lineElement = svg.append('path')
    // setting id for lines group
    .attr('id', 'line')
  
  // applying dots to the chart
  // same steps as for lines above
  const circles = svg.append('g')
    .attr('id', 'circles')
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')

  // creating g element for X axis and calling its component function
  svg.append('g').attr('class', 'x-axis').call(axisX)
    // transform in using to move the axis to bottom of the plot
    // +5 is slightly correction to make entire axis visible
    .attr('transform', `translate(0, ${height - margin.bottom + 5})`)
  // applying rotation to x axis labels to make plot more responsive
  d3.selectAll('.x-axis .tick text')
    .attr('transform', 'translate(-20, 20) rotate(-45)')
  // creating g element for Y axis and calling its component function
  svg.append('g').call(axisY)
      // adding slight alignment
      .attr('transform', `translate(${margin.left - 30}, 0)`)

  // calling dot component function and passing circles selection
  dot(circles)
  // calling line component function and passing lineElement selection
  line(lineElement)

  // function for showing dynamic data and view change
  // it generates new data, applies to plot and
  // changes the view with animation
  function change() { 
    // updating of dataset
    data = data.map(() => Math.floor(Math.random() * max))

    // updating view
    // calling dot and line component functions and 
    // passing selections with updated data and transition
    dot(circles.data(data).transition().duration(300))
    line(lineElement.data(data).transition().duration(300))
  }

  // calling change function every second
  setInterval(change, 1000)
}
```