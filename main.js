import * as d3 from 'd3'
import { feature } from 'topojson'
import { legendColor } from 'd3-svg-legend'


const pathGenerator = d3.geoPath()

const svg = d3.select('svg')
const div = d3.select('div')


const g = svg.append('g')
    .attr('transform', 'translate(50,0)')

    g.call(d3.zoom().on('zoom', () => {
        g.attr('transform', d3.event.transform)
    }))

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

        const minVal = d3.min(counties.features, d => d.properties.bachelorsOrHigher)
        const maxVal = d3.max(counties.features, d => d.properties.bachelorsOrHigher)


        colorScale
            .domain(d3.range(minVal, maxVal, (maxVal-minVal)/8))
            .range(d3.schemeGreens[6])


        g.selectAll('path').data(counties.features)
            .enter().append('path')
                .attr('class', 'county')
                .attr("data-fips", d => rowById[d.id].fips)
                .attr("data-education", d => rowById[d.id].bachelorsOrHigher)
                .attr('d', pathGenerator)
                .attr('fill', d=> colorScale(colorValue(d)))
            .on("mouseover", function(d) {
                    div.attr('data-name', rowById[d.id].area_name)
                    div.attr('data-education', rowById[d.id].bachelorsOrHigher)
                    .html(rowById[d.id].area_name + ': ' + rowById[d.id].bachelorsOrHigher)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                        .style("opacity", 1)

                    })
                .on("mouseout", function(d) {
                    div.style("opacity", 0);
                    });
            

//Legend

const backgroundRect = legend.selectAll('rect')
.data([null])
backgroundRect.enter().append('rect')
  .attr('id', 'legendBox')
  .attr('x', -25)
  .attr('y', -25)
  .attr('width', 200)
  .attr('height', 260)
  .attr('rx', 7)
  .attr('fill', 'white')


const legendLabelArr = function() {
    let arr = []
    for (let i = 0; i < 5 ; i ++ ) {
        arr.push("");
    }
    arr[0] = minVal + "%";
    arr.push(maxVal + "%" );
    console.log(arr)

    return arr
}

const yScale = d3.scaleBand()
.domain([1, 2, 3, 4, 5, 6])
.range([0, innerHeight])
.padding( [0] )

const legendA = legendColor()
.shapeWidth( 50 ) 
.shapeHeight( yScale.bandwidth() / 3 )
.shapePadding( 0 )
.cells( 6 ) 
.orient("vertical") 
.scale( colorScale )
.labels( legendLabelArr() )

legend
    .call(legendA)
        .attr('font-size', '1.5rem')

})

