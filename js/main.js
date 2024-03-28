const width100 = window.innerWidth - 10,
  height100 = window.innerHeight,
  width80 = width100 * 0.80,
  width20 = width100 * 0.20,
  width50 = width100 * 0.5;

const margin = { top: 45, right: 10, bottom: 0, left: 10 },
  height = height100 - margin.top - margin.bottom,
  width = width80 - margin.top - margin.bottom;

//adjusting width and height for current screen
d3.selectAll("#story")
  .style("width", width100 + "px")
d3.selectAll(".graphic__vis, .graphic__vis__1, #visualization, #visualization1")
  .style("width", width80 + "px")
  .style("height", height100 + "px")
d3.selectAll(".graphic__prose, .graphic__prose__1")
  .style("width", width20 + "px")
  .style("left", width80 + "px")
d3.selectAll("#separator")
  .style("width", width100 + "px")
  .style("height", height100 + "px")
d3.selectAll("#separator1")
  .style("width", width100 - 130 + "px")
  .style("height", height100 + "px")
d3.selectAll("#map")
  .style("width", width100 + 50 + "px")
  .style("height", height100 + "px")
d3.selectAll(".graphic__vis__1")
  .style("width", width100 + "px")
  .style("left", 0 + "px")
d3.selectAll(".trigger").style("padding-top", height100 / 2 + "px")

//scaling vertical axis
let y_vertical = d3.scaleTime()
  .range([10, height - 10])

let horizontal_svg = d3.select("#visualization")
  .attr("class", "horizontal_bee")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(10,${margin.top})`);
//scaling horizontal axis
let x_horizontal = d3.scaleTime()
  .range([0, width])

//mapbox
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FzaGFnYXJpYmFsZHkiLCJhIjoiY2xyajRlczBlMDhqMTJpcXF3dHJhdTVsNyJ9.P_6mX_qbcbxLDS1o_SxpFg';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/sashagaribaldy/cls4l3gpq003k01r0fc2s04tv',
  center: [60.137343, 40.137451],
  zoom: 2,
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
        "Russia", 'white',
        '#7B8AD6',
      ],
      'fill-opacity': 1
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

  // const secondsPerRevolution = 120;
  // // Above zoom level 5, do not rotate.
  // const maxSpinZoom = 5;
  // // Rotate at intermediate speeds between zoom levels 3 and 5.
  // const slowSpinZoom = 3;

  // let userInteracting = false;
  // let spinEnabled = true;

  // function spinGlobe() {
  //   const zoom = map.getZoom();
  //   if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
  //     let distancePerSecond = 360 / secondsPerRevolution;
  //     if (zoom > slowSpinZoom) {
  //       // Slow spinning at higher zooms
  //       const zoomDif =
  //         (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
  //       distancePerSecond *= zoomDif;
  //     }
  //     const center = map.getCenter();
  //     center.lng -= distancePerSecond;
  //     // Smoothly animate the map over one second.
  //     // When this animation is complete, it calls a 'moveend' event.
  //     map.easeTo({ center, duration: 1000, easing: (n) => n });
  //   }
  // }

  // // Pause spinning on interaction
  // map.on('mousedown', () => {
  //   userInteracting = true;
  // });

  // // Restart spinning the globe when interaction is complete
  // map.on('mouseup', () => {
  //   userInteracting = false;
  //   spinGlobe();
  // });

  // // These events account for cases where the mouse has moved
  // // off the map, so 'mouseup' will not be fired.
  // map.on('dragend', () => {
  //   userInteracting = false;
  //   spinGlobe();
  // });
  // map.on('pitchend', () => {
  //   userInteracting = false;
  //   spinGlobe();
  // });
  // map.on('rotateend', () => {
  //   userInteracting = false;
  //   spinGlobe();
  // });

  // // When animation is complete, start spinning if there is no ongoing interaction
  // map.on('moveend', () => {
  //   spinGlobe();
  // });

  // spinGlobe();
});

//context dates
const ru_context_data = [{ year: "1991/07/10", text: "Boris Yeltsin" }, { year: "2000/05/07", text: "Vladimir Putin" },
{ year: "2008/05/07", text: "Dmitry Medvedev" }, { year: "2012/05/07", text: "Vladimir Putin" }]

const uk_context_data = [{ year: "1990/11/28", text: "John Major" }, { year: "1997/05/02", text: "Tony Blair" },
{ year: "2007/06/27", text: "Gordon Brown" }, { year: "2010/05/11", text: "David Cameron" },
{ year: "2016/07/13", text: "Theresa May" }, { year: "2019/07/24", text: "Boris Johnson" }]
// { year: "2022/09/06", text: "Liz Truss" }, { year: "2022/10/25", text: "Rishi Sunak" }]

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

  let scrollerVis;
  const prepare_data = function (data, selected_actor, context, selected_country_string) {
    //parse dates in context data
    let context_parser = d3.timeParse("%Y/%m/%d");
    context.forEach(function (d) {
      d.year = context_parser(d.year)
    })

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
    console.log(pprocess);

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

    //populating the text
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

    d3.select(".one").html(actor + ` is a signatory in the PA-X Agreements database
    as it has been a signatory to ` + num_agt + ` agreements across ` + num_pp +
      ` peace processes since ` + yr_period[0].getUTCFullYear() + `. The most recent
     signed agreement was as ` + found[1][0].signatory_type + ` on ` + ` <a href=` +
      found[1][0].PAX_Hyperlink + ` target="_blank">` + found[1][0].dat + `</a> in ` +
      found[1][0].PPName)

    d3.select(".two").text(`The year when ` + actor + ` signed the most agreements 
    was ` + most_agt[0] + `, namely ` + most_agt[1].length + `. In contrast, the 
    year when they signes the least amount of agreements was ` + least_agt[0] + `.
     They only signed one agreement.`)

    d3.select(".three").html(actor + ` has mostly been involved in ` + agreement_types[agreement_types.length - 1][0] +
      ` agreement types.`)

    d3.select(".four").html(actor + ` has mostly been involved in ` + agreement_stages[agreement_stages.length - 1][0] +
      ` agreement stages.`)

    d3.select(".six").html(actor + ` has participated as a peace agreement signatory
    in ` + num_agt + ` peace processes across ` + the_array.length + ` countries.`)

    scrollerVis = new ScrollerVis({ storyElement: '#story', mapElement: 'map' },
      data, year_division, the_array, context, selected_country_string, most_agt[0],
      agreement_types[agreement_types.length - 1][0],
      agreement_stages[agreement_stages.length - 1][0]);
  }

  prepare_data(ru, "Russia", ru_context_data, "ru")

  // let scrollerVis = new ScrollerVis({ storyElement: '#story', mapElement: 'map' }, data_for_scroll, year_division, the_array);
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
    graphicVisEl = graphicEl.querySelector('.graphic__vis'),
    graphicVisEl1 = graphicEl1.querySelector('.graphic__vis__1'),
    triggerEls = selectionToArray(graphicEl.querySelectorAll('.trigger')),
    triggerEls1 = selectionToArray(graphicEl1.querySelectorAll('.trigger'));

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
