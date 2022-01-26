import { SkriptSet } from "../objects/SkriptSet";
import { clear_comment } from "../system/clear_comment";
import { is_empty_line } from "../system/empty_line";

interface EvaluateSetResult {
    begin_index: number;
    end_index: number;
}

export function evaluate_set(script_lines: string[]): SkriptSet[] {
    let set_stage = false, set_begin = -1;
    let evaluate_result: EvaluateSetResult[] = [];
    for (let line_index = 0; line_index < script_lines.length; line_index++) {
        const line_without_comment = clear_comment(script_lines[line_index]);
        if (is_empty_line(line_without_comment)) {
            // skipping empty lines
            continue;
        }
        if (set_stage === false) {
            // no active set, create a new one
            set_stage = true;
            set_begin = line_index;
            continue;
        }
        const indention_matcher = line_without_comment.match(/^(\s*)[^\s]/);
        const indention = indention_matcher ? indention_matcher[1] : "";
        if (indention === "") {
            // end of set
            evaluate_result.push({begin_index: set_begin, end_index: line_index - 1} as EvaluateSetResult);
            set_stage = false;
            // evaluate current line again as the beginning of next set
            line_index--;
            continue;
        }
    }
    if (set_stage === true) {
        evaluate_result.push({begin_index: set_begin, end_index: script_lines.length - 1} as EvaluateSetResult);
    }
    // convert raw results to SkriptSet
    let script_sets: SkriptSet[] = [];
    for (let result_index = 0; result_index < evaluate_result.length; result_index++) {
        script_sets.push(new SkriptSet(script_lines.slice(evaluate_result[result_index].begin_index, evaluate_result[result_index].end_index + 1)));
    }
    return script_sets;
}