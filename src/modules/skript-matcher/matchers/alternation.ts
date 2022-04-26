import { SkriptExpressionMatchingSettings } from "../objects/SkriptExpression";

export function matches_alternation(expression_field: string, string: string, settings: SkriptExpressionMatchingSettings): number {
    if (settings.case_sensitive === false) {
        // remove case from both matching fields
        expression_field = expression_field.toLowerCase();
        string = string.toLowerCase();
    }
    let filtered_possibilities = expression_field.split("|");
    for (let character_index = 0; character_index < string.length + 1; character_index++) {
        const new_filtered_possibilities = filtered_possibilities.filter(possibility => possibility.length > character_index && possibility[character_index] === string[character_index]);
        if (new_filtered_possibilities.length <= 0) {
            // next filter will wipe all, get the best match
            return character_index;
        }
        filtered_possibilities = new_filtered_possibilities;
    }
    /*for (let possibility_index = 0; possibility_index < alternation_possibilities.length; possibility_index++) {
        const loop_possibility = alternation_possibilities[possibility_index];
        if (string.match(`^${loop_possibility}`)) {
            return loop_possibility.length;
        }
    }*/
    return -1;
}