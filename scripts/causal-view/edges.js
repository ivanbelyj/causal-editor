export function updateEdges(edgePathSelection, line, nodeWidth, nodeHeight) {
  return edgePathSelection.attr("d", (d) => {
    return line([
      { x: d.source.x + nodeWidth / 2, y: d.source.y + nodeHeight / 2 },
      { x: d.target.x + nodeWidth / 2, y: d.target.y + nodeHeight / 2 },
    ]);
  });
}

// Ребра идентифицируются по id источника и цели
export function sourceAndTargetIdsToEdgeId(source, target) {
  return `${source}--${target}`;
}

export function addEdges(
  svgSelection,
  dag,
  nodeIdsAndColors,
  implementationEdges,
  line
) {
  const defs = svgSelection.append("defs"); // For gradients

  const edgePathSelection = svgSelection
    .append("g")
    .selectAll("path")
    .data(dag.links())
    .enter()
    .append("path")
    .attr("class", "edge");

  updateEdges(edgePathSelection, line, 140, 40)
    .attr("fill", "none")
    .attr("stroke-width", 3)
    .attr("stroke", ({ source, target }) => {
      // encodeURIComponents for spaces, hope id doesn't have a `--` in it
      const gradId = encodeURIComponent(
        `${source.data["Id"]}--${target.data["Id"]}`
      );
      const grad = defs
        .append("linearGradient")
        .attr("id", gradId)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", source.x)
        .attr("x2", target.x)
        .attr("y1", source.y)
        .attr("y2", target.y);
      grad
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", nodeIdsAndColors.get(source.data["Id"]));
      grad
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", nodeIdsAndColors.get(target.data["Id"]));
      return `url(#${gradId})`;
    })
    .attr("stroke-dasharray", ({ source, target }) => {
      const edgeId = sourceAndTargetIdsToEdgeId(
        source.data["Id"],
        target.data["Id"]
      );
      const isEdgeImplementation = implementationEdges.has(edgeId);
      return isEdgeImplementation ? "5,5" : "";
    });
}

function addArrows(svgSelection, dag, nodeWidth, colorMap) {
  const arrowSize = (nodeWidth * nodeWidth) / 5.0;
  const arrowLen = Math.sqrt((4 * arrowSize) / Math.sqrt(3));
  const arrow = d3.symbol().type(d3.symbolTriangle).size(arrowSize);
  svgSelection
    .append("g")
    .selectAll("path")
    .data(dag.links())
    .enter()
    .append("path")
    .attr("d", arrow)
    .attr("transform", ({ source, target, points }) => {
      const [end, start] = points.slice().reverse();
      // This sets the arrows the node radius (20) + a little bit (3) away from the node center,
      // on the last line segment of the edge. This means that edges that only span ine level
      // will work perfectly, but if the edge bends, this will be a little off.
      const dx = start.x - end.x;
      const dy = start.y - end.y;
      const scale = (nodeWidth * 1.15) / Math.sqrt(dx * dx + dy * dy);
      // This is the angle of the last line segment
      const angle = (Math.atan2(-dy, -dx) * 180) / Math.PI + 90;
      // console.log(angle, dx, dy);
      return `translate(${end.x + dx * scale}, ${
        end.y + dy * scale
      }) rotate(${angle})`;
    })
    .attr("fill", ({ target }) => colorMap[target.data["Id"]])
    .attr("stroke", "white")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", `${arrowLen},${arrowLen}`);
}
