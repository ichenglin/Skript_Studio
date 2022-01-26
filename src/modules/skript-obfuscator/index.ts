import { evaluate_set } from "./reader/evaluate_set";

function skript_obfuscator(script: string): string {
    const script_sets = evaluate_set(script.split("\n"));
    let script_sets_obfuscated = [];
    for (let set_index = 0; set_index < script_sets.length; set_index++) {
        script_sets_obfuscated.push(script_sets[set_index].export_obfuscated().join("\n"));
    }
    return script_sets_obfuscated.join("\n\n");
}

export default skript_obfuscator;