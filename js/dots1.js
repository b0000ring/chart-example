function dots1() {
  let mouseCoords = {}
  let timeout = null
  let svgElement = document.getElementById('dots')
  let width = svgElement.getBoundingClientRect().width
  let height = svgElement.getBoundingClientRect().height
  let scaleX = d3.scaleLinear().domain([0, 100]).range([0, width])
  let scaleY = d3.scaleLinear().domain([0, 100]).range([0, height])
  let data = new Array(500).fill('')
    .map(() => {
      const speedx = (Math.random() + 0.5) / 100
      const speedy = (Math.random() + 0.5) / 100
      const directionx = Math.random() < 0.5
      const directiony = Math.random() < 0.5
      return {
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
        movex: directionx ? -speedx : speedx,
        movey: directiony ? -speedy : speedy,
        opacity: (Math.random() * 5) / 10,
        size: Math.floor((Math.random() * 5)) + 5
      }
    })

  const lightningRadius = 200
  const svg = d3.select('#dots')
    .style('opacity', '0')
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
    .attr('cx', (d) => scaleX(d.x))
    .attr('cy', (d) => scaleY(d.y))
    .style('fill', 'grey')

  function update() {
    const selection = svg.selectAll('circle')
    const opacity = parseFloat(svg.style('opacity'))

    data = data.map(item => {
      return {
        ...item,
        x: item.x + item.movex,
        y: item.y + item.movey,
        movex: scaleX(item.x + item.movex) > width || (item.x + item.movex) < 0 ? item.movex * -1 : item.movex,
        movey: scaleY(item.y + item.movey) > height || (item.y + item.movey) < 0 ? item.movey * -1 : item.movey
      }
    })

    if (opacity < 1) {
      svg.style('opacity', opacity + 0.01)
    }

    selection
      .data(data)
      .attr('opacity', (d) => d.opacity)
      .attr('cx', (d) => scaleX(d.x))
      .attr('cy', (d) => scaleY(d.y))
      .transition()
      .duration(100)
      .attr('opacity', function(d) {
        const {x, y} = this.getBoundingClientRect()
        if(Math.abs(x - mouseCoords.x) < lightningRadius && Math.abs(y - mouseCoords.y) < lightningRadius) {
          return d.opacity * 2
        }

        return d.opacity
      })
  }

  function handleMousemove(event) {
    mouseCoords = {
      x: event.x,
      y: event.y
    }
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

  function changeSize() {
    width = svgElement.getBoundingClientRect().width
    height = svgElement.getBoundingClientRect().height
    scaleX = d3.scaleLinear().domain([0, 100]).range([0, width])
    scaleY = d3.scaleLinear().domain([0, 100]).range([0, height])
  }

  document.addEventListener('mousemove', throttle(handleMousemove, 100));
  resize_ob.observe(container)
  setInterval(update, 30)
}