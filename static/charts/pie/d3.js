function makePie() {
  // empty data set
  let data = [10, 5, 2]
  const padding = 10

  // selecting root element for plot
  const svg = d3.select('#chart')
    .attr('cursor', 'pointer')
  // getting root element width
  const width = parseInt(svg.style('width')) 
  // getting root element height
  const height = parseInt(svg.style('height'))
  // count radius based on width or height (the smallest one) and applying the padding
  const radius = Math.min(width, height) / 2 - padding

  // creating of colors scale
  const scaleColors = d3.scaleQuantize()
    .domain([0, data.length])
    .range([
      '#5E4FA2', '#3288BD', '#66C2A5', '#ABDDA4', 
      '#E6F598', '#FFFFBF', '#FEE08B', '#FDAE61',
      '#F46D43', '#D53E4F', '#9E0142'
    ]) 
  
  // calling d3.pie to get data processing
  // function for pie chart
  const pie = d3.pie()
  // creating an instance of arc generator 
  const arc = d3.arc()
    // setting inner radius
    // value can be increased to make 'donut' chart
    .innerRadius(0)
    // setting outer radius
    .outerRadius(radius)
  // getting pie chart data by passing in to
  // data processing function
  const pieData = pie(data)

  // creating group element for chart content
  const items  = svg.append('g')
    // applying transform to put pie chart to center of svg
    .attr('transform', `translate(${width / 2}, ${height / 2})`)
  // creating empty selection of path elements
  items.selectAll('path')
    // applying processed data
    .data(pieData)
    // selecting all new data-element connections
    .enter()
    // appending actual element to every selection item
    .append('path')
    // setting path shape by calling arc generator instance
    .attr('d', arc)
    // setting color for every pie piece
    .attr('fill', (d, i) => scaleColors(i))
    // applying mouseenter event
    .on('mouseenter', function() {
      // selecting current element
      d3.select(this)
        // setting element opacity
        .attr('opacity', '0.7')
    })
    // applying mouseleave event
    .on('mouseleave', function() {
      // selecting current element
      d3.select(this)
        // setting element opacity
        .attr('opacity', '1')
      
      // selecting old popup
      svg.select('#popup')
        // removing old popup
        .remove()
    })
    // applying mousemove event
    .on('mousemove', function(e, d) {
      // getting pointer coords from event
      const [x, y] = d3.pointer(e)
      // calling popup component function
      showPopup(x, y, d.data)
    })

  // show popup function (item click callback)
  function showPopup(x, y, value) {
    // selecting old popup
    svg.select('#popup')
      // removing old popup
      .remove()
    // creating container for popup
    const group = items.append('g')
      // setting id for popup container
      .attr('id', 'popup')
      .style('pointer-events', 'none')
    // creating rect element for popup
    group.append('rect')
      // setting x position
      .attr('x', x + 10)
      // setting y position
      .attr('y', y + 10)
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
      .attr('x', x + 20)
      .attr('y', y + 35)
  }
}

window.onload = makePie