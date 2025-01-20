export class DeclareBlockHelper {
  createBlock({ declaredBlockId, blockConvention }) {
    return {
      id: declaredBlockId,
      convention: blockConvention,
      //   causesConvention: "TestCausesConvention",
      //   blockCausesMap: {
      //     BlockCause: "BlockCause1",
      //   },
      //   blockConsequencesMap: {
      //     BlockConsequence: "BlockConsequence1",
      //   },
    };
  }
}
