import { SkriptType } from "./skript_object_types";
import { evaluate_string } from "../reader/evaluate_string";
import { SkriptDivider } from "./SkriptDivider";

import { evaluate_variable } from "../reader/evaluate_variable";
import { evaluate_number } from "../reader/evaluate_number";
import { evaluate_expression } from "../reader/evaluate_expression";
import { evaluate_comment } from "../reader/evaluate_comment";
import { evaluate_indention } from "../reader/evaluate_indention";
import { evaluate_function } from "../reader/evaluate_function";
import { evaluate_keyword } from "../reader/evaluate_keyword";
import { evaluate_function_parameter } from "../reader/function_header/evaluate_function_parameter";
import { evaluate_function_parameter_name } from "../reader/function_header/evaluate_function_parameter_name";
import { evaluate_function_parameter_type } from "../reader/function_header/evaluate_function_parameter_type";
import { evaluate_function_parameter_default } from "../reader/function_header/evaluate_function_parameter_default";

import * as object_type_components from "../data/object_component_types.json";

export class SkriptObject {

    readonly object_content: string;
    readonly object_type: SkriptType;
    readonly object_depth: number;
    readonly inner_components: SkriptObject[];
    readonly parent_types: SkriptType[];
    readonly object_data: {[key: string]: any} = {};

    constructor(content: string, type: SkriptType, depth: number, parent_types: SkriptType[], parent_data: {[key: string]: any}, final: boolean) {
        this.object_content = content;
        this.object_type = type;
        this.object_depth = depth;
        this.parent_types = parent_types;

        this.object_data = {
            object_final: final,
            function_header: (depth === 0 ? content.match(/^(\s*function )(.+)$/) !== null : parent_data.function_header)
        };

        this.inner_components = final ? [] : this.evaluate_components();
    }
    
    public collapse_components(): SkriptObject[] {
        if (this.inner_components.length <= 0) {
            return [this];
        }
        let inner_component_collapsed: SkriptObject[] = [];
        for (let inner_component_index = 0; inner_component_index < this.inner_components.length; inner_component_index++) {
            inner_component_collapsed = inner_component_collapsed.concat(this.inner_components[inner_component_index].collapse_components());
        }
        return inner_component_collapsed;
    }

    private evaluate_components(): SkriptObject[] {
        if (this.object_content.length <= 0) {
            // no content, therefore no components
            return [];
        }
        const type = this.object_type.toString();
        const type_components = object_type_components[type as keyof typeof object_type_components].child_components as SkriptType[];
        let component_divider = new SkriptDivider();
        let content_without_comment = this.object_content
        for (let type_components_index = 0; type_components_index < type_components.length; type_components_index++) {
            const loop_type_component = type_components[type_components_index];
            const loop_type_maximum_depth = object_type_components[loop_type_component as keyof typeof object_type_components].maximum_depth;
            if (loop_type_maximum_depth !== null && loop_type_maximum_depth < this.object_depth + 1) {
                // maximum depth is reached, skip this type
                continue;
            }
            switch (loop_type_component) {
                case "string":
                    component_divider = evaluate_string(content_without_comment, component_divider, this);
                    break;

                case "variable":
                    component_divider = evaluate_variable(content_without_comment, component_divider, this);
                    break;

                case "number":
                    component_divider = evaluate_number(content_without_comment, component_divider);
                    break;

                case "expression":
                    component_divider = evaluate_expression(content_without_comment, component_divider, this);
                    break;

                case "function":
                    component_divider = evaluate_function(content_without_comment, component_divider, this);
                    break;

                case "indention":
                    component_divider = evaluate_indention(content_without_comment, component_divider);
                    break;

                case "comment":
                    component_divider = evaluate_comment(content_without_comment, component_divider);
                    const comment_content = component_divider.get_component_by_type("comment");
                    content_without_comment = comment_content.length > 0 ? this.object_content.substring(0, comment_content[0].begin_index) : this.object_content;
                    break;

                case "function_parameter":
                    if (this.object_data.function_header === false) {
                        // object is not function header
                        break;
                    }
                    component_divider = evaluate_function_parameter(content_without_comment, component_divider);
                    break;

                case "function_parameter_name":
                    component_divider = evaluate_function_parameter_name(content_without_comment, component_divider);
                    break;

                case "function_parameter_type":
                    component_divider = evaluate_function_parameter_type(content_without_comment, component_divider);
                    break;

                case "function_parameter_default":
                    component_divider = evaluate_function_parameter_default(content_without_comment, component_divider);
                    break;

                default:
                    // multiple types using evaluate keyword function
                    const keyword_types: SkriptType[] = ["boolean"];
                    if (keyword_types.includes(loop_type_component)) {
                        component_divider = evaluate_keyword(content_without_comment, component_divider, this, loop_type_component);
                    }
                    break;
            }
        }
        return component_divider.export_component(this.object_content, this);
    }

};

export class SkriptObjectTypeOnly extends SkriptObject {

    constructor(type: SkriptType) {
        super("", type, -1, [], {}, true);
    }

}