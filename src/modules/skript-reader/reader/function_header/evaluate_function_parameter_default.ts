import { SkriptDivider, SkriptDividerComponent } from "../../objects/SkriptDivider";
import { matcher_group } from "../../system/matcher_group";
import { reader_error } from "../../system/reader_error";

export function evaluate_function_parameter_default(script: string, divider: SkriptDivider): SkriptDivider {
    const parameter_matcher = script.match(/^(\s*)([^:]+)(:\s*)([^= ][^=]*\s*)(?:=(.+))?$/);
    if (parameter_matcher === null) {
        // somehow caused an invalid match, this should never happen since the pattern is already checked in parameter stage
        throw reader_error("invalid function header parameter", script);
    }
    if (parameter_matcher[5] === undefined) {
        // default value doesn't exist;
        return divider;
    }
    // parameter default value exists
    // must add 1 to begin/end indexes due to "=" is excluded from the default value group
    const parameter_default = matcher_group(parameter_matcher, 5, true);
    divider.add_component({begin_index: parameter_default.begin_index + 1, end_index: parameter_default.end_index + 1, component_type: "function_parameter_default"} as SkriptDividerComponent);
    return divider;
}