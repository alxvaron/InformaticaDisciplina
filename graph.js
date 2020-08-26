
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Relación de la Informática con otras disciplinas y ciencias`
)});
  main.variable(observer()).define(["html"], function(html){return(
html `<div class = "chart"/>`
)});
  main.variable(observer()).define(["d3","data","customForceDirectedTree"], function(d3,data,customForceDirectedTree){return(
d3.select('.chart')
            .datum(data)
            .call(customForceDirectedTree)
)});
  main.variable(observer("stylesheet")).define("stylesheet", ["html"], function(html){return(
html`<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" media="all" rel="stylesheet">`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  main.variable(observer("forceDirectedTree")).define("forceDirectedTree", ["d3"], function(d3){return(
function  forceDirectedTree(){
        let margin = {top: 20, right: 10, bottom: 20, left: 10};
        let width = 600;
        let height = 600;
        function chart(selection){
            let data = selection.datum();
            let chartWidth = width - margin.left - margin.right;
            let chartHeight = height - margin.top - margin.bottom;

            let root = d3.hierarchy(data);
            let links = root.links();
            let nodes = root.descendants();
            let simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id).distance(10).strength(0.8))
                .force("charge", d3.forceManyBody().strength(-50))
                .force("center", d3.forceCenter());

            let previousColour =null;
            let access = ["Read","Write","Delete"];

            let isDragging = false;

            // adding tool tip

            let Tooltip = selection
                .append("div")
                .attr("class", "tooltip")
                .style("pointer-events","none")
                .style("border","2px solid #666")
                .style("border-radius","8px")
                .style("color","white");


            let duration = 300;


            let pulse = () => {
                var circle = d3.selectAll(".blink");
                (function repeat() {
                    circle = circle.transition()
                        .duration(duration)
                        .attr("r", 6)
                        .transition()
                        .duration(duration*3)
                        .attr("r", 12)
                        .ease(d3.easeElasticIn)
                        .delay((d, i) => i * 20)
                        // .style("fill", d3.interpolateTurbo(Math.random()))
                        .on("end", repeat);
                })();
            };

            let drag = function (simulation) {
                function dragstarted(d) {
                    isDragging = true;
                    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }

                function dragged(d) {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                }

                function dragended(d) {
                    if (!d3.event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                    isDragging = false;
                }

                return d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended);
            };

            let mouseover = (d)=>{
                Tooltip.transition()
                    .duration(duration)
                    .style("opacity", (d) =>(!isDragging)?0.97: 0);

                Tooltip.html(()=>{

                    let innerColumns =
                        "<div class='col'>Tipo de relación:</div>"+
                        "<div class='col'>"+d.data.name+"</div>";

                    if(!d.children && access.indexOf(d.data.name) in["Read","Write","Delete"]){
                        innerColumns =
                            "<div class='col'>Descripción:</div>"+
                            "<div class='col'>"+d.data.desc+"</div>";
                    }
                    if(d.children && d.depth===0){
                      innerColumns =
                          "<div class='col'>Informática:</div>"+
                          "<div class='col'>"+d.data.name+"</div>";
                  }
                  if(d.children && d.depth===1){
                    innerColumns =
                        "<div class='col'>Relación con:</div>"+
                        "<div class='col'>"+d.data.name+"</div>";
                }
                    return "<div class='card bg-dark'>"+"<div class='card-body'>"+
                        "<div class = 'row'>"+
                        innerColumns +
                        "</div>"+
                        "</div></div>";
                }) .style("left", (d3.event.pageX + 15) + "px")
                  .style("top", (d3.event.pageY - 200) + "px");
            };

            let mouseout = () => {
                Tooltip.transition()
                    .duration(duration)
                    .style("opacity", 0);
            };


            // Building svg
            let svg = selection
                .selectAll('svg')
                .data([data])
                .enter()
                .append('svg')
                .attr("width", chartWidth)
                .attr("height", chartHeight)
                .style("cursor","move");
            svg = svg.merge(svg);

            let g = svg.append("g")
                .attr("transform", `translate(${width / 2}, ${height / 2})`);


            let link = g.append("g")
                .attr("fill", "none")
                .attr("stroke", "#666")
                .attr("stroke-width", "1.5px")
                .selectAll("path")
                .data(links)
                .join("path");


            let defs = g.append('svg:defs');
            defs.append("svg:pattern")
                .attr("id", "image")
                .attr("width", 34)
                .attr("height", 34)
                .attr("x", -16)
                .attr("y", -16)
                .attr("patternUnits", "userSpaceOnUse")
                .attr("patternUnits", "userSpaceOnUse")
                .append("svg:image")
                .attr("xlink:href", "https://user-images.githubusercontent.com/18228016/68896905-56851200-0724-11ea-8a31-b5723aea30fa.png")
                .attr("width", 34)
                .attr("height",34)
                .attr("x", 0)
                .attr("y", 0);


            let node = g.append("g")
                .attr("class", "node")
                .style("cursor", "pointer")
                .selectAll("circle")
                .data(nodes)
                .join("circle")
                .attr("fill", d => {

                    if(d.depth === 0) return "url(#image)";
                    if(d.children){
                        if(1 === d.depth){
                            previousColour = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
                            d.data.color = previousColour;
                            return previousColour;
                        }else if(d.depth>1){
                            d.data.color = d.parent.data.color;
                            return d.parent.data.color;
                        }
                    }else{
                        switch(d.data.name){
                            case "Read":return "#48d146";
                            case "Write":return "#33bbff";
                            case "Delete":return "#ff3332";
                            // default: return
                        }
                    }
                })
                .attr("class",(d)=> (!d.children && access.indexOf(d.data.name) === -1)? "blink": null)
                .attr("stroke", d => (d.depth===0)?null:(!d.children)?"grey":"white")
                .attr("stroke-width", 2)
                .attr("r", d => (d.depth===0)?18:(!d.children)?6:12)
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .each(pulse)
                .call(drag(simulation));

            simulation.on("tick", () => {
                link.attr("d", function(d) {
                    let dx = d.target.x - d.source.x,
                        dy = d.target.y - d.source.y,
                        dr = Math.sqrt(dx * dx + dy * dy);
                    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 1 0,1 " + d.target.x + "," + d.target.y;
                });

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });

            //add zoom capabilities
            let zoomHandler = d3.zoom()
                .on("zoom",zoomAction);

            //Zoom functions
            function zoomAction(){
                g.attr("transform", `translate(${width / 2+ d3.event.transform.x}, ${height / 2+ d3.event.transform.y })`+ "scale(" + d3.event.transform.k + ")");
            }
            zoomHandler(svg);
        }
        chart.width = function (_) {
            return arguments.length ? ((width = _) , chart) : width;
        };
        chart.height = function (_) {
            return arguments.length ? ((height = _) , chart) : height;
        };
        chart.margin = function (_) {
            return arguments.length ? ((margin = _) , chart) : margin;
        };
        return chart;
    }
)});
  main.variable(observer("customForceDirectedTree")).define("customForceDirectedTree", ["forceDirectedTree"], function(forceDirectedTree){return(
forceDirectedTree()
)});
  main.variable(observer()).define(["customForceDirectedTree"], function(customForceDirectedTree){return(
customForceDirectedTree.width(920).height(920)
)});
  main.variable(observer("data")).define("data", function(){return(
{"name": "conjunto de conocimientos teóricos y prácticos, relativos al ámbito de la ciencia y de la tecnología, que se combinan para posibilitar el tratamiento racional y automático de la información mediante sistemas informáticos o computadoras",
"children": [
  {
    "name": "Ciencias de la Computación",
    "children": [
      {
        "name": "Necesidades",
        "children": [
          {"name": "Read",
           "desc": "Desarrollar capacidades para responder a las necesidades de las ciencias de la administración."}
        ]
      },  
      {
        "name": "Crisis de identidad respecto a lo que és la informática."
      },
      {
        "name": "Características",
        "children": [
          {"name": "Read",
           "desc": "Se han convertido en una fuerza indispensable y ubícua - Saraswat & College"},
          {"name": "Write",
          "desc": "El desarrollo tecnológico a medida que amplía nuestras capacidades, modifica nuestras necesidades."}
        ]
      }
      
    ]
},
{
  "name": "Ciencias de la Administración",
  "children": [
    {
      "name": "Necesidades",
      "children": [
        {"name": "Read",
         "desc": "Mejora organizacional mediante las tecnologías de la información"},
        {"name": "Write",
        "desc": "Desarrollar capacidades para responder a necesidades organizativas"},
        
      ]
    },    {
      "name": "Problemas",
      "children": [
        {"name": "Read",
         "desc": "Los desarrollos en tecnologías de la información generan nuevas necesidades en las organizaciones"},
        {"name": "Write",
        "desc": "Las tecnologías de información solo hacen parte de los sistemas de información"},
        {"name": "Delete",
        "desc": "No es únicamente la parte tecnológica, tambien incluye a las organizaciones y personas."}
      ]
    },
    {
      "name": "Campo apropiado para restablecer la conexión entre ciencias de la administración y ciencias sociales."},
    {
      "name": "Características",
      "children": [
        {"name": "Read",
         "desc": "Uso de hardware, software, aplicaciones y demás."},
        {"name": "Write",
        "desc": "Las ciencias de la Administración marcan las necesidades y las tecnologías de información las intentan solventar"},
        {"name": "Delete",
        "desc": "Apoyo a la toma de decisiones."}
      ]
    },
    
  ]
},{
  "name": "Ciencias Sociales",
  "children": [
    {
      "name": "Necesidades",
      "children": [
        {"name": "Read",
         "desc": "Mejora calidad de vida de los seres humanos (comunicación, acceso a información, etc.)"},
        {"name": "Write",
        "desc": "Solventar problemática de gestión y atención en distintos escenarios (sistemas de salud, transporte, educación, entre otros)"},
        
      ]
    },    {
      "name": "Problemas",
      "children": [
        {"name": "Read",
         "desc": "El informático debe empezar a ver a su disciplina más cerca de las ciencias sociales."},
        {"name": "Write",
        "desc": "El desarrollo tecnológico a medida que amplía nuestras capacidades, modifica nuestras necesidades"},
        {"name": "Delete",
        "desc": "No es únicamente la parte tecnológica, tambien incluye a las organizaciones y personas."}
      ]
    },
    
    {
      "name": "Crisis de identidad respecto a lo que és la informática."},
    {
      "name": "Características",
      "children": [
        {"name": "Read",
         "desc": "Los sistemas de información no son únicamente la parte tecnológica, tambien incluye a las organizaciones y personas."},
        {"name": "Write",
        "desc": "Sistemas de información son sistemas sociales técnicamente implementados"},
        {"name": "Delete",
        "desc": "Apoyo a la toma de decisiones."}
      ]
    }
    
  ]
},{
  "name": " Informática como disciplina",
  "children": [
    {
      "name": "Necesidades",
      "children": [
        {"name": "Read",
         "desc": "Saber qué características tiene la informática (componente empiríco)."},
        {"name": "Write",
        "desc": "Qué estamos dispuestos a considerar coo científico (componente conceptual)"},
        
      ]
    },    {
      "name": "Problemas",
      "children": [
        {"name": "Read",
         "desc": "Crisis de identidad ha llevado a algunos autores a cuestionarse si la informática es una disciplina"},
        {"name": "Write",
        "desc": "Interdisciplinariedad de la informática causa esta crisis de identidad."}
      ]
    },
    
    {
      "name": "Todas las metodologías de desarrollo de sistemas asumen supuestos implícitos."},
    {
      "name": "Características",
      "children": [
        {"name": "Read",
         "desc": "Podemos fijarnos en características presenta el desarrollo de sistemas informáticos (dimensión descriptiva). "},
        {"name": "Write",
        "desc": "Podemos fijarnos en qué características debería tener un sistema informático (dimensión normtiva)."},
        {"name": "Delete",
        "desc": "Apoyo a la toma de decisiones."}
      ]
    },
    
  ]
},
{
  "name": "Otras disciplinas",
  "children": [
    {
      "name": "Artes",
      "children": [
        {"name": "Read",
         "desc": "Comparte rasgos con actividades de caracter artístico."}
      ]
    },  
    {
      "name": "Es en gran medida una disciplina ingenieril, conectada con la investigación y el desarrollo tecnológico."
    },
    {
      "name": "Ciencias formales",
      "children": [
        {"name": "Delete",
         "desc": "Existe un vinculo formal e innegable entre la informática y las ciencias formales como la lógica y las matemáticas."}
      ]
    },
    {
      "name": "Ciencias del lenguaje",
      "children": [
        {"name": "Write",
         "desc": "Existe una relación entre la informática y las ciencias del lenguaje."}
      ]
    },
    {
      "name": "Ciencias empíricas",
      "children": [
        {"name": "Read",
         "desc": "A pesar de que su principal actividad es la creación de sistemas de información, también estudia, analiza, evalúa y teoriza sobre sistemas ya existentes."}
      ]
    },
    {
      "name": "Ciencias empírico-naturales",
      "children": [
        {"name": "Delete",
         "desc": "Vinculación con la electrónica, neurofisiología, psicología, ciencias cognitivas, entre otros."}
      ]
    }
  ]
}
]
}
)});
  return main;
}
