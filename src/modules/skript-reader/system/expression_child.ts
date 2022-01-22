import { SkriptDivider } from "../objects/SkriptDivider";
import { SkriptObject } from "../objects/SkriptObject";
import { evaluate_string } from "../reader/evaluate_string";
import { evaluate_variable } from "../reader/evaluate_variable";

export function expression_child(script: string, parent_object: SkriptObject): number {
    switch (script[0]) {
        case "\"":
            // ignore string
            const ignore_string_component = evaluate_string(script, new SkriptDivider(), parent_object, true).get_component();
            if (ignore_string_component.length <= 0) {
                //throw reader_error("incomplete expression statement", script);
                return 1;
            }
            return ignore_string_component[0].end_index - ignore_string_component[0].begin_index + 1;

        case "{":
            // ignore variable
            const ignore_variable_component = evaluate_variable(script, new SkriptDivider(), parent_object, true).get_component();
            if (ignore_variable_component.length <= 0) {
                //throw reader_error("incomplete expression statement", script);
                return 1;
            }
            return ignore_variable_component[0].end_index - ignore_variable_component[0].begin_index + 1;

        default:
            return 1;
    }
}