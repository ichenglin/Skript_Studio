export function is_empty_line(script_line: string): boolean {
    return script_line.match(/^\s*$/) !== null;
}