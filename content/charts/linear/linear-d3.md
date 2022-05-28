---
  cover: 'covers/d3.png'
  title: 'D3'
  chart: '/charts/linear/d3.js'
---

``` js
function makeLinear() {
  //empty data set
  let data = [0, 0, 0, 0, 0, 0, 0, 0]

  // max data item value
  const max = 10
  // min data item value
  const min = 0 
  const paddingY = 50
  const paddingX = 50

  // selecting root element for plot
  const svg = d3.select('#chart')
  // getting root element width
  const width = parseInt(svg.style('width')) 
  // getting root element height
  const height = parseInt(svg.style('height')) 

  // creating linear scaling for X
  // data.length is used because scaling by X
  // depends on item count, not values 
  const scaleX = d3.scaleLinear()
    .domain([0, data.length])
    .range([paddingX, width - paddingX])
  // creating linear scaling for Y
  const scaleY = d3.scaleLinear()
    .domain([min, max])
    .range([paddingY, height - paddingY])

  // creating of X axis 
  const axisX = d3.axisBottom(scaleX)
    // tick format needed for custom value for every tick
    // i < data.length needed to hide the last unnecessary tick label
    .tickFormat((d, i) => i < data.length ? `item ${i + 1}` : '')
  // creating of Y axis
  // swapping range values because they should increase
  // from bottom to top. its opposite by default
  const axisY = d3.axisRight(
    d3.scaleLinear()
      .domain([min, max])
      .range([height - paddingY, paddingY])
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
      .attr('fill', '#9E0142')
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
      .attr('stroke', '#3288BD')
  }

  // applying lines to the chart
  // creating group element for lines
  const lines = svg.append('g')
    // setting id for lines group
    .attr('id', 'lines')
    // creating empty selection of path elements
    .selectAll('path')
    // applying data
    .data(data)
    // selecting all new data-element connections
    .enter()
    // appending actual element to every selection item
    .append('path')
  
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
    .attr('transform', `translate(0, ${height - paddingY + 5})`)
  // applying rotation to x axis labels to make plot more responsive
  d3.selectAll(".x-axis .tick text")
    .attr("transform", "translate(-20, 20) rotate(-45)")
  // creating g element for Y axis and calling its component function
  svg.append('g').call(axisY)

  // calling dot component function and passing circles selection
  dot(circles)
  // calling line component function and passing circles selection
  line(lines)

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
    line(lines.data(data).transition().duration(300))
  }

  // calling change function every second
  setInterval(change, 1000)
}
```