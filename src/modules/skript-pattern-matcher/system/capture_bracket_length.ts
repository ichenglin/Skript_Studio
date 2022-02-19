export function capture_bracket_length(expression_field: string): number {
    let bracket_sequence = [];
    for (let expression_index = 0; expression_index < expression_field.length; expression_index++) {
        let expect_enclose_bracket: string | null = null;
        switch (expression_field[expression_index]) {
            case "(":
                bracket_sequence.push(")");
                continue;

            case ")":
                expect_enclose_bracket = ")";
                break;

            case "[":
                bracket_sequence.push("]");
                continue;

            case "]":
                expect_enclose_bracket = "]";
                break;

            default:
                continue;
        }
        const last_index = bracket_sequence.length - 1;
        if (bracket_sequence[last_index] === expect_enclose_bracket) {
            // valid enclose bracket, remove from sequence
            bracket_sequence.pop();
            // check if bracket is fully enclosed
            if (bracket_sequence.length <= 0) {
                return expression_index + 1;
            }
        } else {
            // invalid enclose bracket
            return -1;
        }
    }
    // bracket not fully enclosed
    return -1;
}