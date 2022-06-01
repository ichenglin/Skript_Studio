import React, { Component } from "react";
import { EditorLog } from "../../objects/EditorLog";
import { lines_edit_range } from "../../system/lines_edit_range";
import { skript_language_markup } from "../../system/skript_language_markup";
import PageBodyAutoComplete from "./autocomplete/page_body_autocomplete";
import "./page_body.css";
import { editor_relative_cursor, editor_relative_focus, editor_update_focus } from "./page_body_cursor";
import { isMobile } from "react-device-detect";
import { random_string } from "../../system/random_string";

interface Props {
	set_logs_message: Function,
	set_focus_element: Function
}

interface State {
	styled_content: ScriptMirror[]
	styled_length: number,
	cursor_position: {x: number, y: number}
	autocomplete_position: {column: number, row: number, visible: boolean}
}

interface ScriptMirror {
	line_content: JSX.Element | null,
	line_id: string
}

export default class PageBody extends Component<Props, State> {

	// editor
	static raw_content: string[] = [];
	// cursor markup
	static focus_element: Element | null = null;
	static cursor_last_update: number = Date.now();
	// logs
	static editor_log: EditorLog = new EditorLog(1);
	// autocomplete
	static autocomplete_content: string = "";

	constructor(props: Props) {
		super(props);
		this.state = {
			styled_content: [],
			styled_length: 1,
			cursor_position: {x: 0, y: 0},
			autocomplete_position: {column: 0, row: 0, visible: false}
		};
	}

	componentDidMount() {
		if (!isMobile) {
			// load template script
			fetch("https://raw.githubusercontent.com/ichenglin/Skript_WealthGens/master/Version%201/game_generatorsHandler.sk")
			.then(respond => respond.text())
			.then(content => {
				const template_header = "# This script is loaded as template,\n# feel free to delete it by right-click\n# and click select-all :>";
				this.editor_set_content(template_header + "\n".repeat(2) + content.replaceAll(/#[^#\n]*\n?/g, ""));
			});
			// mouse move event for detecting element hover
			document.onmousemove = (event) => this.delayed_mouse_move(event, 50);
		}
	}

	public editor_set_content(content: string): void {
		// a backdoor to trigger react's input event
		const input_event = new Event("input", {bubbles: true});
        (input_event as any).simulated = true;
		const editor_object = document.getElementById("editor") as HTMLElement;
		(editor_object as any).value = content;
        editor_object.dispatchEvent(input_event);
	}

	public editor_move_simulate(): void {
		if ((document as any).last_mousemove_event === undefined) {
			return;
		}
		const input_event = (document as any).last_mousemove_event as Event;
		const editor_object = document.getElementById("editor") as HTMLElement;
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
		const edit_range = lines_edit_range(PageBody.raw_content, new_lines);
		PageBody.editor_log.save_snapshot();
		PageBody.editor_log.trim_log(edit_range.begin_matches, edit_range.end_matches, new_lines.length);
		const insert_lines: ScriptMirror[] = [];
		for (let line_index = 0; line_index < (new_lines.length - edit_range.begin_matches - edit_range.end_matches); line_index++) {
            const absolute_line_index = edit_range.begin_matches + line_index;
			const line_markup = skript_language_markup(new_lines[absolute_line_index]);
            insert_lines.push({line_content: line_markup.markup, line_id: this.editor_new_line_id()} as ScriptMirror);
			if (line_markup.error !== null) {
				PageBody.editor_log.add_log(absolute_line_index, (line_markup.error.match(/^Error: (.+)$/) as RegExpMatchArray)[1]);
			}
        }
		console.log(`added ${insert_lines.length} lines`);
		this.setState({
			styled_content: [
				...this.state.styled_content.slice(0, edit_range.begin_matches),
				...insert_lines,
				...this.state.styled_content.slice(PageBody.raw_content.length - edit_range.end_matches)
			],
			styled_length: new_lines.length
		});
		PageBody.raw_content = new_lines;
		if (PageBody.editor_log.updated_snapshot()) {
			// only call update to root class if log actually changed
			this.props.set_logs_message(PageBody.editor_log.export_log());
		}
		// update mouse focus was supposed to be called, however editor scroll function already did it
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
			case "Enter":
				event.preventDefault();
				const event_line = PageBody.raw_content[this.state.autocomplete_position.row - 1];
				const event_line_indention_matcher = event_line.match(/^(\s+)/);
				const event_line_indention = event_line_indention_matcher !== null ? event_line_indention_matcher[1] : "";
				this.editor_selection_insert(event, "\n" + event_line_indention);
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
		this.editor_move_simulate();
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
		PageBody.autocomplete_content = cursor_position_line;
		this.setState({
			autocomplete_position: {
				column: cursor_position_column,
				row: cursor_position_row,
				visible: true
			}
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
		if (Date.now() - PageBody.cursor_last_update <= milliseconds) {
			return;
		}
		this.update_mouse_focus({x: event.clientX, y: event.clientY});
	}

	private update_mouse_focus(cursor_position: {x: number, y: number}) {
		const new_focus_element = editor_relative_focus(editor_relative_cursor(cursor_position))
		const final_focus_element = editor_update_focus(PageBody.focus_element, new_focus_element);
		if (final_focus_element.updated) {
			PageBody.focus_element = new_focus_element;
			PageBody.cursor_last_update = Date.now();
			this.props.set_focus_element(new_focus_element);
		}
	}

	private editor_new_line_id(): string {
		const used_ids = this.state.styled_content.map(script_mirror_object => script_mirror_object.line_id);
		const new_id = random_string(8, used_ids);
		return new_id;
	}

	public render(): JSX.Element {
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
					{this.state.styled_content.map((value, index) => (<div className="page_body_content_mirror_line" key={value.line_id} data-key={value.line_id}>{value.line_content}</div>))}
					<PageBodyAutoComplete position={this.state.autocomplete_position} content={PageBody.autocomplete_content} line_replace={this.editor_line_replace.bind(this)}/>
				</div>
			</div>
		</div>;
	}
}