let updatePlot = null
let data3 = {
  name: 'node 1',
  children: [
    {
      name: 'node 2',
      children: [
        {
          name: 'node 4'
        }
      ]
    },
    {
      name: 'node 3',
      children: [
        {
          name: 'node 5'
        }
      ]
    }
  ]
}

// function implements chart rendering
// example with rendered check
function drawExample3() {
  const plot = d3.select('#example3')
  // the custom state
  const selected = new Set();
  const r = 40
  const nodeSeparation = 50

  let nodes = null
  let lnkMkr = null

  const height = parseInt(plot.style('height'))
  const width = parseInt(plot.style('width'))

  const zoom = d3.zoom()
    .extent([[0, 0], [width, height]])
    .on('zoom', ({ transform }) => {
      plot.select('#plot-content')
        .attr('transform', transform)
    })

  plot.append('defs')
    .append('circle')
    .attr('id', 'node')
    .attr('r', r)
    .attr('cx', '10')
    .attr('cy', '10')
  
  plot.append('g')
    .attr('id', 'plot-content')

  plot
    .call(zoom.transform, d3.zoomIdentity.translate(350,50).scale(0.5))
    .call(zoom)
  
  const content = plot.select('#plot-content')

  // initial call of setup/render function
  setup()

  function renderItem(selection) {
    selection.append('use')
      .attr('href', '#node')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('fill', getFill)

    selection.append('text')
      .attr('x', d => d.x + 12)
      .attr('y', d => d.y + 15)
      .attr('fill', 'white')
      .style('text-anchor', 'middle')
      .text(d => d.data.name)

    return selection
  }

  function updateItem(selection) {
    selection.selectAll('use')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('fill', getFill)

    selection.selectAll('text')
      .attr('x', d => d.x + 12)
      .attr('y', d => d.y + 15)

    return selection
  }

  function getFill(d) {
    return selected.has(d.data.name) ? 'green' : 'red'
  }

  // function that updates everything that depends on the data
  function setup() {
    nodes = d3.hierarchy(data3, d => d.children)
    lnkMkr = d3.linkHorizontal()
      .x(d => d.x)
      .y(d => d.y)

    d3.tree()
      .nodeSize([r*2 + nodeSeparation, r*2 + nodeSeparation])(nodes)

    content.selectAll('path')
      .data(nodes.links())
      .join('path')
      .attr('d', d => lnkMkr(d))
      .attr('stroke', 'black')
      .attr('fill', 'none')

    content.selectAll('g')
      .data(nodes.descendants(), d => d)
      .join(
        enter => enter.append('g').call(renderItem),
        update => update.call(updateItem).raise(),
      )
      .on('click', function(e, d) {
        selected.add(d.data.name)
        updateItem(d3.select(this))
      })
      .attr('cursor', 'pointer')
  }

  // returning function that redraws the plot after updating the data
  return setup
}

// function changes dataset
function addExample3Data() {
  data3.children.push({
    name: 'created'
  })
  updatePlot()
}

function init() {
  updatePlot = drawExample3() 
}

document.addEventListener('DOMContentLoaded', init, false);