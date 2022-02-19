import { SkriptExpression } from "./objects/SkriptExpression";

// alternation: (a|b|c|d)
// optional: [a]
// plural: stone|s

// items: https://github.com/SkriptLang/skript-aliases/blob/skript-5/combat.sk

function expression_matches(expression: string, string: string, case_sensitive: boolean = false, strict_match: boolean = false): {string_length: number, expression_length: number} {
    const expression_object = new SkriptExpression(expression, "combination");
    const expression_match = expression_object.matches_begin_string(string, case_sensitive, strict_match);
    return expression_match;
}

export default expression_matches;