export function matches_optional(expression_field: string, string: string, case_sensitive: boolean): number {
    if (case_sensitive === false) {
        // remove case from both matching fields
        expression_field = expression_field.toLowerCase();
        string = string.toLowerCase();
    }
    expression_field = expression_field.replace(/[\[\]]/g, "");
    const matches_pattern = new RegExp(`^${expression_field}`).test(string);
    return matches_pattern ? expression_field.length : -1;
}