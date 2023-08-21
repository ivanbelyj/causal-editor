import * as d3 from "d3";

// Class that allows to create or remove nodes in causal view
export class NodesManager {
  constructor(causalViewStructure) {
    this.structure = causalViewStructure;
  }

  createNode(x, y) {
    const causalViewElement = NodesManager.elementWithClassFrom(
      { x, y },
      "causal-view"
    );
    if (!causalViewElement) return;

    const newFact = this.createCausalModelFact();

    this.structure.addNode(newFact, this.screenPointToSvg({ x, y }));
    this.structure.render();
  }

  screenPointToSvg({ x, y }) {
    const svg = d3.select("svg");
    const g = svg.select("g");
    const point = svg.node().createSVGPoint();
    point.x = x;
    point.y = y;
    const { x: svgX, y: svgY } = point.matrixTransform(
      g.node().getScreenCTM().inverse()
    );
    return { x: svgX, y: svgY };
  }

  createCausalModelFact() {
    // Pascal case due to the causal model format
    const newFact = {
      Id: null,
      ProbabilityNest: {
        CausesExpression: {
          $type: "factor",
          Edge: {
            Probability: 1,
          },
        },
      },
      NodeValue: "New Fact",
    };
    newFact.Id = crypto.randomUUID();
    return newFact;
  }

  removeNode(x, y) {
    const nodeElement = NodesManager.nodeElementFromPoint({ x, y }, "node");
    // if (!nodeElement) return;
    const node = d3.select(nodeElement).data()[0];
    this.structure.removeNode(node.data.Id);
    this.structure.render();
  }

  static elementWithClassFrom(pos, className) {
    const elems = NodesManager.getElementsByPos(pos);
    for (const elem of elems) {
      for (const curClassName of elem.classList) {
        if (curClassName == className) {
          return elem;
        }
      }
    }
    return null;
  }
  static getElementsByPos(pos) {
    return document.elementsFromPoint(pos.x, pos.y);
  }

  // document.elementsFromPoint ignores <g> because it is used only for
  // grouping, not displaying, so there is a hack, depending on node structure
  static nodeElementFromPoint(pos) {
    const elems = NodesManager.getElementsByPos(pos);
    for (const elem of elems) {
      if (elem.tagName == "rect") {
        if (elem.parentNode.classList.contains("node")) {
          return elem.parentNode;
        }
      }
    }
    return null;
  }
}
