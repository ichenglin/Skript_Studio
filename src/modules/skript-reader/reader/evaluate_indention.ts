import { SkriptDivider, SkriptDividerComponent } from "../objects/SkriptDivider";

export function evaluate_indention(script: string, divider: SkriptDivider): SkriptDivider {
    const indention_matcher = script.match(/^(\s+)/);
    if (indention_matcher === null) {
        // no indention found
        return divider;
    }
    divider.add_component({begin_index: 0, end_index: indention_matcher[1].length - 1, component_type: "indention"} as SkriptDividerComponent);
    return divider;
}