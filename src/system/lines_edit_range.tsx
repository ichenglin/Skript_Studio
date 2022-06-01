export function lines_edit_range(old_lines: string[], new_lines: string[]): {begin_matches: number, end_matches: number} {
    let begin_matches = old_lines.length, end_matches = old_lines.length;
    // begin matches
    for (let line_index = 0; line_index < old_lines.length; line_index++) {
        if (old_lines[line_index] !== new_lines[line_index]) {
            begin_matches = line_index;
            break;
        }
    }
    // end matches
    for (let line_index = 0; line_index < old_lines.length; line_index++) {
        const line_index_reverted_old = old_lines.length - line_index - 1;
        const line_index_reverted_new = new_lines.length - line_index - 1;
        if (old_lines[line_index_reverted_old] !== new_lines[line_index_reverted_new]) {
            end_matches = line_index;
            break;
        }
    }
    end_matches = Math.min(end_matches, Math.min(old_lines.length, new_lines.length) - begin_matches);
    return {begin_matches: begin_matches, end_matches: end_matches};
}