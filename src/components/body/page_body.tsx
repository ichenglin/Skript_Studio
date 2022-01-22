import React, { Component } from "react";
import { EditorLog } from "../../objects/EditorLog";
import { lines_edit_range } from "../../system/lines_edit_range";
import { skript_language_markup } from "../../system/skript_language_markup";
import "./page_body.css";
import { editor_relative_cursor, editor_relative_focus, editor_update_focus } from "./page_body_cursor";

interface Props {
	set_logs_message: Function
	cursor_position: {x: number, y: number}
}

interface State {
	raw_content: string[],
	styled_content: JSX.Element[],
	styled_log: EditorLog,
	styled_length: number,
	focus_element: Element | null
}

export default class PageBody extends Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = {
			raw_content: [],
			styled_content: [],
			styled_length: 1,
			styled_log: new EditorLog(1),
			focus_element: null
		};
	}

	componentDidUpdate() {
		const new_focus_element = editor_update_focus(this.state.focus_element, editor_relative_focus(editor_relative_cursor(this.props.cursor_position)));
		if (new_focus_element !== this.state.focus_element) {
			this.setState({focus_element: new_focus_element});
		}
	}

	private editor_input(event: React.FormEvent): void {
		// handle editor content update
		const new_lines: string[] = (event.target as any).value.split("\n");
		const edit_range = lines_edit_range(this.state.raw_content, new_lines);
		this.state.styled_log.trim_log(edit_range.begin_matches, edit_range.end_matches, new_lines.length);
		const insert_lines = [];
		for (let line_index = 0; line_index < (new_lines.length - edit_range.begin_matches - edit_range.end_matches); line_index++) {
            const absolute_line_index = edit_range.begin_matches + line_index;
			const line_markup = skript_language_markup(new_lines[absolute_line_index]);
            insert_lines.push(line_markup.markup);
			if (line_markup.error !== null) {
				this.state.styled_log.add_log(absolute_line_index, (line_markup.error.match(/^Error: (.+)$/) as RegExpMatchArray)[1]);
			}
        }
		this.setState({
			styled_content: [
				...this.state.styled_content.slice(0, edit_range.begin_matches),
				...insert_lines as JSX.Element[],
				...this.state.styled_content.slice(this.state.raw_content.length - edit_range.end_matches)
			]
		});
		this.setState({
			raw_content: new_lines,
			styled_length: new_lines.length
		});
		this.props.set_logs_message(this.state.styled_log.export_log());
		this.editor_scroll(event);
	}

	private editor_keydown(event: React.FormEvent): void {
		// react to certain input keys
		switch ((event as any).key) {
			case "Tab":
				event.preventDefault();
				this.editor_selection_insert(event, "\t");
				break;
		}
	}

	private editor_scroll(event: React.FormEvent): void {
		// handle editor scroll event
		const event_target = event.target as any;
		const editor_mirror = event_target.parentElement.children[1];
		editor_mirror.scrollTop = event_target.scrollTop;
        editor_mirror.scrollLeft = event_target.scrollLeft;
		const editor_mirror_index = event_target.parentElement.parentElement.children[0];
        editor_mirror_index.scrollTop = event_target.scrollTop;
	}

	private editor_selection_insert(event: React.FormEvent, content: string): void {
		// replace selected text with new text
		const event_target = event.target as any;
		const selection_begin = event_target.selectionStart;
		const selection_end = event_target.selectionEnd;
		event_target.value = event_target.value.substring(0, selection_begin) + content + event_target.value.substring(selection_end);
		event_target.selectionStart = selection_begin + content.length;
		event_target.selectionEnd = selection_begin + content.length;
	}

	public render(): JSX.Element {
		return <div className="page_body">
			<div className="page_body_index">
				{new Array(this.state.styled_length).fill(0).map((value, index) => (<pre key={index} style={{color: ((index + 1) % 5 === 0 ? "#FFFFFF" : "#808080")}}>{index + 1}</pre>))}
			</div>
			<div className="page_body_content">
				<textarea className="page_body_content_editor global_scrollable" placeholder="Type Your Code Here..." spellCheck="false" onInput={event => this.editor_input(event)} onKeyDown={event => this.editor_keydown(event)} onScroll={event => this.editor_scroll(event)}></textarea>
				<div className="page_body_content_mirror">
					{this.state.styled_content.map((value, index) => (<div className="page_body_content_mirror_line" key={index}>{value}</div>))}
				</div>
			</div>
		</div>;
	}
}