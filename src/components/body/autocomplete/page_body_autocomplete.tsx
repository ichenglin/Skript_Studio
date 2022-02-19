import { Component } from "react";
import expression_matches from "../../../modules/skript-pattern-matcher/index";
import * as skript_effects from "../../../data/effects.json";

interface Props {
    position: {column: number, row: number, visible: boolean},
    content: string,
    line_replace: Function
};

interface State {};

export default class PageBodyAutoComplete extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
    }

    private get_position(): {x: number, y: number} {
        const cursor_position_x = this.props.position.column * 7.7;
		const cursor_position_y = this.props.position.row * 16;
        return {x: cursor_position_x, y: cursor_position_y};
    }

    private get_suggestions() {
        const content_indention_matcher = this.props.content.match(/^(\s*)(.+)$/);
        if (content_indention_matcher === null || content_indention_matcher[2] === "") {
            return [];
        }
        const content_without_indention = content_indention_matcher[2];
        const available_effects = skript_effects;
        let matches: {pattern: string, addon: string, match_length: number}[] = [];
        for (let effect_index = 0; effect_index < available_effects.length; effect_index++) {
            const loop_effect = available_effects[effect_index];
            for (let pattern_index = 0; pattern_index < loop_effect.patterns.length; pattern_index++) {
                const loop_pattern = loop_effect.patterns[pattern_index];
                if (loop_pattern[0] !== content_without_indention[0]) {
                    continue;
                }
                if (loop_pattern.length > 100) {
                    continue;
                }
                const expression_matcher = expression_matches(loop_pattern, content_without_indention, false, false);
                if (expression_matcher.string_length === content_without_indention.length) {
                    matches.push({pattern: loop_pattern, addon: loop_effect.addon.split(" ")[0], match_length: expression_matcher.expression_length});
                }
            }
        }
        return matches;
    }

    private accept_suggestion(pattern: string) {
        const content_indention_matcher = this.props.content.match(/^(\s*)(.+)$/);
        const content_indention = content_indention_matcher !== null ? content_indention_matcher[1] : "";
        this.props.line_replace(this.props.position.row, content_indention + pattern);
    }

    render() {
        if (this.props.position.visible === false) {
            return <></>;
        }
        const suggestions = this.get_suggestions();
        if (suggestions.length <= 0) {
            return <></>;
        }
        const position = this.get_position()
        return <div className="page_body_content_autocomplete" style={{top: position.y, left: position.x}}>
            {suggestions.map((suggestion, index) => (<div className="page_body_content_autocomplete_suggestion" key={index} onClick={() => this.accept_suggestion(suggestion.pattern)}>
                <div className="page_body_content_autocomplete_suggestion_icon">
                    <i className="fas fa-cube"></i>
                </div>
                <div className="page_body_content_autocomplete_suggestion_content">
                    <pre>
                        {suggestion.addon}
                    </pre>
                    <pre>
                        {suggestion.pattern.slice(0, suggestion.match_length)}
                    </pre>
                    <pre>
                        {suggestion.pattern.slice(suggestion.match_length)}
                    </pre>
                </div>
            </div>))}
        </div>;
    }

}