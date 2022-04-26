import { matches_alternation } from "../matchers/alternation";
import { matches_optional } from "../matchers/optional";
import { capture_bracket_length } from "../system/capture_bracket_length";
import { reader_error } from "../system/reader_error";
import { string_prefix_matcher } from "../system/string_prefix_matcher";
import { SkriptExpressionDivider } from "./SkriptExpressionDivider";

export type SkriptExpressionType = "combination" | "alternation" | "optional";

export interface SkriptExpressionMatchingSettings {
    case_sensitive: boolean,
    strict_matching: boolean
};

export class SkriptExpression {

    readonly object_content: string;
    readonly object_content_clean: string;
    readonly object_type: SkriptExpressionType;
    readonly object_childrens: SkriptExpression[];

    constructor(object_content: string, object_type: SkriptExpressionType) {
        this.object_content = object_content;
        this.object_content_clean = object_content.replace(/[\(\)\[\]]/g, "");
        this.object_type = object_type;
        this.object_childrens = this.evaluate_components();
    }

    public matches_begin_string(string: string, settings: SkriptExpressionMatchingSettings): {string_length: number, expression_length: number} {
        // no child fields, try to match itself
        if (this.object_childrens.length <= 0) {
            switch (this.object_type) {
                case "combination":
                    const prefix_match_length = string_prefix_matcher(this.object_content_clean, string);
                    return {
                        string_length: prefix_match_length > 0 ? prefix_match_length : -1,
                        expression_length: 1
                    };

                case "alternation":
                    const alternation_match_length = matches_alternation(this.object_content_clean, string, settings);
                    return {
                        string_length: alternation_match_length,
                        expression_length: 1
                    };

                case "optional":
                    const optional_match_length = matches_optional(this.object_content_clean, string, settings);
                    return {
                        string_length: optional_match_length,
                        expression_length: 1
                    };
            }
        }
        // have child fields, try to match childs
        let evaluated_string_length = 0, evaluated_expression_length = 0;
        for (let children_index = 0; children_index < this.object_childrens.length; children_index++) {
            // check if there were string remaining for matching
            if (settings.strict_matching === false && evaluated_string_length >= string.length) {
                // if strict mode is not enabled and beginning of string matches, doesn't need to match whole field
                return {
                    string_length: evaluated_string_length,
                    expression_length: evaluated_expression_length
                };
            }
            const loop_children = this.object_childrens[children_index];
            const matches_length = loop_children.matches_begin_string(string.slice(evaluated_string_length), settings).string_length;
            // check if children matches
            if (matches_length <= 0) {
                // children doesn't match
                if (loop_children.object_type !== "optional") {
                    return {string_length: -1, expression_length: evaluated_expression_length};
                }
            } else {
                // children matches
                evaluated_string_length += matches_length;
            }
            evaluated_expression_length += loop_children.object_content.length;
        }
        return {
            string_length: evaluated_string_length,
            expression_length: evaluated_expression_length
        };
    }

    public collapse_components(): SkriptExpression[] {
        if (this.object_childrens.length <= 0) {
            return [this];
        }
        let inner_component_collapsed: SkriptExpression[] = [];
        for (let inner_component_index = 0; inner_component_index < this.object_childrens.length; inner_component_index++) {
            inner_component_collapsed = inner_component_collapsed.concat(this.object_childrens[inner_component_index].collapse_components());
        }
        return inner_component_collapsed;
    }

    private evaluate_components(): SkriptExpression[] {
        if (this.object_content.length <= 0) {
            // no content, therefore no components
            return [];
        }
        const divider = new SkriptExpressionDivider();
        const begin = this.object_type !== "combination" ? 1 : 0;
        for (let content_index = begin; content_index < this.object_content.length; content_index++) {
            let bracket_type: SkriptExpressionType | null = null;
            switch (this.object_content[content_index]) {
                case "(":
                    bracket_type = "alternation";
                    break;
                case "[":
                    bracket_type = "optional";
                    break;
            }
            if (bracket_type !== null) {
                const bracket_length = capture_bracket_length(this.object_content.slice(content_index));
                if (bracket_length <= 0) {
                    // invalid bracket length or bracket enclose not found
                    throw reader_error("invalid bracket or bracket not properly enclosed", this.object_content.slice(content_index));
                }
                divider.add_component({begin_index: content_index, end_index: (content_index + bracket_length - 1), component_type: bracket_type});
                content_index += bracket_length;
            }
        }
        return divider.export_component(this.object_content, this);
    }
}