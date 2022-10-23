let data2 = {
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

function drawExample2() {
  const plot = d3.select('#example2')

  const r = 40
  const nodeSeparation = 50

  const nodes = d3.hierarchy(data2, d => d.children)
  const lnkMkr = d3.linkHorizontal()
    .x(d => d.x)
    .y(d => d.y)

  // everything related to state initilization is hidden 
  // under first render condition
  if(!plot.selectChildren().size()) {
    const height = plot.node().getBoundingClientRect().height
    const width = plot.node().getBoundingClientRect().width

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
      .call(zoom.transform, d3.zoomIdentity.translate(width / 2, 50).scale(0.5))
      .call(zoom)
  }

  // everything related to the update cycle is called every time
  const content = plot.select('#plot-content')

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

  function renderItem(selection) {
    selection.append('use')
      .attr('href', '#node')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('fill', 'red')

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

    selection.selectAll('text')
      .attr('x', d => d.x + 12)
      .attr('y', d => d.y + 15)

    return selection
  }
}

function addExample2Data() {
  data2.children.push({
    name: 'created'
  })
  drawExample2()
}


document.addEventListener('DOMContentLoaded', drawExample2, false);