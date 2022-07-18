---
  cover: 'covers/d3.png'
  title: 'Network chart D3 example'
  short: 'D3'
  description: 'Network chart D3.js example'
  chart: '/charts/network/d3.js'
---

``` js
function makeNetwork() {
  //data set
  const data = [
    {
      id: 'item1',
      connections: ['item2', 'item3'],
    },
    {
      id: 'item2',
      connections: ['item4'],
    },
    {
      id: 'item3',
      connections: ['item2', 'item1'],
    },
    {
      id: 'item4',
      connections: ['item1'],
    },
    {
      id: 'item5',
      connections: ['item1', 'item4'],
    },
    {
      id: 'item6',
      connections: ['item1'],
    },
  ]

  // selecting root element for plot
  const svg = d3.select('#chart')

  // getting root element width
  const width = parseInt(svg.style('width')) 
  // getting root element height
  const height = parseInt(svg.style('height')) 
  const padding = 90

  // generating network datastructure from the data
  // by using custom function
  const structure = getStructure(data)
  // applying network layout to structure items
  const network = getNetwork(structure)
  // getting all links data between network nodes
  const links = network.map(item => item.getLinks()).flat()
  // creating linear scaling for Y
  const scaleY = d3.scaleLinear()
    .domain([d3.min(network, d => d.y), d3.max(network, d => d.y)])
    .range([padding, height - padding]) 
  // creating linear scaling for X
  const scaleX = d3.scaleLinear()
    .domain([d3.min(network, d => d.x), d3.max(network, d => d.x)])
    .range([padding, width - padding]) 

  // creating of colors scale
  const scaleColors = d3.scaleQuantize()
    .domain([0, network.length])
    .range([
      '#5E4FA2', '#3288BD', '#66C2A5', '#ABDDA4', 
      '#E6F598', '#FFFFBF', '#FEE08B', '#FDAE61',
      '#F46D43', '#D53E4F', '#9E0142'
    ]) 

  // creating drag behaviour
  const dragHandler = d3.drag()
    // setting general drag callback
    .on('drag', function (e, d) {
      // getting mouse pointer coords relatiely svg
      const [x, y] = d3.pointer(e, svg.node())
      // updating coords directly in data object (d param)
      d.x = scaleX.invert(x)
      d.y = scaleY.invert(y)

      // calling update function to redraw the chart
      update()
    })

  // creating wrapper for all chart components
  const items = svg.append('g')

  // render connections between nodes
  // creating empty selection
  items.selectAll('line')
    // applying connections data
    .data(links)
    // applying element-data connections and creating line elements
    .join('line')
    // applying line coords
    .attr('x1', d => scaleX(d.x1))
    .attr('y1', d => scaleY(d.y1))
    .attr('x2', d => scaleX(d.x2))
    .attr('y2', d => scaleY(d.y2))
    // applying lines color
    .attr('stroke', 'black')

  // render nodes
  // creating empty collection
  const nodes = items.selectAll('g')
    //  applying nodes data
    .data(network)
    // applying element-data connections and creating g elements
    // g element used because each node contain circle and text
    // so its a wrapper
    .join('g')
    // setting node element class
    // for future selections
    .attr('class', 'node')

  // appending circles to each node
  nodes.append('circle')
    // applying circle coords
    .attr('cx', d => scaleX(d.x))
    .attr('cy', d => scaleY(d.y))
    // applying circle radius
    .attr('r', '10')
    // applying each circle color
    .attr('fill', (d, i) => scaleColors(i))
    // setting cursor style
    .style('cursor', 'pointer')

  // applying text for each node
  nodes.append('text')
    // setting text value
    .text(d => d.data.id)
    // setting popup text element coords
    // +15 is a slight correction for better visibility
    .attr('x', d => scaleX(d.x) + 15)
    .attr('y', d => scaleY(d.y) + 15)
    

  // applying drag behavious to selection of all circle elements
  // which represents nodes
  dragHandler(svg.selectAll('circle'))

  // function which create structure with linked object
  // from flat data array
  function getStructure(data) {
    const result = {}
    // getting initial items structure
    data.forEach((item, i) => {
      result[item.id] = {
        data: item
      }
    })
    // setting connections
    data.forEach(item => {
      const connections = item.connections.map(item => result[item])
      result[item.id].connections = connections
    })
    return result
  }

  // function which creates network layout from 
  // structured data
  function getNetwork(data) {
    // spacing between nodes
    const spacing = 100
    const result = []

    Object.entries(data).forEach((entry, i) => {
      // getting previous generated node object or
      // default object with coords for the first one
      const prev = i > 0 ? result[i - 1] : {x: 0, y: 0}
      const [, item] = entry
      // generating node coords
      const x = prev.x + spacing
      const y = (prev.y + spacing) * Math.sin(i)
      result.push({
        getLinks,
        ...item,
        x,
        y,
      })
    })

    // function that returns array of objects
    // with coordinates of linked nodes
    function getLinks() {
      return this.connections.map(link => {
        const id = link.data.id
        const connection = result.find(item => item.data.id === id)
        return {
          x1: this.x,
          y1: this.y,
          x2: connection.x,
          y2: connection.y
        }
      })
    }

    return result
  }

  // general update callback
  function update() {
    // generating new links from network layout
    const links = network.map(item => item.getLinks()).flat()

    // render connections 
    const nodes = items.selectAll('.node')
      .data(network)
      .join('g')
    
    items.selectAll('line')
      .data(links)
      .join()
      .attr('x1', d => scaleX(d.x1))
      .attr('y1', d => scaleY(d.y1))
      .attr('x2', d => scaleX(d.x2))
      .attr('y2', d => scaleY(d.y2))

    // render nodes
    nodes.selectAll('circle')
      .attr('cx', d => scaleX(d.x))
      .attr('cy', d => scaleY(d.y))

    nodes.selectAll('text')
      .attr('x', d => scaleX(d.x) + 15)
      .attr('y', d => scaleY(d.y) + 15)
  }
}
```