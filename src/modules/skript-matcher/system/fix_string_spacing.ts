export function fix_string_spacing(original_string: string, spaceless_string: string) {
    let spaceless_index = 0, fixed_string = "";
    for (let original_index = 0; original_index < original_string.length; original_index++) {
        const original_character = original_string[original_index];
        const spaceless_character = spaceless_string[spaceless_index];
        fixed_string += original_character;
        if (original_character === spaceless_character) {
            // character is matching
            spaceless_index++;
        }
        if (spaceless_index === spaceless_string.length) {
            // fixed all matching string
            break;
        }
    }
    return fixed_string;
}