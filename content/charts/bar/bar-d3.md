---
  cover: 'covers/d3.png'
  title: 'Bar chart D3 example'
  short: 'D3'
  description: 'Bar chart D3.js example'
  chart: '/charts/bar/d3.js'
---

``` js
function makeBar() {     
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
  // calculating width for each bar
  const barWidth = (width - paddingX * 2) / data.length
  // creating linear scaling for Y
  const scaleY = d3.scaleLinear()
    .domain([min, max])
    .range([paddingY, height - paddingY]) 
  // creating linear scaling for X
  // data.length is used because we want scaling by X
  // depends on item count, not values 
  const scaleX = d3.scaleLinear()
    .domain([0, data.length])
    .range([paddingX, width - paddingX]) 
  // creating of colors scale
  const scaleColors = d3.scaleQuantize()
      .domain([0, data.length])
      .range([
        '#5E4FA2', '#3288BD', '#66C2A5', '#ABDDA4', 
        '#E6F598', '#FFFFBF', '#FEE08B', '#FDAE61',
        '#F46D43', '#D53E4F', '#9E0142'
      ]) 
  // creating of X axis 
  const axisX = d3.axisBottom(scaleX)
    // tick format needed for custom value for every tick
    // i < data.length needed to hide the last unnecessary tick label
    .tickFormat((d, i) => i < data.length ? `data ${i + 1}` : '')
    .tickSize(0)
  // creating of Y axis
  // swapping range values because they should increase
  // from bottom to top. its opposite by default
  const axisY = d3.axisRight(
    d3.scaleLinear()
      .domain([min, max])
      .range([height - paddingY, paddingY])
    ) 

  // creating empty selection
  svg.selectAll('rect') 
      // applying data
      .data(data) 
      // selecting all new data-element connections
      .enter() 
      // appending actual element to every selection item
      .append('rect')
      // setting x coord to element
      .attr('x', (d, i) => scaleX(i))
      // setting y coord to element 
      // substraction from height because by design
      // it should be placed at the bottom of the plot
      .attr('y', d => height - scaleY(d)) 
      // setting element width 
      // padding * 2 because applied padding
      //  from both sides should be taken into account
      .attr('width', barWidth)
      // setting element height
      .attr('height', d => scaleY(d) - paddingY) 
      // filling element with color from color scale
      .attr('fill', (d, i) => scaleColors(i)) 

  // creating g element for Y axis and calling its component function
  svg.append('g').call(axisY)
  // creating g element for X axis and calling its component function
  svg.append('g').attr('class', 'x-axis').call(axisX)
      // transform in using to move the axis to bottom of the plot
      // -1 is slightly correction to make entire axis visible
      .attr('transform', `translate(0, ${height - paddingY})`) 
  // applying rotation to x axis labels to make plot more responsive
  d3.selectAll('.x-axis .tick text')
    // applying some transform to x axis label for better readability
    .attr('transform', 'translate(20, 20) rotate(-45)')

  // function for showing dynamic data and view change
  // it generates new data, applies to plot and
  // changes the view with animation
  function change() {
      // selecting all items (which is rect elements in view)
      const rect = d3.selectAll('rect')
      // updating of dataset
      data = data.map(() => Math.floor(Math.random() * max))
      
      // applying data to items selection
      rect.data(data) 
          // creating transition
          .transition() 
          // setting transition duration
          .duration(300) 
          // updating every item height
          .attr('height', d => scaleY(d) - paddingY) 
          // updating every item y position
          .attr('y', d => height - scaleY(d))
  }

  // calling change function every second
  setInterval(change, 1000)
}
```