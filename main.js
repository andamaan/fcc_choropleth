import * as d3 from 'd3'
import { feature } from 'topojson'

const pathGenerator = d3.geoPath()

const svg = d3.select('svg')
const div = d3.select('div')

const g = svg.append('g')
    .attr('transform', 'translate(50,0)')

const legend = svg.append('g')
    .attr('id', 'legend')
    .attr('transform', 'translate(1000,300)')

div.attr("id", "tooltip")
    .style("opacity", 0)

const colorValue = d => d.properties.bachelorsOrHigher
const colorScale= d3.scaleLinear()

Promise
    .all([
        d3.json('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json'),
        d3.json('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json')
    ])
    .then(([eduData, topoJSONdata]) => { 

        const  rowById = eduData.reduce((accumulator, d)=> {
            accumulator[d.fips] = d
            return accumulator
        }, {})
        
        const counties = feature(topoJSONdata, topoJSONdata.objects.counties)
        counties.features.forEach(d=> {
            Object.assign(d.properties, rowById[d.id])
        })

        colorScale
            .domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
            .range(d3.schemeGreens[6])


        g.selectAll('path').data(counties.features)
            .enter().append('path')
                .attr('class', 'county')
                .attr("data-fips", d => rowById[d.id].fips)
                .attr("data-education", d => rowById[d.id].bachelorsOrHigher)
                .attr('d', pathGenerator)
                .attr('fill', d=> colorScale(colorValue(d)))
            //.append('title')
            //    .text(d => rowById[d.id].area_name)
            .on("mouseover", function(d) {
                    div.attr('data-name', rowById[d.id].area_name)
                    div.attr('data-education', rowById[d.id].bachelorsOrHigher)
                    .html(rowById[d.id].area_name)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                        .style("opacity", 1)

                    })
                .on("mouseout", function(d) {
                    div.style("opacity", 0);
                    });
            
                
        legend.selectAll('.tick')
        .data(colorScale.domain())
        .enter().append('g')
            .attr('class', 'tick')
            .attr('transform', (d, i) => `translate(0, ${i * 25})`)
            .append('rect')
                .attr('width', 25)
                .attr('height', 25)
                .attr('fill', colorScale)
        legend.selectAll('.ticks')
        .data(colorScale.domain())
        .enter().append('g')
            .attr('class', 'tick')
            .attr('transform', (d, i) => `translate(0, ${i * 25})`)
                .append('text')
                .text(d => d)
                .attr('dy', '0.32em')
                .attr('x', 30)
                .attr('y', 5)

    })

