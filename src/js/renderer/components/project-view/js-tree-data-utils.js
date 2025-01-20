export const causalModelsNodeId = "67024554-218e-4287-a6bc-670f11263bb5";

export class JsTreeDataUtils {
  static projectDataToJsTreeData(projectData) {
    return [
      {
        id: causalModelsNodeId,
        text: "Causal Models",
        state: {
          opened: true,
        },
        children: JsTreeDataUtils.#toChildren(projectData.causalModels),
      },
      {
        text: "Conventions",
        children: JsTreeDataUtils.#toChildren(projectData.conventions),
      },
      {
        text: "Causes Conventions",
        children: JsTreeDataUtils.#toChildren(projectData.causesConventions),
      },
      {
        text: "Resolving Map",
        children: JsTreeDataUtils.#toChildren(projectData.resolvingMap),
      },
    ];
  }

  static #toChildren(array) {
    return (
      array?.map((data) => ({
        text: data.name,
        id: data.name,
      })) ?? []
    );
  }
}
