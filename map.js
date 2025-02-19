// Set up dimensions
const width = 960;
const height = 600;

// Add title
d3.select('#map')
    .append('h1')
    .style('text-align', 'left')
    .style('font-family', 'adobe-caslon-pro, serif')
    .style('color', '#361B17')
    .style('margin-bottom', '20px')
    .text('Adoption Agreements By State');

// Add subtitle
d3.select('#map')
    .append('p')
    .style('text-align', 'left')
    .style('font-family', 'adobe-caslon-pro, serif')
    .style('color', '#361B17')
    .style('font-size', '18px')
    .text('Review actual adoption surrender documents used across America during the closed adoption era. These historical records demonstrate that despite common misconceptions, no state legally committed to perpetual secrecy in adoption.');

// Create SVG
const svg = d3.select('#map')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

// Create a projection
const projection = d3.geoAlbersUsa()
    .scale(1300)
    .translate([width / 2, height / 2]);

// Create path generator
const path = d3.geoPath()
    .projection(projection);

// Create tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ddd")
    .style("padding", "10px")
    .style("pointer-events", "none");

// Load both data files
Promise.all([
    d3.json('data/us-states.json'),
    d3.csv('data/data.csv')
]).then(function(data) {
    const [us, agreements] = data;
    
    // Create a lookup for state data - Group all entries by state
    const agreementsByState = {};
    agreements.forEach(d => {
        if (!agreementsByState[d.STATE]) {
            agreementsByState[d.STATE] = [];
        }
        agreementsByState[d.STATE].push({
            year: d.YEAR,
            source: d.SOURCE,
            link: d.Link
        });
    });

    // Draw states
    svg.append("g")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "state")
        .style("fill", "#F6EBEA")
        .style("stroke", "#fff")
        .style("stroke-width", "0.5")
        .on("mouseover", function(event, d) {
            const stateData = agreementsByState[d.properties.name.toUpperCase()];
            
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);

            let content = `<strong>${d.properties.name}</strong><br/><br/>`;
            if (stateData && stateData.length > 0) {
                // Sort entries by year
                stateData.sort((a, b) => a.year - b.year);
                stateData.forEach(entry => {
                    content += `Year: ${entry.year}<br/>`;
                    content += `Source: ${entry.source}<br/><br/>`;
                });
            } else {
                content += 'No data available';
            }
            
            tooltip.html(content)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
                
            d3.select(this).style("fill", "#808080");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            d3.select(this).style("fill", "#F6EBEA");
        })
        .on("click", function(event, d) {
            const stateData = agreementsByState[d.properties.name.toUpperCase()];
            if (stateData && stateData[0].link) {
                window.open(stateData[0].link, '_blank');
            }
        });
});
