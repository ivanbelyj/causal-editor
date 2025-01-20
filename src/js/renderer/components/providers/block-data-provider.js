// import { DataProvider } from "./data-provider";
// import { CommandUtils } from "../../undo-redo/commands/command-utils";

// // Warning: class is AI-generated
// export class BlockDataProvider extends DataProvider {
//     constructor(undoRedoManager, causesChangeManager) {
//         super(undoRedoManager, causesChangeManager);
//     }

//     get _declaredBlock() {
//         return this._data;
//     }

//     getCausesMap() {
//         return this._declaredBlock?.blockCausesMap || {};
//     }

//     getConsequencesMap() {
//         return this._declaredBlock?.blockConsequencesMap || {};
//     }

//     addCauseToBlock(causeKey, causeId) {
//         const block = this._declaredBlock;

//         CommandUtils.executeUndoRedoActionCommand(
//             this.undoRedoManager,
//             () => {
//                 block.blockCausesMap[causeKey] = causeId;
//                 this.causesChangeManager.onCausesAdd(block, [causeId]);
//                 this._dispatchMutated();
//             },
//             () => {
//                 delete block.blockCausesMap[causeKey];
//                 this.causesChangeManager.onCausesRemoved(block, [causeId]);
//                 this._dispatchMutated();
//             }
//         );
//     }

//     removeCauseFromBlock(causeKey) {
//         const block = this._declaredBlock;
//         const causeId = block.blockCausesMap[causeKey];

//         if (causeId) {
//             CommandUtils.executeUndoRedoActionCommand(
//                 this.undoRedoManager,
//                 () => {
//                     delete block.blockCausesMap[causeKey];
//                     this.causesChangeManager.onCausesRemoved(block, [causeId]);
//                     this._dispatchMutated();
//                 },
//                 () => {
//                     block.blockCausesMap[causeKey] = causeId;
//                     this.causesChangeManager.onCausesAdd(block, [causeId]);
//                     this._dispatchMutated();
//                 }
//             );
//         }
//     }
// }
