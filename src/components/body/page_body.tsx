import React, { Component } from "react";
import { EditorLog } from "../../objects/EditorLog";
import { lines_edit_range } from "../../system/lines_edit_range";
import { skript_language_markup } from "../../system/skript_language_markup";
import PageBodyAutoComplete from "./autocomplete/page_body_autocomplete";
import "./page_body.css";
import { editor_relative_cursor, editor_relative_focus, editor_update_focus } from "./page_body_cursor";

interface Props {
	set_logs_message: Function,
	set_focus_element: Function
}

interface State {
	raw_content: string[],
	styled_content: JSX.Element[],
	styled_log: EditorLog,
	styled_length: number,
	focus_element: Element | null,
	focus_element_last_content: string | null,
	cursor_position: {x: number, y: number},
	cursor_last_update: number,
	autocomplete_position: {column: number, row: number, visible: boolean},
	autocomplete_content: string
}

export default class PageBody extends Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = {
			raw_content: [],
			styled_content: [],
			styled_length: 1,
			styled_log: new EditorLog(1),
			focus_element: null,
			focus_element_last_content: null,
			cursor_position: {x: 0, y: 0},
			cursor_last_update: Date.now(),
			autocomplete_position: {column: 0, row: 0, visible: false},
			autocomplete_content: ""
		};
	}

	componentDidMount() {
		// load template script
		fetch("https://raw.githubusercontent.com/fireclaws9/Skript_WealthGens/master/Version%201/game_generatorsHandler.sk")
		.then(respond => respond.text())
		.then(content => {
			const template_header = "# This script is loaded as template,\n# feel free to delete it by right-click\n# and click select-all :>";
			this.editor_set_content(template_header + "\n".repeat(2) + content.replaceAll(/#[^#\n]*\n?/g, ""));
		});
		// mouse move event for detecting element hover
		document.onmousemove = (event) => this.delayed_mouse_move(event, 25);
	}

	componentDidUpdate() {
		this.update_mouse_focus();
	}

	public editor_set_content(content: string): void {
		// a backdoor to trigger react's input event
		const input_event = new Event("input", {bubbles: true});
        (input_event as any).simulated = true;
		const editor_object = document.getElementById("editor") as HTMLElement;
		(editor_object as any).value = content;
        editor_object.dispatchEvent(input_event);
	}

	private editor_line_replace(line: number, content: string): void {
		const editor_object = document.getElementById("editor") as HTMLElement;
		const editor_lines = ((editor_object as any).value as string).split("\n");
		const editor_lines_new = [
			...editor_lines.slice(0, line - 1),
			content,
			...editor_lines.slice(line)
		];
		this.editor_set_content(editor_lines_new.join("\n"));
	}

	private editor_input(event: React.FormEvent): void {
		// handle editor content update
		const new_lines: string[] = (event.target as any).value.split("\n");
		const edit_range = lines_edit_range(this.state.raw_content, new_lines);
		this.state.styled_log.save_snapshot();
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
		if (this.state.styled_log.updated_snapshot()) {
			// only call update to root class if log actually changed
			this.props.set_logs_message(this.state.styled_log.export_log());
		}
		// update mouse focus was supposed to be called, however editor scroll function already did it
		// this.update_mouse_focus();
		this.editor_scroll(event);
		this.editor_autocomplete(event);
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
		this.update_mouse_focus();
	}

	private editor_autocomplete(event: React.FormEvent): void {
		const event_target = event.target as any;
		if (event_target.selectionStart !== event_target.selectionEnd) {
			// the event is text selection, no autocomplete should be displayed
			this.setState({autocomplete_position: {
				column: 0,
				row: 0,
				visible: false
			}});
			return;
		}
		const cursor_prefix_characters = event_target.selectionStart as number;
		const cursor_prefix_lines = (event_target.value as string).slice(0, cursor_prefix_characters).split("\n");
		const cursor_position_line = cursor_prefix_lines[cursor_prefix_lines.length - 1];
		const cursor_position_column = cursor_position_line.replaceAll("\t", "0".repeat(4)).length;
		const cursor_position_row = cursor_prefix_lines.length;
		this.setState({
			autocomplete_position: {
				column: cursor_position_column,
				row: cursor_position_row,
				visible: true
			},
			autocomplete_content: cursor_position_line
		});
	}

	private editor_selection_insert(event: React.FormEvent, content: string): void {
		// replace selected text with new text
		const event_target = event.target as any;
		const selection_begin = event_target.selectionStart;
		const selection_end = event_target.selectionEnd;
		this.editor_set_content(event_target.value.substring(0, selection_begin) + content + event_target.value.substring(selection_end));
		event_target.selectionStart = selection_begin + content.length;
		event_target.selectionEnd = selection_begin + content.length;
		
	}

	private delayed_mouse_move(event: MouseEvent, milliseconds: number) {
		// update mouse move event by a delay
		if (Date.now() - this.state.cursor_last_update <= milliseconds) {
			return;
		}
		this.setState({
			cursor_position: {x: event.clientX, y: event.clientY},
			cursor_last_update: Date.now()
		});
	}

	private update_mouse_focus() {
		const new_focus_element = editor_relative_focus(editor_relative_cursor(this.state.cursor_position))
		const final_focus_element = editor_update_focus(this.state.focus_element, new_focus_element);
		if (final_focus_element !== this.state.focus_element) {
			this.setState({focus_element: new_focus_element, focus_element_last_content: (new_focus_element !== null ? new_focus_element.textContent : null)});
			this.props.set_focus_element(new_focus_element);
		}
		/*const focus_content_changed = (final_focus_element !== null ? final_focus_element.textContent : null) !== this.state.focus_element_last_content;
		if (focus_content_changed) {
			this.props.update_focus_element_content();
		}*/
	}

	public render(): JSX.Element {
		console.log("render");
		return <div className="page_body">
			<div className="page_body_index">
				{new Array(this.state.styled_length).fill(0).map((value, index) => (<pre key={index} style={{color: ((index + 1) % 5 === 0 ? "#FFFFFF" : "#808080")}}>{index + 1}</pre>))}
			</div>
			<div className="page_body_content">
				<textarea className="page_body_content_editor global_scrollable" id="editor" placeholder="Type Your Code Here..." spellCheck="false"
					onInput={event => this.editor_input(event)}
					onKeyDown={event => this.editor_keydown(event)}
					onScroll={event => this.editor_scroll(event)}
					onSelect={(event) => this.editor_autocomplete(event)}
				></textarea>
				<div className="page_body_content_mirror">
					{this.state.styled_content.map((value, index) => (<div className="page_body_content_mirror_line" key={index}>{value}</div>))}
					<PageBodyAutoComplete position={this.state.autocomplete_position} content={this.state.autocomplete_content} line_replace={this.editor_line_replace.bind(this)}/>
				</div>
			</div>
		</div>;
	}
}