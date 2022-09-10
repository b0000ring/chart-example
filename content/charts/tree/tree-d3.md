---
  cover: 'covers/d3.png'
  title: 'Tree chart D3 example'
  short: 'D3'
  description: 'Tree chart D3.js example'
  chart: '/charts/tree/d3.js'
---

``` js
function makeTree() {
  //data set
  const data = {
    name: 'root',
    color: '#ABDDA4',
    children: [
      {name: 'child 1', color: '#5E4FA2'},
      {
        name: 'child 2',
        color: '#FDAE61',
        children: [
          {name: 'child 4', color: '#3288BD'},
          {name: 'child 5', color: '#66C2A5'}
        ]
      },
      {
        name: 'child 3',
        color: '#E6F598',
        children: [
          {name: 'child 6', color: '#FEE08B'}
        ]
      }
    ]
  }

  // selecting root element for plot
  const svg = d3.select('#chart')
    // setting cursor style
    .style('cursor', 'pointer')

  // getting root element width
  const width = parseInt(svg.style('width')) 
  // getting root element height
  const height = parseInt(svg.style('height')) 

  // tree node height
  const nodeHeight = 50
  // tree node size
  const nodeWidth = 120
  // length of space between nodes
  const nodeSeparation = 30

  // creating zoom behaviour
  const zoom = d3.zoom()
      // setting extent for zooming
      .scaleExtent([1, 2])
      // setting callback event (both scrolling and zooming)
      .on('zoom', onzoom)

  // creating tree hierarchy from the data
  const nodes = d3.hierarchy(data, d => d.children)
  // creating generator for link paths
  // (x and y coords should be swapped for horizontal rendering)
  const lnkMkr = d3.linkHorizontal().x( d => d.y ).y( d => d.x )

  // creating of common component for all plot elements
  const g = svg.append('g')

  svg
    // setting initial transform for plot
    .call(
      // calling zoom.transform manually
      zoom.transform,
      // passing initial transform params by calling translate func
      d3.zoomIdentity.translate(width / 4, height / 2)
    )
    // applying zooming behaviour to plot
    .call(zoom)

  // creating defs element for plot
  // which contain base element 
  // for tree nodes
  svg.append('defs')
    // creating base tree node element
    .append('rect')
    // setting id for base tree node element
    .attr('id', 'node')
    // setting width for nodes
    .attr('width', nodeWidth)
    // setting height for nodes
    .attr('height', nodeHeight)
    // setting border radius
    .attr('rx', '20')
    .attr('ry', '20')
    // setting stroke color
    .style('stroke', 'black')
    // setting stroke width
    .style('stroke-width', 2)


  // applying tree layout to hierarchy
  d3.tree()
    // setting nodes size
    .nodeSize([
      nodeHeight + nodeSeparation,
      nodeWidth + nodeSeparation
    ])(nodes)

  // applying links to the plot
  // creating empty selection of path elements
  const links = g.selectAll('path')
    // applying links data from hierarchy
    .data(nodes.links())
    // getting all new data connections
    .enter()
    // appending real path elements 
    .append('path')
    // setting path d param by using links generator
    .attr('d', d => lnkMkr(d))
    // setting stroke color
    .style('stroke', '#a9a9b3' )
    // setting fill property 
    // (none value because it should be just line)
    .style('fill', 'none')

  // applying nodes elements
  // creating empty selection
  g.selectAll('g')
    // applying nodes data from hierarchy
    // .descendants returns entire hierarchy
    .data( nodes.descendants() )
    // getting all new data connections
    .enter()
    // calling node element component function
    .call(renderItem)

  // component function for tree nodes
  function renderItem(selection) {
    // creating wrapper for node elements
    const g = selection.append('g')
      // setting text positioning style
      .style('text-anchor', 'middle')
      // setting mouseenter callback
      .on('mouseenter', function(e, d) {
        // getting path from root node to current node
        // current node is which has mouseover
        const path = nodes.path(d)

        // changing color for links (path elements)
        // which connects nodes in path
        links
          // setting stroke style
          .style(
            'stroke',
            // checking that both linked nodes are in selected path
            d => path.includes(d.target) && path.includes(d.source) 
              // setting specific color
              ? '#D53E4F' : '#a9a9b3'
          )

        // changing fill color for nodes which in selected path
        // selecting all rect in node elements in plot
        // use elements should be selected because all nodes reusing rect
        // element from defs
        g.selectAll('use')
          // applying fill style for every node element
          .style(
            'fill',
            // checking is element included in selected path
            // and selecting specific color
            d => path.includes(d) ? '#D53E4F' : d.data.color
          )
          
      })
      // setting mouseleave event
      // to reset all styles for links and nodes in plot
      .on('mouseleave', function() {
        g.selectAll('use')
          .style('fill', d => d.data.color)
        
        links.style('stroke', '#a9a9b3')
      })

    // appending node element by using 
    // base rect element from defs
    // appending use element
    g.append('use')
      // setting href param on base element to reuse
      .attr('href', '#node')
      // setting x coord for rect element
      // with some correction for better positioning
      .attr('x', d => d.y - 60 )
      // setting y coord for rect element with some correction
      .attr('y', d => d.x - 25 )
      // setting rect background color
      .style('fill', d => d.data.color)
      
    // appending text element
    g.append('text')
      // coords are swapped for horizontal tree positioning
      // setting x coord
      .attr('x', d => d.y)
      // setting y coord
      .attr('y', d => d.x + 5)
      // setting text
      .text(d => d.data.name)
  }
  // zoom event callback
  function onzoom({ transform }) {
    // setting new transform coords for items container
    // because this is an element which should be
    // changed on zoom or scrolling
    g.attr('transform', transform)
  }
}
```