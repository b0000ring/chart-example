---
author:
  name: "Alex Chirkin"
date: 2022-10-23
linktitle: D3 Chart lifecycle and state
title: D3 Chart lifecycle and state
type:
- post
- posts
weight: 10
tags: ["blog", "d3", "state", "plot", "lifecycle"]
series:
- blog
aliases:
- /blog/chart-lifecycle/
---

![Tux, the Linux mascot](/covers/state-lifecycle.png)

Integration of D3 data visualizations into front-end applications can be a tricky task, when a plot lifecycle is controlled by the application, 
sometimes it may be unclear how to properly connect the plot and the application.
In this article, I describe some ways to update plots with saving their internal state.

## Plot internal state
When creating a D3 plot to visualize some data it frequently happens that to improve user experience some interactivity should be added. And with interactivity usually comes state and with that, the complexity of the plot lifecycle can increase rapidly. Many different things can be stored in the plot state, like scrolling position, selected elements, zoom value, etc.
Basically, that can be any effect of possible user input not directly related to data changes.

The standard lifecycle for the D3 plot (as for most other libraries) looks like this: 
* Initial render
  * applying data
  * rendering of the plot components
* Update
  * applying new data
  * re-rendering of the plot components
* Destruction
  * cleanup of rendered components and any other possible connections (like subscriptions for events and etc.)

To achieve a saving of the internal state of the plot the lifecycle should be implemented in some specific way. 

## Redraw plot from scratch

For the simple plot, which represents some data without big data processing or the expectation of user input, the destruction step can be used to redraw the entire visualization, instead of separating update logic. This means that the plot should be destroyed and rendered again from scratch on any data update. This approach helps to keep plot rendering logic straightforward, but it also clears any state the plot can store. 

*The Example below shows that zoom and scroll position will be reset after any data update and plot redraw (try to scroll or zoom and then click on the 'Update data' button)*


{{< include-html "static/blog/chart-lifecycle/example1.html" >}}


{{< details "show code example" >}}
  ``` js
  let data = {
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

  function drawExample1() {
    const plot = d3.select('#example1')

    plot.selectAll('*').remove()

    const r = 40
    const nodeSeparation = 50

    const nodes = d3.hierarchy(data, d => d.children)
    const lnkMkr = d3.linkHorizontal()
      .x(d => d.x)
      .y(d => d.y)

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
  }

  // function changes dataset
  function addExample1Data() {
    data.children.push({
      name: 'created'
    })
    drawExample1()
  }

  ```
{{< /details >}}

To avoid state clearing after every update, only a specific part of the plot function should run on data change. There are several ways how this can be achieved. 

## Run state initialization logic on the first render

This way works best if the plot does not contain any state which affects data or is related to data itself (like item selections, user inputs, etc.) but has some state of the plot view (zoom, scrolling, elements positioning, and others like that).

To avoid extraction of update logic and complexity increasing, a condition can be used to execute part of the plot function with initialization of some stateful functionality only on the first run (when the plot is rendered initially).

The concrete condition may be different, it depends on the implementation of the plot. For example check of the root container (like some g element or svg element itself) emptiness can be used for that.

*Try to scroll or zoom and then click on the 'Update data' button, the position will be the same after plot update*

{{< include-html "static/blog/chart-lifecycle/example2.html" >}}


{{< details "show code example" >}}
  ``` js
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
  ```
{{< /details >}}

Pros and cons of this method:
- Pros:
  - Implementation simplicity
  - No need to store the update function for the plot instance
  - The same function can be easily used for different containers, by passing the container as the function param

- Cons:
  - Only the plot and its elements state can be easily stored this way
  - Update logic placed inside the plot function. For complex cases, this can be complicated to support


## Extract update logic into return function

If some more complicated state, like custom data object not directly related to the visualization elements, needs to be stored between updates, one of the possible ways to implement the plot lifecycle is to return update function from the initial render. In that case, the state will be saved in function closure and will be accessible in the update function. 

The main thing to consider is that the update function should be stored and accessible in the application.

*In the example below try to click on some nodes. Their data will be added to the internal Set object and will be used between re-renders to highlight selected nodes with different color*

{{< include-html "static/blog/chart-lifecycle/example3.html" >}}


{{< details "show code example" >}}
  ``` js
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
      .call(zoom.transform, d3.zoomIdentity.translate(250,50).scale(0.5))
      .call(zoom)
    
    const content = plot.select('#plot-content')

    // initial call of render function
    render()

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
    function render() {
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
    return render
  }

  // function changes dataset
  function addExample3Data() {
    data3.children.push({
      name: 'created'
    })
    // calling update function instead of the plot function itself
    updatePlot()
  }

  function init() {
    // saving update function somewhere outside the plot after initial render
    updatePlot = drawExample3() 
  }
  ```
{{< /details >}}

Pros and cons of this method:
- Pros:
  - Any type of state can be saved between updates
  - No need for additional logic for handling different parts of initial and update renders

- Cons:
  - Update function should be stored for the plot instance
  - Separated update function can add complexity to the plot structure


## Implement plot as an object with render and update functions

It is useful to structure the plot logic as a JavaScript class for complicated cases. Splitting render/update logic parts into object methods can help handle complex data changes and visual component updates.
With proper implementation, it is easy to use object methods separately or as a part of a common update logic. 

This way of structuring a plot gives even more advantages in managing the internal plot state. JavaScript objects can have their own properties easily accessible through this keyword inside the object methods. This makes it possible to get and set the state in every method of the plot object or create an entire 'API' inside of the object, for managing the internal state with proper reactions and updates.

*How to create a plot as a JavaScript object is a complex topic, which requires an entire article to explain. The code below is just a draft showcase of possible implementation.*

{{< details "show implementation draft" >}}
  ``` js
    class Plot {
      constructor(state, data, ...otherProps) {
        // common object for internal state
        this.state = {
          ...state,
        }
        // applying initial data
        this.data = data

        // ...other initial props applying...

        this.render()
      }

      render = () => {
        // ...all the initial rendering logic...
      }

      setData = (data) => {
        this.data = data
        this.update()
      }

      setState = (newState) => {
        this.state = {
          ...newState
        }
        this.update()
      }

      update = () => {
        // ... all the update logic...
      }
    }

    const plot = new Plot(/*pass initial props here*/)
    
    plot.setData(newData)
  ```
{{< /details >}}

Pros and cons of this method:
- Pros:
  - For the complex state (for example with update side effects) it is easy to create an internal 'API' for changes handling
  - Plot instance object provides an access to its methods and state, which makes it easier to work with it from the application
  - All the other benefits of classes and objects usage

- Cons:
  - Knowledge of how to work with objects in JavaScript needed
  - Internal complexity of the plot logic can grow significantly

## Conclusion

The problem of a state in D3 charts can be difficult to solve. However, because of the incredible flexibility that the library provides, it is always possible. The exact implementation way should depend on the initial problem complexity and balance between expandability and ease of maintenance.
