import { SkriptDivider, SkriptDividerComponent } from "../objects/SkriptDivider";
import { SkriptObject } from "../objects/SkriptObject";
import { expression_child } from "../system/expression_child";
import { reader_error } from "../system/reader_error";

export function evaluate_string(script: string, divider: SkriptDivider, parent_object: SkriptObject, ignore_error: boolean = false): SkriptDivider {
    const parents_include_string = parent_object.parent_types.includes("string");
    let string_stage = false, string_begin = -1;
    for (let script_index = 0; script_index < script.length; script_index++) {
        switch (script[script_index]) {
            case "\"":
                // found "
                if (parents_include_string === false) {
                    if (string_stage === false) {
                        // currently not in string, begin string
                        string_stage = true;
                        string_begin = script_index;
                    } else if (script[script_index + 1] === "\"") {
                        // double " in string, escape character
                        script_index++;
                    } else {
                        // in string and not escape character
                        string_stage = false;
                        divider.add_component({begin_index: string_begin, end_index: script_index, component_type: "string"} as SkriptDividerComponent);
                    }
                } else {
                    if (ignore_error !== true && script[script_index + 1] !== "\"") {
                        // if not double ", throw error
                        // should not be able to reach here, but still added incase
                        throw reader_error("string literal not enclosed", script.slice(script_index));
                    } else if (string_stage === false) {
                        string_stage = true;
                        string_begin = script_index;
                    } else {
                        string_stage = false;
                        divider.add_component({begin_index: string_begin, end_index: script_index + 1, component_type: "string"} as SkriptDividerComponent);
                    }
                    script_index++;
                }
                break;

            case "{":
                if (string_stage === true) {
                    break;
                }
                script_index += expression_child(script.slice(script_index), parent_object) - 1;
                break;
        }

    }
    if (ignore_error !== true && string_stage === true) {
        // string not closed after looping through script
        throw reader_error("string literal not enclosed", script.slice(string_begin));
    }
    return divider;
}