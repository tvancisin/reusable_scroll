//scroll to top when page refreshed
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
}

//get width and height of screen
const width100 = window.innerWidth - 10,
  height100 = window.innerHeight,
  width80 = width100 * 0.80,
  width20 = width100 * 0.20,
  width50 = width100 * 0.5;
//margins for vis
const margin = { top: 45, right: 10, bottom: 0, left: 10 },
  height = height100 - margin.top - margin.bottom,
  width = width80 - margin.top - margin.bottom;
//adjusting width and height for current screen
d3.selectAll("#story")
  .style("width", width100 + "px")
d3.selectAll(".graphic__vis, .graphic__vis__1, .graphic__vis__2, #visualization, #net")
  .style("width", width80 + "px")
  .style("height", height100 + "px")
d3.selectAll(".graphic__prose, .graphic__prose__1, .graphic__prose__2")
  .style("width", width20 + "px")
  .style("left", width80 + "px")
d3.selectAll("#separator, #separator1, #separator2")
  .style("width", width100 + "px")
  .style("height", height100 + "px")
d3.selectAll("#map")
  .style("width", width100 + 50 + "px")
  .style("height", height100 + "px")
d3.selectAll(".trigger").style("padding-top", height100 / 2 + "px")
d3.selectAll("#jinrui, #jinrui_iframe")
  .style("width", width100 + "px")
  .style("height", height100 + "px")
  .style("left", -width100 - 20 + "px")

j_counter = 0;
d3.select("#jinrui_button").on("click", function (d) {
  j_counter += 1;
  if (j_counter % 2 !== 0) {
    d3.select("#jinrui").transition().duration(800).style("left", 0 + "px")
    d3.selectAll(".graphic__prose, .graphic__prose__1, .graphic__prose__2").style("z-index", 0)
  }
  else {
    d3.select("#jinrui").transition().duration(800).style("left", -width100 - 20 + "px")
    d3.selectAll(".graphic__prose, .graphic__prose__1, .graphic__prose__2").transition().delay(500).style("z-index", 99)

  }


})

//scaling vertical axis
let y_vertical = d3.scaleTime()
  .range([10, height - 10])
//scaling horizontal axis
let x_horizontal = d3.scaleTime()
  .range([0, width])
let horizontal_svg = d3.select("#visualization")
  .attr("class", "horizontal_bee")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(10,${margin.top})`);
//context lines g
let line = horizontal_svg.append("g")

//mapbox
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FzaGFnYXJpYmFsZHkiLCJhIjoiY2xyajRlczBlMDhqMTJpcXF3dHJhdTVsNyJ9.P_6mX_qbcbxLDS1o_SxpFg';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/sashagaribaldy/cls4l3gpq003k01r0fc2s04tv',
  center: [30.137343, 40.137451],
  zoom: 1.5,
  attributionControl: false
});
//load initial map
map.on('load', () => {
  // Add a data source containing GeoJSON data.
  map.addSource('states', {
    'type': 'geojson',
    'data': geo_data,
    'generateId': true //This ensures that all features have unique IDs
  });
  map.addLayer({
    'id': 'state-fills',
    'type': 'fill',
    'source': 'states',
    'layout': {},
    'paint': {
      'fill-color': ['match', ['get', 'ADMIN'],
        "Russia", '#dd1e36',
        "United Kingdom", '#dd1e36',
        '#7B8AD6',
      ],
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1,
        0.7
      ]
    }
  });
  map.addLayer({
    'id': 'outline',
    'type': 'line',
    'source': 'states',
    'layout': {},
    'paint': {
      'line-color': '#172436',
      'line-width': 0.5
    }
  });
});

//bundling variables
const colorin = "white";
const colorout = "white";
const colornone = "#ccc";
const bundle_width = height * 0.82;
const bundle_radius = bundle_width / 2 + 80;

const bundle_tree = d3.cluster()
  .size([2 * Math.PI, bundle_radius - 100]);

const bundle_line = d3.lineRadial()
  .curve(d3.curveBundle.beta(0.9))
  .radius(d => d.y)
  .angle(d => d.x);

const bundle_svg = d3.select("#net")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${width100 / 2},${height / 2 + 40})`);

const arcInnerRadius = bundle_radius - 93;
const arcWidth = 20;
const arcOuterRadius = arcInnerRadius + arcWidth;
const arc = d3
  .arc()
  .innerRadius(arcInnerRadius)
  .outerRadius(arcOuterRadius)
  .startAngle((d) => d.start)
  .cornerRadius(3)
  .endAngle((d) => d.end);

const bundle_node = bundle_svg.append("g")
const bundle_link = bundle_svg.append("g")

//context dates
const ru_context_data = [{ year: "1991/07/10", text: "Boris Yeltsin" }, { year: "2000/05/07", text: "Vladimir Putin" },
{ year: "2008/05/07", text: "Dmitry Medvedev" }, { year: "2012/05/07", text: "Vladimir Putin" }]

const uk_context_data = [{ year: "1990/11/28", text: "John Major" }, { year: "1997/05/02", text: "Tony Blair" },
{ year: "2007/06/27", text: "Gordon Brown" }, { year: "2010/05/11", text: "David Cameron" },
{ year: "2016/07/13", text: "Theresa May" }, { year: "2019/07/24", text: "Boris Johnson" }]
// { year: "2022/09/06", text: "Liz Truss" }, { year: "2022/10/25", text: "Rishi Sunak" }]

//read in the data
Promise.all([
  d3.json("data/russia.json"),
  d3.csv("data/all_update.csv"),
  d3.csv("data/loc_correction.csv"),
]).then(function (files) {
  //change agtid to number
  files[1].forEach(function (d) {
    d.AgtId = Number(d.AgtId.substring(0, d.AgtId.length - 2));
  })
  //change date format to GMT
  let parser = d3.timeParse("%d/%m/%Y");
  //parse all dates
  files[1].forEach(function (d) {
    d.dat = d.date
    d.date = parser(d.date)
  })
  //divide into the three actors
  let the_three_group = d3.groups(files[1], (d) => d.global_actor);
  let un = the_three_group[0][1],
    uk = the_three_group[1][1],
    ru = the_three_group[2][1];

  console.log(ru);

  //populate dropdown
  d3.select('#dropdown_country').on("change", function () {
    let selected = d3.select(this).property('value')
    if (selected == "Russia") {
      d3.select("#separator").style("background-image", "url(../img/ru.PNG)")
      prepare_data(ru, "Russia", ru_context_data, "ru")
    }
    else if (selected == "United Kingdom") {
      d3.select("#separator").style("background-image", "url(../img/uk.PNG)")
      prepare_data(uk, "United Kingdom", uk_context_data, "uk")
    }
    else if (selected == "United Nations") {
      prepare_data(un, "United Nations")
    }
  })

  //initial function
  let scrollerVis;
  const prepare_data = function (data, selected_actor, context, selected_country_string) {

    //group by dates and unique ID's
    let year_division = d3.groups(data, d => d.AgtId, d => d.date)
    //sorting years chronologically
    year_division.sort(function (x, y) {
      return d3.ascending(x[1][0][0], y[1][0][0]);
    })

    //individual peace processes
    let pprocess = d3.groups(data, d => d.PPName, d => d.AgtId)
    pprocess.sort(function (x, y) {
      return d3.ascending(x[1].length, y[1].length);
    })
    let most_pp = pprocess[pprocess.length - 1]
    let most_pp_name = most_pp[0]
    let sec_most_pp = pprocess[pprocess.length - 2]
    let sec_most_pp_name = sec_most_pp[0]

    function find_id(curr_id) {
      let country = files[2].find(function (x) {
        return x.AgtId == curr_id
      })
      return country.country_entity
    }

    let the_array = [];
    data.forEach(function (d) {
      let curr_id = d.AgtId;
      let country = find_id(curr_id)
      d.where_agt = country
      if (the_array.includes(country) == false) {
        the_array.push(country)
      };
    })
    if (selected_country_string == "uk") {
      the_array.push("United Kingdom")
    }

    //overview data
    const most = d3.groups(data, d => d.date.getUTCFullYear(), d => d.AgtId),
      maxObject = d3.max(most, (d) => d[1].length),
      maxIndex = most.findIndex((d) => d[1].length === maxObject),
      most_agt = most[maxIndex],
      minObject = d3.min(most, (d) => d[1].length),
      minIndex = most.findIndex((d) => d[1].length === minObject),
      least_agt = most[minIndex];

    //latest agreement
    const last_agt = year_division[year_division.length - 1]
    const found = last_agt[1].find(function (num) {
      return num[1][0].actor_name == selected_actor;
    });

    //most agt type
    const individual_agreements = d3.groups(data, d => d.AgtId);
    const agreement_types = d3.groups(individual_agreements, d => d[1][0].agt_type);
    agreement_types.sort(function (x, y) {
      return d3.ascending(x[1].length, y[1].length);
    })
    const agreement_stages = d3.groups(individual_agreements, d => d[1][0].stage_label);
    agreement_stages.sort(function (x, y) {
      return d3.ascending(x[1].length, y[1].length);
    })

    //getting info for populating the text
    let actor = data[0].global_actor;
    d3.select("#title_header").text(actor + " as a Peace Agreement Signatory")
    let num_pp = d3.groups(data, (d) => d.PPName).length
    d3.select("#num_pp").text(num_pp)
    let num_agt = d3.groups(data, (d) => d.Agt).length
    d3.select("#num_agt").text(num_agt)
    let num_act = d3.groups(data, (d) => d.actor_name).length
    d3.select("#num_act").text(num_act)
    let yr_period = d3.extent(year_division, function (d) { return d[1][0][0]; })
    d3.select("#yr_active").text(yr_period[0].getUTCFullYear() + " - " + yr_period[1].getUTCFullYear())




    //prepare network data for radial diagram
    const data_sort = function (data) {
      //construct network data
      let grouping = d3.groups(data, d => d.actor_name, d => d.AgtId);
      console.log(grouping);

      let initial_object = []
      const compare = function (a1, a2) {
        return a1.reduce((a, c) => a + a2.includes(c), 0);
      };

      let counter = 0;
      let actor_connections = []
      for (let i = 0; i < grouping.length; i++) {
        let type = grouping[i][1][0][1][0].actor_type
        let name = grouping[i][1][0][1][0].actor_name

        initial_object.push({
          // name: "peace." + locale + "." + type + "." + name,
          name: "peace." + type + "." + name,
          imports: []
        })

        for (let j = i + 1; j < grouping.length; j++) {
          let first_array = [],
            second_array = [],
            src = grouping[i][0],
            trg = grouping[j][0];
          let more = grouping[j][1][0][1][0].actor_type
          let blargh = grouping[j][1][0][1][0].actor_name

          grouping[i][1].forEach(function (b) {
            first_array.push(b[0])
          })
          grouping[j][1].forEach(function (p) {
            second_array.push(p[0])
          })
          let connections = compare(first_array, second_array)

          if (connections !== 0) {
            initial_object[i].imports.push(
              // "peace." + more + "." + moremore + "." + blargh
              "peace." + more + "." + blargh
            )
            counter += 1;
            actor_connections.push({
              index: counter,
              source: src,
              target: trg,
              value: connections
            })
          }
        }
      }
      console.log(initial_object);
      update_net(initial_object, "update")

    }

    data_sort(data)

    //update the network
    function update_net(bundle_data, update) {
      if (update == "update") {
        dataset = bundle_data
      }
      else {
        console.log("no need");
      }

      d3.selectAll(".bundle_node").remove()
      const root = bundle_tree(bilink(d3.hierarchy(hierarchy(bundle_data))
      ));

      const leafGroups = d3.groups(root.leaves(), d => d.parent.data.name);

      const arcAngles = leafGroups.map(g => ({
        name: g[0],
        start: d3.min(g[1], d => d.x),
        end: d3.max(g[1], d => d.x)
      }));

      bundle_svg.selectAll(".arc")
        .data(arcAngles)
        .join("path")
        .attr("id", (d, i) => `arc_${i}`)
        .attr("d", (d) => arc({ start: d.start, end: d.end }))
        .attr("class", "arc")
        .attr("fill", function (d) {
          return "red"
          // console.log(d);
          // if (d.name == "african") {
          //   return "#dd1e36"
          // }
          // else if (d.name == "western") {
          //   return "#40af4a"
          // }
          // else if (d.name == "nonwestern") {
          //   return "#ab4298"
          // }
          // else if (d.name == "international") {
          //   return "white"
          // }
        })
        .attr("stroke", "none");

      // svg.selectAll(".arcLabel")
      //     .data(arcAngles)
      //     .join("text")
      //     .attr("x", 2) //Move the text from the start angle of the arc
      //     .attr("dy", (d) => ((arcOuterRadius - arcInnerRadius) * 0.8)) //Move the text down
      //     .append("textPath")
      //     .attr("class", "arcLabel")
      //     .attr("xlink:href", (d, i) => `#arc_${i}`)
      //     .text((d, i) => ((d.end - d.start) < (6 * Math.PI / 180)) ? "" : d.name); // 6 degrees min arc length for label to apply


      let gru = d3.scaleLinear()
        .domain([1, 100])
        .range([5, 25]);

      // add nodes
      bundle_node.selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("class", "bundle_node")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y}, 0)`)
        .append("text")
        .style("font-size", function (d, i) {
          return 10
          // let font = gru(d.data.imports.length)
          // return font + "px"
        })
        .style("fill", "gray")
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI ? (arcWidth + 13) : (arcWidth + 13) * -1) // note use of arcWidth
        .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .text(d => d.data.name)
        .style("cursor", "default")
        .each(function (d) { d.text = this; })
        .on("mouseover", overed)
        .on("mouseout", outed)
      // .call(text => text.append("title").text(d => `${id(d)} ${d.outgoing.length} outgoing ${d.incoming.length} incoming`));


      // add edges
      bundle_link.selectAll("path")
        .data(root.leaves().flatMap(leaf => leaf.outgoing))
        .join("path")
        .each(function (d) {
          (d.source = d[0]), (d.target = d[d.length - 1]);
        })
        .each(function (d) { d.path = this; })
        .attr("class", "link")
        .attr("fill", "none")
        .attr("d", ([i, o]) => bundle_line(i.path(o)))

      function overed(event, d) {
        // link.style("mix-blend-mode", null);
        d3.select(this).style("fill", "#fed800").attr("font-weight", "bold");
        // d3.select(this).style("fill", "#fed800").attr("font-weight", "bold").style("font-size", "25px");
        d3.selectAll(d.incoming.map(d => d.path)).style("stroke", colorin).style("stroke-opacity", 1).raise()
        d3.selectAll(d.incoming.map(([d]) => d.text)).style("fill", colorin).attr("font-weight", "bold");
        d3.selectAll(d.outgoing.map(d => d.path)).style("stroke", colorout).style("stroke-opacity", 1).raise();
        d3.selectAll(d.outgoing.map(([, d]) => d.text)).style("fill", colorout).attr("font-weight", "bold");
      }

      function outed(event, d) {
        // link.style("mix-blend-mode", "multiply");
        let return_font = gru(d.data.imports.length)
        d3.select(this).style("fill", "gray").attr("font-weight", null)
        // d3.select(this).style("fill", "gray").attr("font-weight", null).style("font-size", return_font + "px");
        d3.selectAll(d.incoming.map(d => d.path)).style("stroke", "rgb(93, 93, 93)").style("stroke-opacity", 0.1);
        d3.selectAll(d.incoming.map(([d]) => d.text)).style("fill", "gray").attr("font-weight", null);
        d3.selectAll(d.outgoing.map(d => d.path)).style("stroke", "rgb(93, 93, 93)").style("stroke-opacity", 0.1);
        d3.selectAll(d.outgoing.map(([, d]) => d.text)).style("fill", "gray").attr("font-weight", null);
      }

      function id(node) {
        return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
      }

      function bilink(root) {
        const map = new Map(root.leaves().map(d => [id(d), d]));
        for (const d of root.leaves()) d.incoming = [], d.outgoing = d.data.imports.map(i => [d, map.get(i)]);
        for (const d of root.leaves()) for (const o of d.outgoing) o[1].incoming.push(o);
        return root;
      }

      function hierarchy(data, delimiter = ".") {
        let root;
        const map = new Map;
        data.forEach(function find(data) {
          const { name } = data;
          if (map.has(name)) return map.get(name);
          const i = name.lastIndexOf(delimiter);
          map.set(name, data);
          if (i >= 0) {
            find({ name: name.substring(0, i), children: [] }).children.push(data);
            data.name = name.substring(i + 1);
          } else {
            root = data;
          }
          return data;
        });
        return root;
      }
    }






    //populating the elements with text 
    d3.select(".one").html(actor + ` is a signatory in the PA-X Agreements database
    as it has been a signatory to ` + num_agt + ` agreements across ` + num_pp +
      ` peace processes since ` + yr_period[0].getUTCFullYear() + `. The most recent
     signed agreement was as ` + found[1][0].signatory_type + ` on ` + ` <a href=` +
      found[1][0].PAX_Hyperlink + ` target="_blank">` + found[1][0].dat + `</a> in ` +
      found[1][0].PPName);
    d3.select(".two").text(`The year when ` + actor + ` signed the most agreements 
    was ` + most_agt[0] + `, namely ` + most_agt[1].length + `. In contrast, the 
    year when they signes the least amount of agreements was ` + least_agt[0] + `.
     They only signed one agreement.`);
    d3.select(".three").html(actor + ` has mostly been involved in `
      + agreement_types[agreement_types.length - 1][0] + ` agreement types.`)
    d3.select(".four").html(`When it comes to agreement stages, ` + actor +
      ` has mostly been involved in ` + agreement_stages[agreement_stages.length - 1][0] +
      ` stages.`);
    d3.select(".six").html(actor + ` has participated as a peace agreement signatory
    in ` + num_agt + ` peace processes across ` + the_array.length + ` countries.`)
    d3.select(".seven").html(`The peace process ` + actor + ` has participated in the most
    has been ` + most_pp_name + `.`);
    d3.select(".eight").html(`After ` + most_pp_name + `, ` + actor + ` has been most involved
     in ` + sec_most_pp_name + `.`);

    //trigger new scroller class
    scrollerVis = new ScrollerVis({ storyElement: '#story', mapElement: 'map' },
      data, year_division, the_array, context, selected_country_string, most_agt[0],
      agreement_types[agreement_types.length - 1][0],
      agreement_stages[agreement_stages.length - 1][0]);
  }

  // trigger initial finction with Russian data
  prepare_data(ru, "Russia", ru_context_data, "ru")

  // tiggering fixed/bottom positions of visualization upon scroll
  // helper function to map over dom selection
  function selectionToArray(selection) {
    var len = selection.length
    var result = []
    for (var i = 0; i < len; i++) {
      result.push(selection[i])
    }
    return result
  }

  // select elements
  let graphicEl = document.querySelector('.graphic'),
    graphicEl1 = document.querySelector('.graphic1'),
    graphicEl2 = document.querySelector('.graphic2'),
    graphicVisEl = graphicEl.querySelector('.graphic__vis'),
    graphicVisEl1 = graphicEl1.querySelector('.graphic__vis__1'),
    graphicVisEl2 = graphicEl2.querySelector('.graphic__vis__2'),
    triggerEls = selectionToArray(graphicEl.querySelectorAll('.trigger')),
    triggerEls1 = selectionToArray(graphicEl1.querySelectorAll('.trigger')),
    triggerEls2 = selectionToArray(graphicEl2.querySelectorAll('.trigger'));

  // handle the fixed/static position of grahpic
  let toggle = function (fixed, bottom) {
    if (fixed) graphicVisEl.classList.add('is-fixed')
    else graphicVisEl.classList.remove('is-fixed')

    if (bottom) graphicVisEl.classList.add('is-bottom')
    else graphicVisEl.classList.remove('is-bottom')
  }

  // handle the fixed/static position of grahpic
  let toggle1 = function (fixed, bottom) {
    if (fixed) graphicVisEl1.classList.add('is-fixed')
    else graphicVisEl1.classList.remove('is-fixed')

    if (bottom) graphicVisEl1.classList.add('is-bottom')
    else graphicVisEl1.classList.remove('is-bottom')
  }

  // handle the fixed/static position of grahpic
  let toggle2 = function (fixed, bottom) {
    if (fixed) graphicVisEl2.classList.add('is-fixed')
    else graphicVisEl2.classList.remove('is-fixed')

    if (bottom) graphicVisEl2.classList.add('is-bottom')
    else graphicVisEl2.classList.remove('is-bottom')
  }

  // setup a waypoint trigger for each trigger element
  let waypoints = triggerEls.map(function (el) {
    // get the step, cast as number					
    let step = +el.getAttribute('data-step')

    return new Waypoint({
      element: el, // our trigger element
      handler: function (direction) {
        // if the direction is down then we use that number,
        // else, we want to trigger the previous one
        var nextStep = direction === 'down' ? step : Math.max(0, step)
        console.log(nextStep);
        scrollerVis.goToStep(nextStep, direction);

        // tell our graphic to update with a specific step
        // graphic.update(nextStep)
      },
      offset: '30%',  // trigger halfway up the viewport
    })
  })

  // setup a waypoint trigger for each trigger element
  let waypoints1 = triggerEls1.map(function (el) {
    // get the step, cast as number					
    let step = +el.getAttribute('data-step')

    return new Waypoint({
      element: el, // our trigger element
      handler: function (direction) {
        // if the direction is down then we use that number,
        // else, we want to trigger the previous one
        var nextStep = direction === 'down' ? step : Math.max(0, step)
        scrollerVis.goToStep(nextStep, direction);
        // console.log(nextStep);
        // scrollerVis.goToStep(nextStep, direction);

        // tell our graphic to update with a specific step
        // graphic.update(nextStep)
      },
      offset: '30%',  // trigger halfway up the viewport
    })
  })

  // setup a waypoint trigger for each trigger element
  let waypoints2 = triggerEls2.map(function (el) {
    // get the step, cast as number					
    let step = +el.getAttribute('data-step')

    return new Waypoint({
      element: el, // our trigger element
      handler: function (direction) {
        // if the direction is down then we use that number,
        // else, we want to trigger the previous one
        var nextStep = direction === 'down' ? step : Math.max(0, step)
        scrollerVis.goToStep(nextStep, direction);
        // console.log(nextStep);
        // scrollerVis.goToStep(nextStep, direction);

        // tell our graphic to update with a specific step
        // graphic.update(nextStep)
      },
      offset: '30%',  // trigger halfway up the viewport
    })
  })

  // enter (top) / exit (bottom) graphic (toggle fixed position)
  const enterWaypoint = new Waypoint({
    element: graphicEl,
    handler: function (direction) {
      let fixed = direction === 'down'
      let bottom = false
      toggle(fixed, bottom)
    },
  })

  // const exitWaypoint = new Waypoint({
  //   element: graphicEl,
  //   handler: function (direction) {
  //     let fixed = direction === 'up'
  //     let bottom = !fixed
  //     toggle(fixed, bottom)
  //   },
  //   offset: 'bottom-in-view',
  // })

  // enter (top) / exit (bottom) graphic (toggle fixed position)
  const enterWaypoint1 = new Waypoint({
    element: graphicEl1,
    handler: function (direction) {
      let fixed = direction === 'down'
      let bottom = false
      toggle1(fixed, bottom)
    },
  })

  const exitWaypoint1 = new Waypoint({
    element: graphicEl1,
    handler: function (direction) {
      let fixed = direction === 'up'
      let bottom = !fixed
      toggle1(fixed, bottom)
    },
    offset: 'bottom-in-view',
  })

  // enter (top) / exit (bottom) graphic (toggle fixed position)
  const enterWaypoint2 = new Waypoint({
    element: graphicEl2,
    handler: function (direction) {
      let fixed = direction === 'down'
      let bottom = false
      toggle2(fixed, bottom)
    },
  })

  const exitWaypoint2 = new Waypoint({
    element: graphicEl2,
    handler: function (direction) {
      let fixed = direction === 'up'
      let bottom = !fixed
      toggle2(fixed, bottom)
    },
    offset: 'bottom-in-view',
  })

  // const waypoints =
  //   d3.selectAll('.step')
  //     .each(function (d, stepIndex) {
  //       const thethingy = 4 - stepIndex;
  //       return new Waypoint({
  //         element: this,
  //         handler: function (direction) {
  //           const nextStep = thethingy
  //           scrollerVis.goToStep(nextStep, direction);
  //         },
  //         offset: '50%',
  //       });
  //     });
})
  .catch(error => console.error(error));
