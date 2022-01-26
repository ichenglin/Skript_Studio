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
	editor_focus_element: Element | null
}

export default class PageRoot extends Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = {
			editor_logs_message: [],
			editor_focus_element: null
		}
	}

	public set_logs_message(logs_message: EditorLogMessage[]) {
		this.setState({editor_logs_message: logs_message});
	}

	public set_focus_element(focus_element: Element | null) {
		this.setState({editor_focus_element: focus_element});
	}

	render() {
		return <>
			<PageHeader/>
			<PageSidebarLeft/>
			<PageSidebarRight editor_focus_element={this.state.editor_focus_element}/>
			<PageBody set_logs_message={this.set_logs_message.bind(this)} set_focus_element={this.set_focus_element.bind(this)}/>
			<PageFooter editor_logs_message={this.state.editor_logs_message}/>
		</>;
	}
}
