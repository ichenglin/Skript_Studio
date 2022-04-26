import { SkriptExpressionMatchingSettings } from "../objects/SkriptExpression";

export function matches_optional(expression_field: string, string: string, settings: SkriptExpressionMatchingSettings): number {
    if (settings.case_sensitive === false) {
        // remove case from both matching fields
        expression_field = expression_field.toLowerCase();
        string = string.toLowerCase();
    }
    expression_field = expression_field.replace(/[\[\]]/g, "");
    const matches_pattern = new RegExp(`^${expression_field}`).test(string);
    return matches_pattern ? expression_field.length : -1;
}