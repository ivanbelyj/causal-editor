import * as d3 from "d3";

export class ScreenUtils {
  static screenPointToSvg({ x, y }) {
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

  static elementWithClassFrom(pos, className) {
    const elems = ScreenUtils.getElementsByPos(pos);
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
    const elems = ScreenUtils.getElementsByPos(pos);
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
