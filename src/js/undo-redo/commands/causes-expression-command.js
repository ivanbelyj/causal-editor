import { Command } from "./command";

export class CausesExpressionCommand extends Command {
  constructor(causesItem, prevCausesExpr, changedCausesExpr) {
    super(
      function () {
        // console.log("execute. apply changed", changedCausesExpr);
        causesItem.setCausesExpression(changedCausesExpr);
      },
      function () {
        // console.log("undo. apply prev", prevCausesExpr);
        causesItem.setCausesExpression(prevCausesExpr);
      }
    );

    this.prevCausesExpr = prevCausesExpr;
    this.changedCausesExpr = changedCausesExpr;
  }
}
