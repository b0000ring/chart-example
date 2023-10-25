function dots2() {
  let timeout = null
  let svgElement = document.getElementById('dots')
  let width = svgElement.getBoundingClientRect().width
  let height = svgElement.getBoundingClientRect().height
  let offsetx = 0
  let offsety = 0

  const border = 100
  const speed = 3
  const maxDeep = 256

  let data = new Array(100).fill('')
    .map(() => {
      return getDefaultDot()
    })

  const svg = d3.select('#dots')
  const g = svg.append('g')

  const container = document.querySelector('.container')

  const resize_ob = new ResizeObserver(() => {
    clearTimeout(timeout)
    timeout = setTimeout(changeSize, 100)
  })

  g.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', d => d.size)
    .attr('cx', (d) => getCoord(d.x, d.z, width))
    .attr('cy', (d) => getCoord(d.y, d.z, height))
    .style('opacity', '0')
    .style('fill', '#285674')

  function update() {
    const selection = g.selectAll('circle')

    g
      .transition()
      .duration(100)
      .attr('transform', `translate(${offsetx}, ${offsety})`)
  
    data = data.map(item => {
      const x = getCoord(item.x, item.z, width)
      const y = getCoord(item.y, item.z, height)
      if(item.z < 1 || x < -border || y < -border || x > width + border || y > height + border) {
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
      size: Math.floor((Math.random() * 2)) + 2,
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

  function handleMousemove(event) {
    offsetx = (event.x - width / 2) / 10
    offsety = (event.y - height / 2) / 10
  };
  
  function throttle(func, delay) {
    let prev = Date.now() - delay;
    return (...args) => {
      let current = Date.now();
      if (current - prev >= delay) {
        prev = current;
        func.apply(null, args);
      }
    }
  };

  document.addEventListener('mousemove', throttle(handleMousemove, 50));
  resize_ob.observe(container)
  setInterval(update, 30)
}