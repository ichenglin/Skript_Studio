import { generate_variable_namespace } from "../system/generate_variable_namespace";
import { SkriptLineElement } from "./SkriptLineElement";

export class SkriptSet {

    private scripts_original: string[];
    private scripts_obfuscated: string[];

    private scripts_elements: SkriptLineElement[];
    private scripts_processed: {
        variables_used: string[]
        variables_namespace: {[key: string]: string}
    };

    constructor(lines: string[]) {
        this.scripts_original = lines;
        this.scripts_obfuscated = [];
        this.scripts_elements = [];
        this.scripts_processed = {
            variables_used: [],
            variables_namespace: {}
        };
    }

    private obfuscate(): void {
        this.scripts_obfuscated = [];
        this.scripts_elements = [];
        for (let line_index = 0; line_index < this.scripts_original.length; line_index++) {
            this.scripts_elements.push(new SkriptLineElement(this.scripts_original[line_index]));
        }
        for (let processed_index = 0; processed_index < this.scripts_original.length; processed_index++) {
            this.scripts_processed.variables_used.push(...this.scripts_elements[processed_index].get_processed().variables);
        }
        // generate variable namespaces
        this.scripts_processed.variables_namespace = generate_variable_namespace(this.scripts_processed.variables_used, 8);
        // generate obfuscated lines
        for (let line_index = 0; line_index < this.scripts_elements.length; line_index++) {
            const elements = this.scripts_elements[line_index].get_elements();
            if (elements.length <= 1 && elements[0].object_type === "body" && elements[0].object_content === "") {
                // empty line
                continue;
            }
            let obfuscated_line = "", element_output = 0;
            for (let element_index = 0; element_index < elements.length; element_index++) {
                const loop_element = elements[element_index];
                switch (loop_element.object_type) {
                    case "variable":
                        const variable_name_matcher = loop_element.object_content.match(/^{([^a-zA-Z\d]*)([\w\d]+)(.*)/);
                        const variable_name_full = variable_name_matcher ? variable_name_matcher[1] + variable_name_matcher[2] : "";
                        if (variable_name_matcher && variable_name_matcher[1] === "_" && this.scripts_processed.variables_namespace[variable_name_full] !== undefined) {
                            // currenty only obfuscating local variables (variable_name_matcher[1] === "_")
                            obfuscated_line += "{" + this.scripts_processed.variables_namespace[variable_name_full] + variable_name_matcher[3];
                        } else {
                            obfuscated_line += loop_element.object_content;
                        }
                        break;

                    case "function_parameter_name":
                        const function_parameter_name_replacement = this.scripts_processed.variables_namespace["_" + loop_element.object_content];
                        if (function_parameter_name_replacement !== undefined) {
                            obfuscated_line += function_parameter_name_replacement.slice(1);
                        } else {
                            obfuscated_line += loop_element.object_content;
                        }
                        break;

                    case "function_parameter_type":
                        const function_parameter_type_matcher = loop_element.object_content.match(/^.*s$/);
                        if (function_parameter_type_matcher !== null) {
                            // type end with "s", must be an array (list)
                            obfuscated_line += "objects";
                        } else {
                            obfuscated_line += "object"
                        }
                        break;

                    case "comment":
                        // ignore
                        break;

                    default:
                        obfuscated_line += loop_element.object_content;
                        break;
                }
                if (loop_element.object_type !== "indention" && loop_element.object_type !== "comment") {
                    element_output++;
                }
            }
            if (element_output <= 0) {
                // empty line without indention and comments
                continue;
            }
            this.scripts_obfuscated.push(obfuscated_line);
        }
    }

    public export_obfuscated(): string[] {
        this.obfuscate();
        return this.scripts_obfuscated;
    }

}