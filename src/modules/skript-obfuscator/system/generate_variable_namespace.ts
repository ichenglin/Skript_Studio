export function generate_variable_namespace(used_variables: string[], length: number): {[key: string]: string} {
    let generated_variables: {[key: string]: string} = {}, used_namespaces: string[] = [];
    for (let used_index = 0; used_index < used_variables.length; used_index++) {
        const variable_full = used_variables[used_index];
        if (generated_variables[variable_full] !== undefined) {
            continue;
        }
        const variable_full_matcher = variable_full.match(/^([^a-zA-Z\d]*)([\w\d]+)/);
        const variable_header = variable_full_matcher ? variable_full_matcher[1] : "";
        let variable_obfuscated = null;
        while (variable_obfuscated === null || used_namespaces.includes(variable_obfuscated)) {
            variable_obfuscated = variable_header + generate_random_string(length);
        }
        generated_variables[variable_full] = variable_obfuscated;
        used_namespaces.push(variable_obfuscated);
    }
    return generated_variables;
}

function generate_random_string(length: number): string {
    const available_characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let random_string = "";
    for (let index = 0; index < length; index++) {
        random_string += available_characters.charAt(Math.floor(Math.random() * available_characters.length));
    }
    return random_string;
}