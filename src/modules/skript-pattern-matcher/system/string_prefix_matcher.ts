export function string_prefix_matcher(string_base: string, string_comparison: string) {
    const string_maximum_length = Math.min(string_base.length, string_comparison.length);
    for (let character_index = 0; character_index < string_maximum_length; character_index++) {
        if (string_base[character_index] !== string_comparison[character_index]) {
            return character_index;
        }
    }
    return string_maximum_length;
}