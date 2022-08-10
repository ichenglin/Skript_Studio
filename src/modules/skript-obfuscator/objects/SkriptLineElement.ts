import skript_reader from "skript-reader";
import { SkriptObject } from "skript-reader/build/objects/SkriptObject";

export class SkriptLineElement {

    private elements: SkriptObject[];
    private processed = {
        variables: [] as string[]
    };

    constructor(script_line: string) {
        this.elements = skript_reader(script_line).collapse_components();
        this.process_elements();
    }

    private process_elements(): void {
        for (let element_index = 0; element_index < this.elements.length; element_index++) {
            const element = this.elements[element_index];
            switch (element.object_type) {
                case "variable":
                    const variable_name_matcher = element.object_content.match(/^{([^a-zA-Z]*\w+)/);
                    if (variable_name_matcher !== null) {
                        this.processed.variables.push(variable_name_matcher[1]);
                    }
                    break;

                case "function_parameter_name":
                    this.processed.variables.push("_" + element.object_content);
                    break;

                default:
                    // ignore
            }
        }
    }

    public get_processed() {
        return this.processed;
    }

    public get_elements(): SkriptObject[] {
        return this.elements;
    }
}