---
  cover: 'covers/d3.png'
  title: 'Scatter chart D3 example'
  short: 'Scatter'
  description: 'Scatter chart D3.js example'
  chart: '/charts/scatter/d3.js'
---

``` js
function makeScatter() {
  // max data item value
  const max = 100
  // min data item value
  const min = 0

  // generating dataset
  const data = new Array(100).fill().map(() => ({
      x: (Math.random() * max) | 0,
      y: (Math.random() * max) | 0
  }))

  // setting values for margins of svg content
  const margin = {top: 10, left: 50, right: 10, bottom: 50}

  // selecting svg container
  const svg = d3.select('#chart')
    // applying cursor style for svg container
    .attr('cursor', 'pointer')

  // getting root element width
  const width = parseInt(svg.style('width')) 
  // getting root element height
  const height = parseInt(svg.style('height')) 
  // creating root component for items elements
  const items = svg.append('g')

  // creating linear scaling for X axis
  const scaleX = d3.scaleLinear()
    // setting values domain
    .domain([min, max])
    // setting range with using margin
    .range([margin.left, width - margin.right])
  // creating linear scaling for Y axis
  const scaleY = d3.scaleLinear()
    .domain([min, max])
    .range([margin.top, height - margin.bottom])
  // creating of X axis 
  const axisX = d3.axisBottom(scaleX)
  // creating of Y axis 
  const axisY = d3.axisLeft(scaleY)

  // creating zoom behaviour
  const zoom = d3.zoom()
      // setting extent for scrolling
      .translateExtent([[0, 0], [width, height]])
      // setting extent for zooming
      .scaleExtent([1, 2])
      // setting callback event (both scrolling and zooming)
      .on('zoom', onzoom)

  svg
    // applying zooming behaviour to plot
    .call(zoom)

  // creating of empty collection for items
  items.selectAll('circle')
      // applying data
      .data(data)
      // selecting all new data-element connections
      .enter()
      // appending actual element to every selection item
      .append('circle')
      // setting circle radius
      .attr('r', '5')
      // setting circle fill color
      .attr('fill', '#F46D43')
      // setting circle stroke color
      .attr('stroke', '#FFFFBF')
      // setting item x coord
      .attr('cx', d => scaleX(d.x))
      // setting item y coord
      .attr('cy', d => scaleY(d.y))

  // creating container element for X axis
  svg.append('g')
      // setting x axis position (25 is correction to make it visible)
      .attr('transform', `translate(0, ${height - 25})`)
      //calling x axis component function
      .call(axisX)
      // setting x axis container id
      .attr('id', 'axisx')
  // creating container element for X axis
  svg.append('g').call(axisY)
      // setting y axis position (30 is correction to make it visible)
      .attr('transform', `translate(30, 0)`)
      // setting y axis container id
      .attr('id', 'axisy')

  // zoom event callback
  function onzoom({ transform }) {
    // setting new transform coords for items container
    // because this is an element which should be
    // changed on zoom or scrolling
    items.attr('transform', transform)
    // creating new scale for x with taking to account
    // applied transofrm
    const newScaleX = transform.rescaleX(scaleX)
     // creating new scale for y
    const newScaleY = transform.rescaleY(scaleY)
    // creating new x axis with new scale usage
    const newAxisX = d3.axisBottom(newScaleX)
    // creating new y axis with new scale usage
    const newAxisY = d3.axisLeft(newScaleY)
    // applying new x axis
    d3.select('#axisx').call(newAxisX)
    // applying new y axis
    d3.select('#axisy').call(newAxisY)
  }
}
```