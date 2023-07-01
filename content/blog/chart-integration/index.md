---
author:
name: "Alex Chirkin"
date: 2023-06-03
linktitle: Chart integration for modern web applications
title: Chart integration for modern web applications
type:
- post
- posts
weight: 10
tags: ["blog", "chart", "spa", "application", "data", "interface"]
series:
- blog
aliases:
- /blog/chart-integration/
---

![Chart integration](/covers/plot-integration.png)


## Introduction
Integrating a chart into an application may appear easy task at first. If you have a container ready for the chart, all you need to do is include the necessary chart assets in a bundle and use them to render the chart. This approach works well for basic scenarios where you only need to provide data to a chart function and visualize it.

However, things can get more challenging when your chart requires responsiveness to user actions or data updates. If the application's rendering flow is beyond your control or if you need to implement additional logic to handle actions or updates, the integration task becomes more complex.

In this short article, I will demonstrate the power of web components usage to solve chart integration difficulties.

## Wrapper libraries
One effective solution is to use specific libraries that connect chart libraries to framework APIs. For example, if you need to render a D3 chart within a React application component, you can use [react-d3-library](https://react-d3-library.github.io/). Similarly, [Vue-ECharts](https://github.com/ecomfe/vue-echarts) can be used to integrate ECharts plot with Vue.

These libraries typically provide an interface for handling data, configuration, and additional options such as optimization and event management. In the majority of cases, if such a library (preferably a reliable one) exists for your technology stack, it is the recommended approach for connecting a chart to an application.

Besides, wrapper libraries offer several other benefits that can enhance the development experience:

- Improved rendering optimization: Wrapper libraries often optimize the rendering process, whenever possible, resulting in better performance and efficiency.
- Configuration presets: These libraries typically provide pre-configured settings for common use cases.
- Framework syntax support: Wrapper libraries support of popular framework syntaxes such as JSX or Vue templates.
- Easy-to-use API: Wrapper libraries offer a user-friendly and intuitive API.

However, it's important to consider the drawbacks associated with this approach:

- Additional dependency: Using a wrapper library introduces an extra dependency into the project, which may have its own bugs or implementation issues.
- Insufficient API coverage: In some cases, the provided API of the wrapper library may not cover all the required functionalities or customization options.
- Limited reusability: Plots that were integrated with wrapper libraries usage can be challenging to reuse in applications built with different frameworks or framework versions.

## Web Components
To avoid these drawbacks and create a chart as an independent application component with its own API, Web Components can be used.

> Web Components are reusable and customizable building blocks for web applications. They enable developers to create encapsulated components that can be used across different projects and frameworks.

Web Components offer a set of benefits for chart creation:

- Cross-framework support: By encapsulating the chart within a Web Component, it becomes compatible with the majority of modern frameworks without requiring any modifications.
- Enhanced implementation encapsulation: Web Component contain all the visualization logic within themselves, ensuring isolation from the main application. This prevents conflicts, reduces module dependencies, and eliminates unnecessary side-effects. The chart becomes a self-contained entity that can be easily managed and maintained.
- Customizable API: Web Components provide way to create a flexible and customizable chart API to handle complex data and events flow.
- Native technology: Web Components are part of web standards, making them available without the need for external dependencies and versioning.

### Example
Below is a simple example of integrating a D3 chart into a React application using Web Components.

In this example, the plot is re-rendered when there is a change in data within the React component.

{{< include-html "static/blog/chart-integration/plot.html" >}}

{{< details "Show React component code" >}}
  ``` js
  import { useEffect, useRef, useState } from 'react'
  import './plot'

  const max = 100

  function App() {
    const [data, setData] = useState([])
    // creating ref to store a link to Web Component with plot API
    const ref = useRef(null)

    useEffect(() => {
      // adding initial data
      addData()
    }, [])

    // in this useEffect when data is changed
    // update method will be called from plot Web Component API
    useEffect(() => {
      if(!ref.current) return

      ref.current.update(data)
    }, [data])

    function addData() {
      const newData = [...data];
      const newItem = {}
      newItem.x = Math.ceil((Math.random() * (max)))
      newItem.y = Math.ceil((Math.random() * (max)))
      newData.push(newItem)

      setData(newData)
    }

    return (
      <div>
        <button onClick={addData}>add item</button>
        <d3-plot ref={ref}></d3-plot>
      </div>
    )
  }

  export default App
  ```
{{< /details >}}

{{< details "Show D3 plot Web Component code" >}}
  ``` js
  import * as d3  from 'd3'

  const strokeColor = '#bb86fc'
  const fillColor = '#755a96'
  const padding = 30
  const max = 100

  export class D3Plot extends HTMLElement {
    container = null
    data = null

    // plot rendering function
    renderPlot() {
      // to simplify the solution the plot content will be erased
      // during each render to clear previous state visualisation
      if(!this.data) return

      const plot = d3.select(this.container)
      plot.selectAll('*').remove()
      const wrapper = plot.append('g')

      const width = parseInt(plot.style('width')) 
      const height = parseInt(plot.style('height')) 

      const scaleY = d3.scaleLinear()
        .domain([0, max])
        .range([padding, height - padding]) 
  
      const scaleX = d3.scaleLinear()
        .domain([0, max])
        .range([padding, width - padding]) 

      wrapper.selectAll('circle')
        .data(this.data)
        .join('circle')
        .attr('cx', d => scaleX(d.x))
        .attr('cy', d => scaleY(d.y))
        .attr('r', 10)
        .attr('stroke', strokeColor)
        .attr('fill', fillColor)

    }

    // this is a part of Web Component lifecycle
    // this method will be called after component mounting
    connectedCallback() {
      this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

      this.renderPlot()
      this.appendChild(this.container)
    }

    // custom API method that must be called on data change
    // to re-render the plot
    update(data) {
      this.data = data
      this.renderPlot()
    }
  }

  // defining web component so it can be used in the application
  window.customElements.define('d3-plot', D3Plot)
  ```
{{< /details >}}

Two major parts of this example are React component and Web Component with plot implementation.

The React component stores data and also includes a button to modify it. Additionally, it integrates a plot Web Component by rendering it as a standard JSX element and using a ref (by the useRef hook) to obtain the element object for future API usage.

Plot Web Component controls plot container mounting and also provides an API for data update handling.
It also can store any local state that plot needs, like some user input result, calculations related on data, etc.
Finally, any custom handlers can be added to react on user input, just by assigning them as the element property:

``` js
  ref.current.onSelect = (element) => console.log(element)
```

and this function will be available in any place inside of the Web Component

``` js
  this.onSelect(element)
```

For highly complex interactions, custom events can be used. These events are part of the native web API and enable seamless event subscription and publication between different modules.

Some common drawbacks of Web Components usage for plot integration:

- To work effectively with Web Components, it is necessary to understand their lifecycle and API.
- Manual integration with frameworks, such as the use of refs in the React example, may be required.
- The lifecycle and API of the plot must be designed and implemented from scratch.

## Conclusion

Integrating a plot into an existing application can present complex challenges. It requires careful consideration of various crucial factors, such as logic encapsulation, expandability, framework workflow, and reusability.

In many scenarios, turnkey solutions can provide a convenient option, allowing developers to concentrate on plot design rather than the difficulties of integration. Nevertheless, when faced with situations that surpass the capabilities of pre-built solutions, Web Components can serve as a valuable native tool for creating a flexible custom solution without additional dependencies.
