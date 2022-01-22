import { SkriptDivider, SkriptDividerComponent } from "../objects/SkriptDivider";
import { SkriptObject } from "../objects/SkriptObject";
import { SkriptType } from "../objects/skript_object_types";
import { expression_child } from "../system/expression_child";

import * as object_type_components from "../data/object_component_types.json";

interface EvaluateKeywordComponent {
    content: string,
    begin_index: number
};

export function evaluate_keyword(script: string, divider: SkriptDivider, parent_object: SkriptObject, keyword_type: SkriptType): SkriptDivider {
    let script_parts = [], last_append_index = -2;
    for (let script_index = 0; script_index < script.length; script_index++) {
        switch (script[script_index]) {
            case "\"":
                // ignore string
                script_index += expression_child(script.slice(script_index), parent_object) - 1;
                break;

            case "{":
                // ignore variable
                script_index += expression_child(script.slice(script_index), parent_object) - 1;
                break;

            default:
                if (last_append_index + 1 < script_index) {
                    // if part is not continuous, add a new part
                    script_parts.push({content: "", begin_index: script_index} as EvaluateKeywordComponent);
                }
                // append character to last part
                script_parts[script_parts.length - 1].content += script[script_index];
                last_append_index = script_index;
                break;
        }
    }
    for (let script_part_index = 0; script_part_index < script_parts.length; script_part_index++) {
        const word_matcher = /([^\w-])?(\w+)([^\w-])?/g;
        let result;
        // loop through each word in the script part
        while((result = word_matcher.exec(script_parts[script_part_index].content)) !== null) {
            const word_match = result[2].toLowerCase();
            const word_match_prefix = result[1] !== undefined ? result[1] : "";
            const word_match_index = script_parts[script_part_index].begin_index + result.index + word_match_prefix.length;
            // check if the word is a keyword of given type
            if (object_type_components[keyword_type].keywords?.find(keyword => new RegExp(keyword).test(word_match.toLowerCase()) === true) !== undefined) {
                divider.add_component({begin_index: word_match_index, end_index: word_match_index + result[2].length - 1, component_type: keyword_type} as SkriptDividerComponent);
            }
        }
    }
    return divider;
}