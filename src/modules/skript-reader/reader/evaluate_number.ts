import { SkriptDivider, SkriptDividerComponent } from "../objects/SkriptDivider";

export function evaluate_number(script: string, divider: SkriptDivider): SkriptDivider {
    const number_pattern = /(?:-)?(?:\d*\.)?\d+/g;
    let number_pattern_match: RegExpExecArray | null;
    while (number_pattern_match = number_pattern.exec(script)) {
        divider.add_component({begin_index: number_pattern_match.index, end_index: number_pattern.lastIndex - 1, component_type: "number"} as SkriptDividerComponent);
    }
    return divider;
}