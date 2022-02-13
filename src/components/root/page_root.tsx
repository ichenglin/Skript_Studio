import React, { Component } from 'react';
import {BrowserRouter as Router, Routes, Route, useLocation} from "react-router-dom";
import { EditorLogMessage } from '../../objects/EditorLog';
import PageBody from '../body/page_body';
import PageFooter from '../footer/page_footer';
import PageHeader from '../header/page_header';
import PageSidebarLeft from '../sidebar_left/page_sidebar_left';
import PageSidebarRight from '../sidebar_right/page_sidebar_right';
import "./page_root.css";
import "../global/global.css";
import PagePopupLoading from '../popup/page_popup_loading';

interface Props {}

interface State {
	editor_logs_message: EditorLogMessage[],
	editor_focus_element: Element | null,
	editor_window_popup: {[key: string]: {[key: string]: boolean | null}}
}

export default class PageRoot extends Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = {
			editor_logs_message: [],
			editor_focus_element: null,
			editor_window_popup: {}
		}
	}

	public set_logs_message(logs_message: EditorLogMessage[]) {
		this.setState({editor_logs_message: logs_message});
	}

	public set_focus_element(focus_element: Element | null) {
		this.setState({editor_focus_element: focus_element});
	}

	public set_window_popup(popup_type: string, binding_id: string, toggle: boolean) {
		let new_window_popup = this.state.editor_window_popup;
		if (new_window_popup[popup_type] === undefined) {
			new_window_popup[popup_type] = {};
		}
		if (toggle === true) {
			new_window_popup[popup_type][binding_id] = true;
		} else {
			delete new_window_popup[popup_type][binding_id];
		}
		this.setState({editor_window_popup: new_window_popup});
	}

	private get_active_popup(): JSX.Element {
		if (this.check_popup_active("loading")) {
			return <PagePopupLoading title="Loading" subtitle="please wait..."/>;
		}
		return <></>;
	}

	private check_popup_active(popup_type: string): boolean {
		const popup_bindings = this.state.editor_window_popup[popup_type];
		if (popup_bindings === null || popup_bindings === undefined) {
			return false;
		}
		return Object.keys(popup_bindings).length > 0;
	}

	render() {
		return <Router><Routes>
			<Route path="*" element={<>
				<PageHeader/>
				<PageSidebarLeft set_window_popup={this.set_window_popup.bind(this)}/>
				<PageSidebarRight editor_focus_element={this.state.editor_focus_element}/>
				<PageBody set_logs_message={this.set_logs_message.bind(this)} set_focus_element={this.set_focus_element.bind(this)}/>
				<PageFooter editor_logs_message={this.state.editor_logs_message}/>
				{this.get_active_popup()}
			</>}/>
			<Route path="/plain/*" element={<div className="page_root_plain">
				<PageHeader/>
				<PageBody set_logs_message={this.set_logs_message.bind(this)} set_focus_element={this.set_focus_element.bind(this)}/>
			</div>}/>
		</Routes></Router>;
	}
}
