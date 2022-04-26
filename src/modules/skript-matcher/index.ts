import { SkriptExpression } from "./objects/SkriptExpression";
import { fix_string_spacing } from "./system/fix_string_spacing";

// alternation: (a|b|c|d)
// optional: [a]
// plural: stone|s

// items: https://github.com/SkriptLang/skript-aliases/blob/skript-5/combat.sk

function expression_matches(expression: string, string: string, case_sensitive: boolean = false, strict_match: boolean = false): {string_length: number, expression_length: number, error: string | undefined} {
    try {
        // remove spacings
        const expression_spaceless = expression.replace(/\s+/g, "");
        const string_spaceless = string.replace(/\s+/g, "");
        // match string with expression (spaceless)
        const expression_object = new SkriptExpression(expression_spaceless, "combination");
        const expression_match = expression_object.matches_begin_string(string_spaceless, {case_sensitive: case_sensitive, strict_matching: strict_match});
        // insert spacings back
        const string_match_fixed = fix_string_spacing(string, string_spaceless.slice(0, expression_match.string_length));
        const expression_match_fixed = fix_string_spacing(expression, expression_spaceless.slice(0, expression_match.expression_length));
        // return match result if no errors occurs
        return {
            string_length: string_match_fixed.length,
            expression_length: expression_match_fixed.length,
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

/*const expression = "a [(b|d|a|wtf) wtf [(a|b)]] o";
const string = "a dwtf o"
const match = expression_matches(expression, string, false, false);
console.log(match);
console.log("|" + expression.slice(0, match.expression_length) + "|");
console.log("|" + string.slice(0, match.string_length) + "|");*/

export default expression_matches;