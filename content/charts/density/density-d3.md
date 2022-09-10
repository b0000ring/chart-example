---
  cover: 'covers/d3.png'
  title: 'Density chart D3 example'
  short: 'D3'
  description: 'Density chart D3.js example'
  chart: '/charts/density/d3.js'
---

``` js
function makeDensity() {
  //empty data set
  let data = [0, 0, 0, 0, 0, 0, 0, 0]

  // max data item value
  const max = 10
  // min data item value
  const min = 0 
  const padding = 30
  // selecting root element for plot
  const svg = d3.select('#chart')
  // getting root element width
  const width = parseInt(svg.style('width')) 
  // getting root element height
  const height = parseInt(svg.style('height')) 

  // creating linear scaling for Y
  const scaleY = d3.scaleLinear()
    .domain([max, min])
    .range([padding, height - padding]) 
  // creating linear scaling for X
  // data.length is used because we want scaling by X
  // depends on item count, not values 
  const scaleX = d3.scaleLinear()
    .domain([0, data.length - 1])
    .range([padding, width - padding]) 

  // creating of X axis 
  const axisX = d3.axisBottom(scaleX)

  // creating of Y axis
  // swapping range values because they should increase
  // from bottom to top. its opposite by default
  const axisY = d3.axisRight(
    d3.scaleLinear()
      .domain([min, max])
      .range([height - padding, padding])
  )

  // creating area generator function
  const area = d3.area()

  // applying options to area generator
  area
    // x coord according to data item index
    .x((d, i) => scaleX(i))
    // y0 is static and should be the bottom of the plot
    .y0(height - padding)
    // y1 is the data item value
    .y1(d => scaleY(d))
    // using curveBasis to set curve
    .curve(d3.curveBasis)

  // creating group for plot items
  const items = svg.append('g')

  // creating empty selection
  items.selectAll('path')
    // applying data
    // data is wrapped by array because we need only one
    // data element for one density curve 
    .data([data])
    // joining data to new path element
    .join('path')
    // setting d attr of every path element by calling area generator
    .attr('d', d => area(d))
    // setting fill color
    .attr('fill', '#5E4FA2')

  // creating wrapper element for Y axis
  svg.append('g')
    // calling Y axis component function
    .call(axisY)

  // creating wrapper element for X axis
  svg.append('g')
    // calling X axis component function
    .call(axisX)
    // setting X axis position to be on the plot bottom
    // +5 is slight corretion for better visibility
    .attr('transform', `translate(0, ${height - padding + 5})`)

  // function for showing dynamic data and view change
  // it generates new data, applies to plot and
  // changes the view with animation
  function change() {
    // generating new dataset
    data = data.map(() => Math.floor(Math.random() * max))
    // selecting path element
    items.select('path')
      // applying new dataset
      .data([data])
      // creating transition
      .transition()
      // setting transition duration
      .duration(300)
      // setting new value for d attribute of path element
      .attr('d', d => area(d))
  }

  // calling change function every second
  setInterval(change, 1000)
}
```