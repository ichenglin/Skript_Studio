import { SkriptDivider, SkriptDividerComponent } from "../objects/SkriptDivider";

export function evaluate_comment(script: string, divider: SkriptDivider): SkriptDivider {
    for (let script_index = 0; script_index < script.length; script_index++) {
        if (script[script_index] === "#" && script[script_index + 1] === "#") {
            // double # found, this is escaped comment character
            script_index++;
            continue;
        } else if (script[script_index] === "#" && script[script_index + 1] !== "#") {
            // single # found, this is comment character
            divider.add_component({begin_index: script_index, end_index: script.length - 1, component_type: "comment"} as SkriptDividerComponent);
            return divider;
        }
    }
    // no comment character found
    return divider;
}