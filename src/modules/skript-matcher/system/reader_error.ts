export function reader_error(reason: string, content: string): Error {
    return new Error(reason + " (" + content + ")");
}