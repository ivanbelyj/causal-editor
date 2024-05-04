export default class UpgradeToV1Utils {
  static convertKeysToLowerCase(obj) {
    if (typeof obj !== "object" || obj === null) {
      return obj; // If not object, just return it
    }

    if (Array.isArray(obj)) {
      // Recursive process every item
      return obj.map((item) => UpgradeToV1Utils.convertKeysToLowerCase(item));
    }

    // For objects create new object, where keys are converted into lowercase
    return Object.keys(obj).reduce((acc, key) => {
      acc[key.toLowerCase()] = UpgradeToV1Utils.convertKeysToLowerCase(
        obj[key]
      );
      return acc;
    }, {});
  }

  static removeProbabilityNest(fact) {
    if (!fact.probabilityNest || !fact.probabilityNest.causesExpression)
      return fact;

    const { probabilityNest, ...rest } = fact;
    const res = {
      ...rest,
      causesExpression: fact.probabilityNest.causesExpression,
    };
    return res;
  }

  static removeWeightNest(fact) {
    if (!fact.weightNest || !fact.weightNest.weights) return fact;

    const { weightNest, ...rest } = fact;
    return {
      ...rest,
      weights: weightNest.weights,
    };
  }

  static removeTypeVariantProperty(fact) {
    const { $type, ...rest } = fact;
    return rest;
  }

  static renamePropertiesToV1(fact) {
    const { nodeValue, ...rest } = fact;
    return {
      ...rest,
      factValue: nodeValue,
    };
  }
}
