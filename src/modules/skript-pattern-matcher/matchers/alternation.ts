export function matches_alternation(expression_field: string, string: string, case_sensitive: boolean): number {
    if (case_sensitive === false) {
        // remove case from both matching fields
        expression_field = expression_field.toLowerCase();
        string = string.toLowerCase();
    }
    const alternation_possibilities = expression_field.split("|");
    for (let possibility_index = 0; possibility_index < alternation_possibilities.length; possibility_index++) {
        const loop_possibility = alternation_possibilities[possibility_index];
        if (string.match(`^${loop_possibility}`)) {
            return loop_possibility.length;
        }
    }
    return -1;
}