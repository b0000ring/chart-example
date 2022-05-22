function init() {
  let timeout = null
  let data = new Array(500).fill('')
    .map(() => ({
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
      movex: Math.random() < 0.5 ? -0.002 : 0.002,
      movey: Math.random() < 0.5 ? -0.002 : 0.002,
      opacity: (Math.random() * 5) / 10,
    }))
  let svg = d3.select('#dots')
  let svgElement = document.getElementById('dots')
  let width = svgElement.getBoundingClientRect().width
  let height = svgElement.getBoundingClientRect().height

  let scaleX = d3.scaleLinear().domain([0, 100]).range([0, width])
  let scaleY = d3.scaleLinear().domain([0, 100]).range([0, height])

  svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', 5)
    .attr('cx', (d) => scaleX(d.x))
    .attr('cy', (d) => scaleY(d.y))

  function update() {
    data = data.map(item => {
      return {
        ...item,
        x: item.x + item.movex,
        y: item.y + item.movey,
        movex: (item.x + item.movex) > width || (item.x + item.movex) < 0 ? item.movex * -1 : item.movex,
        movey: (item.y + item.movey) > height || (item.y + item.movey) < 0 ? item.movey * -1 : item.movey
      }
    })
    const selection = svg.selectAll('circle')
    selection
      .data(data)
      .attr('opacity', (d) => d.opacity)
      .attr('cx', (d) => scaleX(d.x))
      .attr('cy', (d) => scaleY(d.y))
  }


  function reset() {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      width = svgElement.getBoundingClientRect().width
      height = svgElement.getBoundingClientRect().height
    
      scaleX = d3.scaleLinear().domain([0, 100]).range([0, width])
      scaleY = d3.scaleLinear().domain([0, 100]).range([0, height])
    }, 100)
  }
  
  window.onresize = reset
  setInterval(update, 10)
}

window.onload = init