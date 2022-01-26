export interface EditorLogMessage {
    index: number,
    message: string
}

export class EditorLog {

    private editor_logs: Map<number, string>;
    private editor_length: number;
    private snapshot_updated: boolean;

    constructor(editor_lines: number) {
        this.editor_logs = new Map<number, string>();
        this.editor_length = editor_lines;
        this.snapshot_updated = false;
    }

    public add_log(index: number, log: string): void {
        this.editor_logs.set(index, log);
        this.snapshot_updated = true;
    }

    public trim_log(begin_preserve: number, end_preserve: number, final_length: number): void {
        const end_preserve_absolute = this.editor_length - end_preserve;
        const new_logs = new Map<number, string>();
        this.editor_logs.forEach((value: string, key: number) => {
            if (key < begin_preserve) {
                // preserve
                new_logs.set(key, value);
            } else if (end_preserve_absolute <= key) {
                // push forward
                const new_index = key - (this.editor_length - final_length);
                new_logs.set(new_index, value);
                this.snapshot_updated = true;
            } else {
                // drop item
                this.snapshot_updated = true;
            }
        });
        this.editor_logs = new_logs;
        this.editor_length = final_length;
    }

    public save_snapshot(): void {
        this.snapshot_updated = false;
    }

    public updated_snapshot(): boolean {
        return this.snapshot_updated;
    }

    public export_log(): EditorLogMessage[] {
        const editor_logs_sorted = [...this.editor_logs.entries()].sort((a: [number, string], b: [number, string]) => a[0] - b[0]);
        return editor_logs_sorted.map((value: [number, string]) => ({index: value[0], message: value[1]} as EditorLogMessage));
    }

}