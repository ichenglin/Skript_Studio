import skript_reader from "skript-reader";

export function clear_comment(script_line: string): string {
    if (!script_line.includes("#")) {
        return script_line;
    }
    let script_elements = skript_reader(script_line).collapse_components();
    script_elements = script_elements.filter(element => element.object_type !== "comment");
    let script_without_comment = "";
    for (let element_index = 0; element_index < script_elements.length; element_index++) {
        script_without_comment += script_elements[element_index].object_content;
    }
    return script_without_comment;
}