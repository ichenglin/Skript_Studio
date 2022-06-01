export function random_string(length: number, exclude: string[]): string {
    const available_characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let generated_string: string | null = null;
    while (generated_string === null || exclude.includes(generated_string) === true) {
        let new_characters: string[] = [];
        for (let character_index = 0; character_index < length; character_index++) {
            const available_random = Math.floor(Math.random() * available_characters.length);
            new_characters.push(available_characters.charAt(available_random));
        }
        generated_string = new_characters.join("");
    }
    return generated_string;
}