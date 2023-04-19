import { causalView } from "./causal-view/causal-view.js";
import { characterFacts } from "./test-data.js";

(() => {
    const idBasedData = JSON.parse(characterFacts);
    causalView(".causal-view", idBasedData);
})();
