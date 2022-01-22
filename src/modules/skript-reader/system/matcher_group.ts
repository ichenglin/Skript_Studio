export function matcher_group(matcher: RegExpMatchArray, matcher_group: number, exclude_indention: boolean): {begin_index: number, end_index: number} {
    // string before group
    let group_begin = 0;
    for (let group_index = 0; group_index < matcher_group - 1; group_index++) {
        group_begin += matcher[group_index + 1].length;
    }
    // prefix/suffix indention in group
    let group_indention_prefix_length = 0, group_indention_suffix_length = 0;
    if (exclude_indention === true) {
        const group_indention_prefix_matcher = matcher[matcher_group].match(/^(\s*)[^\s]/);
        const group_indention_suffix_matcher = matcher[matcher_group].match(/[^\s](\s*)$/);
        group_indention_prefix_length = group_indention_prefix_matcher ? group_indention_prefix_matcher[1].length : 0;
        group_indention_suffix_length = group_indention_suffix_matcher ? group_indention_suffix_matcher[1].length : 0;
    }
    return {
        begin_index: group_begin + group_indention_prefix_length,
        end_index: group_begin + matcher[matcher_group].length - group_indention_suffix_length - 1
    };
}