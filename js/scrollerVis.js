let hovno = 0;

// soviet countries
const soviet = ["Armenia", "Azerbaijan", "Belarus", "Estonia", "Georgia",
  "Kazakhstan", "Kyrgyzstan", "Latvia", "Lithuania", "Moldova", "Russia",
  "Tajikistan", "Turkmenistan", "Ukraine", "Uzbekistan"];
// middle east countries
const syria = ["Syria", "Libya", "Central African Republic"];

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
    let vis = this;
    vis.width = vis.config.vis_width - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.vis_height - vis.config.margin.top - vis.config.margin.bottom;

    vis.line = horizontal_svg.append("g")
    vis.x_axis = d3.axisBottom(x_horizontal).tickSize(-vis.height).ticks(10);
    horizontal_svg.append("g")
      .attr("transform", `translate(10, ` + vis.height + `)`)
      .attr("class", "myXaxis")

    vis.the_year = ".y" + this.most_agree_year.toString()

    //scale for vertical bees
    y_vertical.domain(d3.extent(vis.year_division, (d) => d[1][0][0]))

    window.scrollTo({ left: 0, top: 0, behavior: "auto" });

    //remove special characters
    this.stage = this.stage.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, '')

    setTimeout(function () {
      hovno = 1;
    }, 800);
  }

  step1(direction) {
    const vis = this;
    console.log("step1", direction);
    map.setFilter('state-fills', ['in', 'ADMIN', ...vis.country_array]);

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
            + d[1][0][1][0].stage_label.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, '')
            + " y" + d[1][0][1][0].date.getUTCFullYear()
        })
        .attr('r', 10)
        .style('fill', "#7B8AD6")
        .style("stroke", "black")
        .style("strokewidth", 0.5)

      horizontal_svg.selectAll(".myXaxis").transition()
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
      vis.line.selectAll(".context_line")
        .data(this.context_data)
        .join(
          enter => enter.append("line")
            .attr("class", "context_line")
            .attr("x1", function (d) { return x_horizontal(d.year) })
            .attr("x2", function (d) { return x_horizontal(d.year) })
            .attr("y1", function (d, i) {
              i += 1;
              if (i % 2 !== 0) {
                return vis.height * 0.2 - 30
              }
              else {
                return vis.height * 0.2
              }
            })
            .attr("y2", vis.height)
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
            .attr("x1", function (d) { return x_horizontal(d.year) })
            .attr("x2", function (d) { return x_horizontal(d.year) })
            .attr("y1", function (d, i) { return vis.height * 0.3 - i * 30 })
            .attr("y2", vis.height)
            .selection(),
          exit => exit
            .transition().duration(500)
            .attr("opacity", 0)
            .remove()
        )
      vis.line.selectAll(".context_text")
        .data(this.context_data)
        .join(
          enter => enter.append("text")
            .attr("class", "context_text")
            .attr('text-anchor', 'start')
            .attr("fill", "white")
            .attr("fill-opacity", 1)
            .attr("font-size", "16px")
            .attr("x", function (d) { return x_horizontal(d.year) + 2 })
            .attr("y", function (d, i) {
              i += 1;
              if (i % 2 !== 0) {
                return vis.height * 0.2 - 30
              }
              else {
                return vis.height * 0.2
              }
            })
            .text(function (d) { return d.text })
            .attr("opacity", 0)
            .transition().duration(500)
            .attr("opacity", 1)
            .selection(),
          update => update
            .transition().duration(500)
            .attr("x", function (d) { return x_horizontal(d.year) + 2 })
            .attr("y", function (d, i) { return vis.height * 0.3 - i * 30 })
            .text(function (d) { return d.text })
            .selection(),
          exit => exit
            .transition().duration(500)
            .attr("opacity", 0)
            .remove()
        )
      d3.selectAll("." + this.type).style("fill", "white")
    }
    else {
      d3.selectAll("." + this.type).style("fill", "#7B8AD6")
      d3.selectAll(vis.the_year).style("fill", "white")
      vis.line.selectAll(".context_line")
        .data([])
        .join(
          enter => enter.append("line")
            .attr("class", "context_line")
            .attr("x1", function (d) { return x_horizontal(d.year) })
            .attr("x2", function (d) { return x_horizontal(d.year) })
            .attr("y1", function (d, i) {
              i += 1;
              if (i % 2 !== 0) {
                return vis.height * 0.2 - 30
              }
              else {
                return vis.height * 0.2
              }
            })
            .attr("y2", vis.height / 2)
            .attr("stroke-width", 1)
            .attr("stroke", "white")
            .attr("stroke-dasharray", "8,8")
            .attr("opacity", 0)
            .transition().duration(500)
            .attr("opacity", 1)
            .selection(),
          update => update
            .transition().duration(500)
            .attr("x1", function (d) { return x_horizontal(d.year) })
            .attr("x2", function (d) { return x_horizontal(d.year) })
            .attr("y1", function (d, i) { return vis.height * 0.3 - i * 30 })
            .attr("y2", vis.height / 2)
            .selection(),
          exit => exit
            .transition().duration(500)
            .attr("opacity", 0)
            .remove()
        )

      vis.line.selectAll(".context_text")
        .data([])
        .join(
          enter => enter.append("text")
            .attr("class", "context_text")
            .attr('text-anchor', 'start')
            .attr("fill", "white")
            .attr("font-size", "16px")
            .attr("x", function (d) { return x_horizontal(d.year) + 2 })
            .attr("y", function (d, i) {
              i += 1;
              if (i % 2 !== 0) {
                return vis.height * 0.2 - 30
              }
              else {
                return vis.height * 0.2
              }
            })
            .text(function (d) { return d.text })
            .attr("opacity", 0)
            .transition().duration(500)
            .attr("opacity", 1)
            .selection(),
          update => update
            .transition().duration(500)
            .attr("x", function (d) { return x_horizontal(d.year) + 2 })
            .attr("y", function (d, i) { return vis.height * 0.3 - i * 30 })
            .text(function (d) { return d.text })
            .selection(),
          exit => exit
            .transition().duration(500)
            .attr("opacity", 0)
            .remove()
        )
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

      vis.line.selectAll(".context_line")
        .data([])
        .join(
          enter => enter.append("line")
            .attr("class", "context_line")
            .attr("x1", function (d) { return x_horizontal(d.year) })
            .attr("x2", function (d) { return x_horizontal(d.year) })
            .attr("y1", function (d, i) {
              i += 1;
              if (i % 2 !== 0) {
                return vis.height * 0.2 - 30
              }
              else {
                return vis.height * 0.2
              }
            })
            .attr("y2", vis.height - 10)
            .attr("stroke-width", 1)
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.7)
            .attr("stroke-dasharray", "8,8")
            .attr("opacity", 0)
            .transition().duration(1000)
            .attr("opacity", 1)
            .selection(),
          update => update
            .transition().duration(1000)
            .attr("x1", function (d) { return x_horizontal(d.year) })
            .attr("x2", function (d) { return x_horizontal(d.year) })
            .attr("y1", function (d, i) { return vis.height * 0.2 - i * 30 })
            .attr("y2", vis.height - 10)
            .selection(),
          exit => exit
            .transition().duration(500)
            .attr("opacity", 0)
            .remove()
        )

      vis.line.selectAll(".context_text")
        .data([])
        .join(
          enter => enter.append("text")
            .attr("class", "context_text")
            .attr('text-anchor', 'start')
            .attr("fill", "white")
            .attr("fill-opacity", 1)
            .attr("font-size", "16px")
            .attr("x", function (d) { return x_horizontal(d.year) + 2 })
            .attr("y", function (d, i) {
              i += 1;
              if (i % 2 !== 0) {
                return vis.height * 0.2 - 30
              }
              else {
                return vis.height * 0.2
              }
            })
            .text(function (d) { return d.text })
            .attr("opacity", 0)
            .transition().duration(1000)
            .attr("opacity", 1)
            .selection(),
          update => update
            .transition().duration(1000)
            .attr("x", function (d) { return x_horizontal(d.year) + 2 })
            .attr("y", function (d, i) { return vis.height * 0.2 - i * 30 })
            .text(function (d) { return d.text })
            .selection(),
          exit => exit
            .transition().duration(500)
            .attr("opacity", 0)
            .remove()
        )

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

      vis.line.selectAll(".context_line")
        .data(this.context_data)
        .join(
          enter => enter.append("line")
            .attr("class", "context_line")
            .attr("x1", function (d) { return x_horizontal(d.year) })
            .attr("x2", function (d) { return x_horizontal(d.year) })
            .attr("y1", function (d, i) {
              i += 1;
              if (i % 2 !== 0) {
                return vis.height * 0.2 - 30
              }
              else {
                return vis.height * 0.2
              }
            })
            .attr("y2", vis.height)
            .attr("stroke-width", 1)
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.7)
            .attr("stroke-dasharray", "8,8")
            .attr("opacity", 0)
            .transition().duration(1000)
            .attr("opacity", 1)
            .selection(),
          update => update
            .transition().duration(1000)
            .attr("x1", function (d) { return x_horizontal(d.year) })
            .attr("x2", function (d) { return x_horizontal(d.year) })
            .attr("y1", function (d, i) { return vis.height * 0.2 - i * 30 })
            .attr("y2", vis.height)
            .selection(),
          exit => exit
            .transition().duration(500)
            .attr("opacity", 0)
            .remove()
        )

      vis.line.selectAll(".context_text")
        .data(this.context_data)
        .join(
          enter => enter.append("text")
            .attr("class", "context_text")
            .attr('text-anchor', 'start')
            .attr("fill", "white")
            .attr("fill-opacity", 1)
            .attr("font-size", "16px")
            .attr("x", function (d) { return x_horizontal(d.year) + 2 })
            .attr("y", function (d, i) {
              i += 1;
              if (i % 2 !== 0) {
                return vis.height * 0.2 - 30
              }
              else {
                return vis.height * 0.2
              }
            })
            .text(function (d) { return d.text })
            .attr("opacity", 0)
            .transition().duration(1000)
            .attr("opacity", 1)
            .selection(),
          update => update
            .transition().duration(1000)
            .attr("x", function (d) { return x_horizontal(d.year) + 2 })
            .attr("y", function (d, i) { return vis.height * 0.2 - i * 30 })
            .text(function (d) { return d.text })
            .selection(),
          exit => exit
            .transition().duration(500)
            .attr("opacity", 0)
            .remove()
        )
    }

  }

  step6(direction) {
    const vis = this;
    console.log("step6", direction);
  }

  step7(direction) {
    const vis = this;
    console.log("step7", direction);
    if (direction == "down") {
      if (this.selected_country == "ru") {
        map.flyTo({
          center: [41.4422, 42.9738],
          zoom: 5.5,
          essential: true // this animation is considered essential with respect to prefers-reduced-motion
        });
      }
      else {
        map.flyTo({
          center: [-6.4923, 54.7877],
          zoom: 5.5,
          essential: true // this animation is considered essential with respect to prefers-reduced-motion
        });
      }
    }
    else {
      map.flyTo({
        center: [60.137343, 40.137451],
        zoom: 2,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
      });

    }
  }

  step8(direction) {
    const vis = this;
    console.log("vancisin_1747_database");

    if (direction === "up") {

      d3.selectAll("#trans")
        .transition()
        .style("bottom", "67px")

    }
    else {
      d3.select(".fix")
        .transition(1000)
        .attr("transform", "translate(" + vis.config.margin.left + "," + (vis.config.height - 50) + ")")
    }
  }

  step9(direction) {
    const vis = this;
    console.log("vancisin_1747_visualization");

    if (direction === "up") {


      d3.selectAll("#trans")
        .transition()
        .style("bottom", "82px")

      d3.selectAll("#expan")
        .transition()
        .style("bottom", "65px")

      d3.selectAll("#digi")
        .transition()
        .style("bottom", "48px")

      d3.selectAll("#data")
        .transition()
        .style("bottom", "34px")

      d3.selectAll("#visual")
        .transition()
        .style("opacity", 1)
        .style("bottom", "20px")

      d3.select(".fix")
        .transition(1000)
        .attr("transform", "translate(" + vis.config.margin.left + "," + (vis.config.height - 80) + ")")

      d3.selectAll('._1747:not(.lla)')
        // .transition(1000)
        .attr("opacity", 0.95)

      // vis.fixed_vis
      //   .append("line")
      //   .attr("class", "vancisin_1747_visualization")
      //   .attr("x1", function (d) { return vis.xScale(vis.config._1747) })
      //   .attr("y1", 85)
      //   .attr("x2", function (d) { return vis.xScale(vis.config._1877) })
      //   .attr("y2", 85)
      //   .attr("stroke", "white")
      //   .attr("stroke-width", 10)
      //   .attr("stroke-linecap", "round")
      //   .attr("opacity", 0.7)
      // vis.fixed_vis
      //   .append("line")
      //   .attr("class", "vancisin_1747_visualization")
      //   .attr("x1", function (d) { return vis.xScale(vis.config._1877) })
      //   .attr("y1", 85)
      //   .attr("x2", function (d) { return vis.xScale(vis.config._1897) })
      //   .attr("y2", 85)
      //   .attr("stroke", "white")
      //   .attr("stroke-width", 10)
      //   .attr("stroke-linecap", "round")
      //   .attr("opacity", 0.4)

    }
    else {
      d3.select(".fix")
        .transition(1000)
        .attr("transform", "translate(" + vis.config.margin.left + "," + (vis.config.height - 65) + ")")

      d3.selectAll('._1747:not(.lla)')
        // .transition(1000)
        .attr("opacity", 0.85);

      d3.selectAll(".vancisin_1747_visualization").remove()
    }

  }

  goToStep(stepIndex, direction) {
    if (hovno === 1) {
      this[this.config.steps[stepIndex]](direction);
    }
  }
}