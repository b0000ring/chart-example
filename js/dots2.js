function dots2() {
  let timeout = null
  let svgElement = document.getElementById('dots')
  let width = svgElement.getBoundingClientRect().width
  let height = svgElement.getBoundingClientRect().height

  const speed = 3
  const maxDeep = 256

  let data = new Array(50).fill('')
    .map(() => {
      return getDefaultDot()
    })

  const svg = d3.select('#dots')

  const container = document.querySelector('.container')

  const resize_ob = new ResizeObserver(() => {
    clearTimeout(timeout)
    timeout = setTimeout(changeSize, 100)
  })

  svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', d => d.size)
    .attr('cx', (d) => getCoord(d.x, d.z, width))
    .attr('cy', (d) => getCoord(d.y, d.z, height))
    .style('opacity', '0')
    .style('fill', 'grey')

  function update() {
    const selection = svg.selectAll('circle')
  
    data = data.map(item => {
      const x = getCoord(item.x, item.z, width)
      const y = getCoord(item.y, item.z, height)
      if(item.z < 1 || x < 0 || y < 0 || x > width || y > height) {
        return getDefaultDot()
      }

      return {
        ...item,
        z: item.z - speed
      }
    })

    selection
      .data(data)
      .attr('opacity', d => d.opacity)
      .attr('cx', d => getCoord(d.x, d.z, width))
      .attr('cy', d => getCoord(d.y, d.z, height))
      .style('opacity', d => getOpacity(d.z))
  }

  function getDefaultDot() {
    return {
      size: Math.floor((Math.random() * 5)) + 5,
      x: Math.floor(Math.random() * width - width / 2),
      y: Math.floor(Math.random() * height - height / 2),
      z: Math.random() * maxDeep,
      opacity: 0
    }
  }

  function getOpacity(deep) {
    return 1 / deep * (maxDeep - deep)
  }

  function getCoord(data, deep, size) {
    return Math.floor(data * maxDeep / deep + size / 2)
  }

  function changeSize() {
    width = svgElement.getBoundingClientRect().width
    height = svgElement.getBoundingClientRect().height
  }

  resize_ob.observe(container)
  setInterval(update, 30)
}