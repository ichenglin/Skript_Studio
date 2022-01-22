import { SkriptObject, SkriptObjectTypeOnly } from "../objects/SkriptObject";
import { expression_child } from "./expression_child";
import { reader_error } from "./reader_error";

export function bracket_length(script: string, parent_object: SkriptObject): number {
    let bracket_depth = 0, bracket_begin = -1;
    for (let script_index = 0; script_index < script.length; script_index++) {
        switch (script[script_index]) {
            case "(":
                if (bracket_depth === 0) {
                    bracket_begin = script_index;
                }
                bracket_depth++;
                break;

            case ")":
                bracket_depth--;
                if (bracket_depth === 0) {
                    // return the length of the bracket
                    return script_index - bracket_begin + 1;
                } else if (bracket_depth < 0) {
                    throw reader_error("unexpected closing bracket", script.slice(bracket_begin === -1 ? 0 : bracket_begin));
                }
                break;

            case "\"":
                // ignore string
                script_index += expression_child(script.slice(script_index), parent_object) - 1;
                break;

            case "{":
                // ignore variable
                script_index += expression_child(script.slice(script_index), new SkriptObjectTypeOnly("body")) - 1;
                break;
        }
    }
    throw reader_error("bracket not enclosed", script);
}