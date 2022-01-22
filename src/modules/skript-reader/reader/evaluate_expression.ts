import { SkriptDivider, SkriptDividerComponent } from "../objects/SkriptDivider";
import { SkriptObject, SkriptObjectTypeOnly } from "../objects/SkriptObject";
import { expression_child } from "../system/expression_child";
import { reader_error } from "../system/reader_error";

export function evaluate_expression(script: string, divider: SkriptDivider, parent_object: SkriptObject): SkriptDivider {
    let expression_stage = false, expression_begin = -1;
    for (let script_index = 0; script_index < script.length; script_index++) {
        switch (script[script_index]) {
            case "%":
                // found expression begin/ending character
                if (expression_stage === false) {
                    expression_stage = true;
                    expression_begin = script_index;
                } else {
                    expression_stage = false;
                    divider.add_component({begin_index: expression_begin, end_index: script_index, component_type: "expression"} as SkriptDividerComponent);
                }
                break;
            
            case "\"":
                // ignore string
                if (expression_stage === false) {
                    break;
                }
                script_index += expression_child(script.slice(script_index), parent_object) - 1;
                break;

            case "{":
                // ignore variable
                if (expression_stage === false) {
                    break;
                }
                script_index += expression_child(script.slice(script_index), new SkriptObjectTypeOnly("expression")) - 1;
                break;
        }
    }
    if (expression_stage === true) {
        throw reader_error("incomplete expression statement", script.slice(expression_begin));
    }
    return divider;
}