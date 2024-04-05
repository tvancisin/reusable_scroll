let hovno = 0;
let context_parser = d3.timeParse("%Y/%m/%d");

// re-drawing context lines/text
const drawContext = function (context, height) {

  line.selectAll(".context_line")
    .data(context)
    .join(
      enter => enter.append("line")
        .attr("class", "context_line")
        .attr("x1", function (d) {
          return x_horizontal(context_parser(d.year))
        })
        .attr("x2", function (d) { return x_horizontal(context_parser(d.year)) })
        .attr("y1", function (d, i) {
          i += 1;
          if (i % 2 !== 0) {
            return height * 0.2 - 30
          }
          else {
            return height * 0.2
          }
        })
        .attr("y2", height)
        .attr("stroke-width", 1)
        .attr("stroke", "white")
        .attr("stroke-opacity", 0.7)
        .attr("stroke-dasharray", "8,8")
        .attr("opacity", 0)
        .transition().duration(500)
        .attr("opacity", 1)
        .selection(),
      update => update
        .transition().duration(500)
        .attr("x1", function (d) { return x_horizontal(context_parser(d.year)) })
        .attr("x2", function (d) { return x_horizontal(context_parser(d.year)) })
        .attr("y1", function (d, i) { return height * 0.3 - i * 30 })
        .attr("y2", height)
        .selection(),
      exit => exit
        .transition().duration(500)
        .attr("opacity", 0)
        .remove()
    )

  line.selectAll(".context_text")
    .data(context)
    .join(
      enter => enter.append("text")
        .attr("class", "context_text")
        .attr('text-anchor', 'start')
        .attr("fill", "white")
        .attr("fill-opacity", 1)
        .attr("font-size", "16px")
        .attr("x", function (d) { return x_horizontal(context_parser(d.year)) + 2 })
        .attr("y", function (d, i) {
          i += 1;
          if (i % 2 !== 0) {
            return height * 0.2 - 30
          }
          else {
            return height * 0.2
          }
        })
        .text(function (d) { return d.text })
        .attr("opacity", 0)
        .transition().duration(500)
        .attr("opacity", 1)
        .selection(),
      update => update
        .transition().duration(500)
        .attr("x", function (d) { return x_horizontal(context_parser(d.year)) + 2 })
        .attr("y", function (d, i) { return height * 0.3 - i * 30 })
        .text(function (d) { return d.text })
        .selection(),
      exit => exit
        .transition().duration(500)
        .attr("opacity", 0)
        .remove()
    )

}

class ScrollerVis {
  constructor(_config, _raw, _year, _array, _context,
    _selected_cntry, most_agt, _type, _stage) {
    this.config = {
      another: _config.storyElement,
      map: _config.mapElement,
      vis_width: width80,
      vis_height: height100,
      margin: { top: 50, right: 10, bottom: 20, left: 10 },
      steps: ['step1', 'step2', 'step3', 'step4', 'step5', 'step6',
        'step7', 'step8', 'step9', 'step10', 'step11', 'step12',
        'step13']
    }
    this.most_agree_year = most_agt
    this.selected_country = _selected_cntry;
    this.raw_data = _raw;
    this.year_division = _year;
    this.country_array = _array;
    this.context_data = _context;
    this.type = _type;
    this.stage = _stage;
    this.initVis();
  }

  initVis() {
    window.scrollTo({ left: 0, top: 0, behavior: "auto" });

    let vis = this;
    vis.width = vis.config.vis_width - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.vis_height - vis.config.margin.top - vis.config.margin.bottom;
    // context lines/text
    vis.x_axis = d3.axisBottom(x_horizontal).tickSize(-vis.height).ticks(10);
    horizontal_svg.append("g")
      .attr("transform", `translate(10, ` + vis.height + `)`)
      .attr("class", "myXaxis")
    //scale for vertical bees
    y_vertical.domain(d3.extent(vis.year_division, (d) => d[1][0][0]))
    // most agreements year class name
    vis.the_year = ".y" + this.most_agree_year.toString()
    //remove special characters from stage names
    this.stage = this.stage.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, '')

    setTimeout(function () {
      hovno = 1;
    }, 800);

  }

  step1(direction) {
    const vis = this;
    console.log("step1", direction);
    map.setFilter('state-fills', ['in', 'ADMIN', ...vis.country_array]);
    d3.selectAll(".tick").remove()

    if (direction === "down") {
      //adjust domain
      x_horizontal.domain(d3.extent(vis.year_division, (d) => d[1][0][0])).nice();
      //initial simulation
      let simulation = d3.forceSimulation(vis.year_division)
        .force("x", d3.forceX((d) => x_horizontal(d[1][0][0])).strength(3))
        .force("y", d3.forceY(vis.height / 2))
        .force("collide", d3.forceCollide(11))
        .stop();
      //simulate
      for (var i = 0; i < 200; ++i) { simulation.tick(); }
      //voronoi
      const delaunay = d3.Delaunay.from(vis.year_division, d => d.x, d => d.y),
        voronoi = delaunay.voronoi([0, 0, vis.width, vis.height]);

      //draw circles
      horizontal_svg.selectAll('.my_circles')
        .data(vis.year_division)
        .join('circle')
        .attr('cx', -50)
        .attr('cy', vis.height / 2)
        .on("mouseover", function (d, i) {
          d3.select(this).style("stroke", "white")
          d3.select("#hover_description")
            .style("display", "block")
            .style("left", d.x + 20 + "px")
            .style("top", d.y - 20 + "px")
            .html(i[1][0][1][0].Agt)
        })
        .on("mouseout", function (d, i) {
          d3.select(this).style("stroke", "black")
          d3.select("#hover_description")
            .style("display", "none")
        })
        .transition().delay(function (d, i) { return i })
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr("class", function (d) {
          return "my_circles " + d[1][0][1][0].agt_type + ` ` +
            + d[1][0][1][0].AgtId + " "
            + d[1][0][1][0].PPName.slice(0, 3) + " "
            + d[1][0][1][0].stage_label.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, '')
            + " y" + d[1][0][1][0].date.getUTCFullYear()
        })
        .attr('r', 10)
        .style('fill', "#7B8AD6")
        .style("stroke", "black")
        .style("strokewidth", 0.5)

      horizontal_svg.selectAll(".myXaxis")
        .call(vis.x_axis)
        .style("stroke-dasharray", "5 5")
        .selectAll("text")
        .attr("transform", "translate(0,-4)")
        .style("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-family", "Montserrat");

      d3.selectAll(".domain")
        .attr("visibility", "hidden")
      d3.selectAll(".myXaxis, .tick line").transition()
        .attr("visibility", "visible")
    }
    else if (direction == "up") {
      horizontal_svg.selectAll('.my_circles')
        .data(vis.year_division)
        .join('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .transition().delay(function (d, i) { return i })
        .attr('cx', -50)
        .attr('cy', vis.height / 2)
      d3.selectAll(".myXaxis, .tick line").transition()
        .attr("visibility", "hidden")
    }

  }

  step2(direction) {
    const vis = this;
    console.log("step2", direction);
    if (direction == "down") {
      d3.selectAll(vis.the_year).style("fill", "white")
    }
    else {
      d3.selectAll("." + this.type).style("fill", "#7B8AD6")
      d3.selectAll(vis.the_year).style("fill", "#7B8AD6")
    }
  }

  step3(direction) {
    const vis = this;
    console.log("step3", direction);

    if (direction === "down") {
      d3.selectAll(vis.the_year).style("fill", "#7B8AD6")
      drawContext(this.context_data, vis.height)
      d3.selectAll("." + this.type).style("fill", "white")
    }
    else {
      d3.selectAll("." + this.type).style("fill", "#7B8AD6")
      d3.selectAll(vis.the_year).style("fill", "white")
      drawContext([], vis.height)
    }
  }

  step4(direction) {
    const vis = this;
    console.log("step4", direction);

    if (direction == "down") {
      console.log(this.stage);
      d3.selectAll("." + this.type).style("fill", "#7B8AD6")
      d3.selectAll("." + this.stage).style("fill", "white")

    }
    else {
      d3.selectAll("." + this.stage).style("fill", "#7B8AD6")
      d3.selectAll("." + this.type).style("fill", "white")
    }
  }

  step5(direction) {
    const vis = this;
    console.log("step5", direction);

    if (direction === "down") {
      d3.selectAll(".my_circles").style("fill", "#7B8AD6")
      x_horizontal.domain(d3.extent(vis.year_division, function (d) { return d[1][0][0]; }))
        .nice();
      //initial simulation
      let simulation = d3.forceSimulation(vis.year_division)
        .force("y", d3.forceY(function (d) { return y_vertical(d[1][0][0]); }).strength(3))
        .force("x", d3.forceX(120 / 2))
        .force("collide", d3.forceCollide(4))
        .stop();
      //simulate
      for (var i = 0; i < 200; ++i) { simulation.tick(); }
      //voronoi
      const delaunay = d3.Delaunay.from(vis.year_division, d => d.x, d => d.y),
        voronoi = delaunay.voronoi([0, 0, vis.width, vis.height]);
      //draw circles
      horizontal_svg.selectAll('.my_circles')
        .data(vis.year_division)
        .join('circle')
        .transition().delay(function (d, i) { return i })
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 4)

      // update context lines/text
      drawContext([], vis.height)

      d3.selectAll(".graphic__vis, #visualization").transition().delay(500)
        .style("width", 130 + "px")
        .style("height", height100 + "px")

      //move x axis to the left
      d3.selectAll(".domain, .tick line")
        .attr("visibility", "hidden")
      vis.x_axis = d3.axisLeft(y_vertical).ticks(5);
      horizontal_svg.selectAll(".myXaxis")
        .attr("transform", `translate(15,0)`)
      horizontal_svg.selectAll(".myXaxis").transition()
        .call(vis.x_axis)
        .selectAll("text")
        .attr("transform", "translate(0,-4)")
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .style("font-family", "Montserrat");
    }
    else if (direction == "up") {
      d3.selectAll("." + this.stage).style("fill", "white")
      d3.selectAll(".myXaxis, .tick line")
        .attr("visibility", "visible")
      vis.x_axis = d3.axisBottom(x_horizontal).tickSize(-vis.height).ticks(10);
      horizontal_svg.selectAll(".myXaxis")
        .attr("transform", `translate(10, ` + vis.height + `)`)
      horizontal_svg.selectAll(".myXaxis").transition()
        .call(vis.x_axis)
        .style("stroke-dasharray", "5 5")
        .selectAll("text")
        .attr("transform", "translate(0,-4)")
        .style("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "Montserrat");

      d3.selectAll(".graphic__vis, #visualization, #visualization1")
        .style("width", width80 + "px")
        .style("height", height100 + "px")
      //adjust domain
      x_horizontal.domain(d3.extent(vis.year_division, function (d) { return d[1][0][0]; }))
        .nice();
      //initial simulation
      let simulation = d3.forceSimulation(vis.year_division)
        .force("x", d3.forceX(function (d) { return x_horizontal(d[1][0][0]); }).strength(3))
        .force("y", d3.forceY(vis.height / 2))
        .force("collide", d3.forceCollide(11))
        .stop();
      //simulate
      for (var i = 0; i < 200; ++i) { simulation.tick(); }
      //voronoi
      const delaunay = d3.Delaunay.from(vis.year_division, d => d.x, d => d.y),
        voronoi = delaunay.voronoi([0, 0, vis.width, vis.height]);
      //draw circles
      horizontal_svg.selectAll('.my_circles')
        .data(vis.year_division)
        .join('circle')
        .transition().transition().delay(function (d, i) { return i })
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 10)

      // update context lines/text
      drawContext(this.context_data, vis.height)
    }
  }

  step6(direction) {
    const vis = this;
    console.log("step6", direction);

    if (direction == "down") {
      d3.select(".graphic__vis").style("background-color", "rgba(0, 0, 0, 0.5)")
      if (this.selected_country == "ru") {
        map.flyTo({
          center: [60.137343, 60.137451],
          zoom: 2,
          essential: true // this animation is considered essential with respect to prefers-reduced-motion
        });
      }
      else if (this.selected_country == "uk") {
        map.flyTo({
          center: [-6.4923, 54.7877],
          zoom: 2,
          essential: true // this animation is considered essential with respect to prefers-reduced-motion
        });
      }
    }
    else {
      d3.select(".graphic__vis").style("background-color", "rgba(0, 0, 0, 0)")
    }
  }

  step7(direction) {
    const vis = this;
    console.log("step7", direction);
    if (direction == "down") {
      if (this.selected_country == "ru") {
        d3.selectAll(".Abk").style("fill", "white")
        map.flyTo({
          center: [41.4422, 42.9738],
          zoom: 5.5,
          essential: true // this animation is considered essential with respect to prefers-reduced-motion
        });
      }
      else {
        d3.selectAll(".Nor").style("fill", "white")
        map.flyTo({
          center: [-6.4923, 54.7877],
          zoom: 5.5,
          essential: true // this animation is considered essential with respect to prefers-reduced-motion
        });
      }
    }
    else {
      d3.selectAll(".my_circles").style("fill", "#7B8AD6")
      map.flyTo({
        center: [20.137343, 30.137451],
        zoom: 2,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
      });

    }
  }

  step8(direction) {
    const vis = this;
    console.log("vancisin_1747_database");
  }

  step9(direction) {
    const vis = this;
    console.log("vancisin_1747_visualization");
  }

  goToStep(stepIndex, direction) {
    if (hovno === 1) {
      this[this.config.steps[stepIndex]](direction);
    }
  }
}