function makeHeatmap() {
  // max data item value
  const max = 4
  // min data item value
  const min = 1
  // generating dataset
  const data = new Array(64).fill().map(() => (Math.random() * max + min) | 0)
  // how much items could be in row
  const rowLength = 8
  // how much rows will be in plot
  const rows = (data.length / rowLength) | 0

  // setting values for margins of svg content
  const margin = {top: 40, left: 40, right: 30, bottom: 30}

  // selecting svg container
  const svg = d3.select('#chart')
    // applying cursor style for svg container
    .attr('cursor', 'pointer')
    // applying mouseleave event
    .on('mouseleave', function() {
      // finding popup container
      svg.select('#popup')
        // removing popup container
        .remove()
    })

  // getting root element width
  const width = parseInt(svg.style('width')) 
  // getting root element height
  const height = parseInt(svg.style('height'))
  // items width without margins
  const itemsWidth = width - margin.left - margin.right
  // items height without margins
  const itemsHeight = height - margin.top - margin.bottom
  
  // creating linear scaling for X axis
  const scaleX = d3.scaleLinear()
    // setting values domain
    // using row length because tick is one item in row
    .domain([0, rowLength])
    // setting range with using margin
    .range([margin.left, width - margin.right])
  // creating linear scaling for Y axis
  const scaleY = d3.scaleLinear()
    // setting values for domain
    // using rows count because tick is one row
    .domain([0, rows])
    // setting range with using margin
    .range([margin.top, height - margin.bottom])
  // creating color scale
  const scaleColor = d3.scaleQuantize().domain([min, max]).range([
    '#00beef', '#0089df',  '#60a5fa', '#4b59d2'
  ])
  
  // creating X axis
  const axisX = d3.axisTop(scaleX)
    // hiding tick (little line near tick value)
    .tickSize(0)
    // hiding zero value for better design
    .tickFormat((d, i) => i ? i : '')
  // creating Y axis
  const axisY = d3.axisLeft(scaleY)
    .tickSize(0)
    .tickFormat((d, i) => i ? i : '')

  // calculation of item width
  const sizex = itemsWidth / rowLength
  // calculation of item height
  const sizey = itemsHeight / rows

  // creating of empty collection for items
  svg.selectAll('rect')
    // applying data
    .data(data)
    // selecting all new data-element connections
    .enter()
    // appending actual element to every selection item
    .append('rect')
    // calling cell component
    .call(cell)
    // setting mouseenter callback for every item
    .on('mouseenter', function () {
      // selecting of current element
      // (this - here element which triggered the event)
      d3.select(this)
        // setting special color for the element
        .attr('fill', '#ffc008')
        .attr('stroke', '#ffc008')
    })
    // setting mouseleave callback for every item
    .on('mouseleave', function () {
      // selecting of current element
      d3.select(this)
        // setting color based on item value
        .attr('fill', (d, i) => scaleColor(d))
        .attr('stroke', (d, i) => scaleColor(d))
    })
    // setting click event (e - event, v - item value)
    .on('click', (e, v) => {
      // getting pointer coords from event
      const [x, y] = d3.pointer(e)
      // calling popup component function
      showPopup(x, y, v)
    })
  // appending x axis container
  svg.append('g')
    // setting x axis container id
    .attr('id', 'axisx')
    // setting x axis position 
    // sizex / -2 needed to show label in the middle of the item
    .attr('transform', `translate(${sizex / -2}, 30)`)
    // calling x axis component function
    .call(axisX)
    
  // appending y axis container
  svg.append('g')
    // same actions as for x axis
    .attr('id', 'axisy')
    .attr('transform', `translate(30, ${sizey / -2})`)
    .call(axisY)

  // selecting axis domains 
  svg.selectAll('.domain')
    // removing domains to improve visual design
    .remove()
    
  // show popup function (item click callback)
  function showPopup(x, y, value) {
    // selecting old popup
    svg.select('#popup')
      // removing old popup
      .remove()
    // creating container for popup
    const group = svg.append('g')
      // setting id for popup container
      .attr('id', 'popup')
    // creating rect element for popup
    group.append('rect')
      // setting x position
      .attr('x', x)
      // setting y position
      .attr('y', y)
      // setting popup width
      .attr('width', '100px')
      // setting popup height
      .attr('height', '40px')
      // setting popup border radius
      .attr('rx', '10')
      .attr('ry', '10')
      // setting popup background color
      .attr('fill', 'white')
      // setting popup border color
      .attr('stroke', 'black')
    // appending text component to popup container
    group.append('text')
      // setting text value
      .text(`value: ${value}`)
      // setting popup text element coords
      .attr('x', x + 10)
      .attr('y', y + 25)
  }

  // cell component function
  function cell(selection) {
      // setting width for item
      selection.attr('width', sizex)
          // setting height for item
          .attr('height', sizey)
          // setting x coord for item 
          // using i because step in a row is item nubmer
          .attr('x', (d, i) => scaleX(i % rowLength))
          // setting y coord for item
          // using i / rowLength to get current row number
          .attr('y', (d, i) => scaleY((i / rowLength) | 0))
          // setting item color
          .attr('fill', (d, i) => scaleColor(d))
          // setting item border color
          .attr('stroke', (d, i) => scaleColor(d))
  }
}

window.onload = makeHeatmap