import { SkriptDivider, SkriptDividerComponent } from "../objects/SkriptDivider";
import { SkriptObject } from "../objects/SkriptObject";
import { expression_child } from "../system/expression_child";
import { reader_error } from "../system/reader_error";

export function evaluate_variable(script: string, divider: SkriptDivider, parent_object: SkriptObject, ignore_error: boolean = false): SkriptDivider {
    // prevent nested variable from causing infinite loop
    let variable_stage = 0, variable_begin = -1;
    for (let script_index = 0; script_index < script.length; script_index++) {
        switch (script[script_index]) {
            case "{":
                if (variable_stage === 0) {
                    variable_begin = script_index;
                }
                variable_stage++;
                break;

            case "}":
                variable_stage--;
                if (variable_stage === 0) {
                    divider.add_component({begin_index: variable_begin, end_index: script_index, component_type: "variable"} as SkriptDividerComponent);
                } else if (variable_stage < 0 && parent_object.object_type !== "variable" && parent_object.object_type !== "expression") {
                    throw reader_error("unexpected variable enclose character '}'", script.slice(variable_begin, script_index + 1));
                }
                break;

            case "\"":
                // ignore string
                script_index += expression_child(script.slice(script_index), parent_object) - 1;
                break;
        }
    }
    if (ignore_error === false && variable_stage > 0) {
        throw reader_error("variable not enclosed", script.slice(variable_begin));
    }
    return divider;
}