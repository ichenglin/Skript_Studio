import { SkriptExpression } from "./objects/SkriptExpression";

// alternation: (a|b|c|d)
// optional: [a]
// plural: stone|s

// items: https://github.com/SkriptLang/skript-aliases/blob/skript-5/combat.sk

function expression_matches(expression: string, string: string, case_sensitive: boolean = false, strict_match: boolean = false): {string_length: number, expression_length: number, error: string | undefined} {
    try {
        const expression_object = new SkriptExpression(expression, "combination");
        const expression_match = expression_object.matches_begin_string(string, case_sensitive, strict_match);
        // return match result if no errors occurs
        return {
            string_length: expression_match.string_length,
            expression_length: expression_match.expression_length,
            error: undefined
        };
    } catch (error) {
        // if error found, return fallback values with error message set
        return {
            string_length: 0,
            expression_length: 0,
            error: (error as any).toString()
        };
    }
}

export default expression_matches;