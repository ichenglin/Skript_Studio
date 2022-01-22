import React, { Component } from 'react';
import { EditorLogMessage } from '../../objects/EditorLog';
import PageBody from '../body/page_body';
import PageFooter from '../footer/page_footer';
import PageHeader from '../header/page_header';
import PageSidebarLeft from '../sidebar_left/page_sidebar_left';
import PageSidebarRight from '../sidebar_right/page_sidebar_right';
import "./page_root.css";
import "../global/global.css";

interface Props {}

interface State {
	editor_logs_message: EditorLogMessage[],
	editor_cursor_position: {x: number, y: number},
	editor_cursor_last_update: number
}

export default class PageRoot extends Component<Props, State> {

	constructor(props: {}) {
		super(props);
		this.state = {
			editor_logs_message: [],
			editor_cursor_position: {x: 0, y: 0},
			editor_cursor_last_update: Date.now()
		}
	}

	componentDidMount() {
		// multiple listeners might be appended due to component mount calls from debugging, this has no effect on production anyway
		//document.addEventListener("mousemove", (event) => this.delayed_mouse_move(event, 100));
		document.onmousemove = (event) => this.delayed_mouse_move(event, 25);
	}

	public set_logs_message(logs_message: EditorLogMessage[]) {
		this.setState({
			editor_logs_message: logs_message
		});
	}

	private delayed_mouse_move(event: MouseEvent, milliseconds: number) {
		if (Date.now() - this.state.editor_cursor_last_update <= milliseconds) {
			return;
		}
		this.setState({
			editor_cursor_position: {x: event.clientX, y: event.clientY},
			editor_cursor_last_update: Date.now()
		});
	}

	render() {
		return <>
			<PageHeader/>
			<PageSidebarLeft/>
			<PageSidebarRight/>
			<PageBody set_logs_message={this.set_logs_message.bind(this)} cursor_position={this.state.editor_cursor_position}/>
			<PageFooter editor_logs_message={this.state.editor_logs_message}/>
		</>;
	}
}
