export class DeclareBlockHelper {
  createBlock({ declaredBlockId, blockConvention }) {
    return {
      id: declaredBlockId,
      convention: blockConvention,
      causesConvention: null,
      blockCausesMap: {

      },
      blockConsequencesMap: {

      },
    };
  }
}
