import { SkriptDivider, SkriptDividerComponent } from "../../objects/SkriptDivider";
import { SkriptObjectTypeOnly } from "../../objects/SkriptObject";
import { bracket_length } from "../../system/bracket_length";
import { expression_child } from "../../system/expression_child";
import { reader_error } from "../../system/reader_error";

export function evaluate_function_parameter(script: string, divider: SkriptDivider): SkriptDivider {
    const function_parameter_matcher = script.match(/^([\w\d]+)\((.*)\)$/);
    if (function_parameter_matcher === null) {
        // somehow caused an invalid match, this should never happen
        return divider;
    }
    // append "," to the end of the parameter string to include last parameter group
    const function_parameter = function_parameter_matcher && function_parameter_matcher[2] !== "" ? function_parameter_matcher[2] + "," : "";
    const function_parameter_begin = function_parameter_matcher[1].length + 1;
    // split parameter string into parameter groups
    let parameter_begin = 0;
    for (let parameter_index = 0; parameter_index < function_parameter.length; parameter_index++) {
        switch (function_parameter[parameter_index]) {
            case ",":
                const parameter_string = function_parameter.slice(parameter_begin, parameter_index);
                const parameter_matcher = parameter_string.match(/^(\s*)([^:]+)(:\s*)([^= ][^=]*\s*)(?:=(.+))?$/);
                if (parameter_matcher === null) {
                    // this function header parameter doesn't match the pattern, must be an error
                    throw reader_error("invalid function header parameter", parameter_string);
                }
                // get the indention before/after the parameter
                const parameter_indention_prefix = parameter_matcher[1] ? parameter_matcher[1].length : 0;
                const parameter_indention_suffix_matcher = parameter_string.match(/(\s*)$/);
                const parameter_indention_suffix = parameter_indention_suffix_matcher ? parameter_indention_suffix_matcher[1].length : 0;
                divider.add_component({
                    begin_index: function_parameter_begin + parameter_begin + parameter_indention_prefix,
                    end_index: function_parameter_begin + parameter_index - parameter_indention_suffix - 1,
                    component_type: "function_parameter"
                } as SkriptDividerComponent);
                // set the parameter begin index for next parameter group
                parameter_begin = parameter_index + 1;
                break;

            case "(":
                // skip default value with brackets
                parameter_index += bracket_length(function_parameter.slice(parameter_index), new SkriptObjectTypeOnly("function")) - 1;
                break;

            case "\"":
                // skip default value with strings
                parameter_index += expression_child(function_parameter.slice(parameter_index), new SkriptObjectTypeOnly("function")) - 1;
                break;
    
            case "{":
                // skip default value with variables
                parameter_index += expression_child(function_parameter.slice(parameter_index), new SkriptObjectTypeOnly("function")) - 1;
                break;
        }
    }
    return divider;
}