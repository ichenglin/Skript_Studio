import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';
import {Routes, Route, BrowserRouter} from "react-router-dom";
import { EditorLogMessage } from '../../objects/EditorLog';
import PageBody from '../body/page_body';
import PageFooter from '../footer/page_footer';
import PageHeader from '../header/page_header';
import PageSidebarLeft from '../sidebar_left/page_sidebar_left';
import PageSidebarRight from '../sidebar_right/page_sidebar_right';
import "./page_root.css";
import "../global/global.css";
import PagePopupLoading from '../popup/page_popup_loading';
import PagePopupWarning from '../popup/page_popup_warning';

interface Props {}

interface State {
	editor_logs_message: EditorLogMessage[],
	editor_focus_element: Element | null,
	editor_window_popup: {[key: string]: {[key: string]: PopupData | null}}
}

interface PopupData {
	active: boolean,
	data: {[key: string]: any}
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

	componentDidMount() {
		if (isMobile) {
			this.set_window_popup("warning", "mobile_blocked", true, {message: "Mobile is Not Supported."});
		}
	}

	public set_logs_message(logs_message: EditorLogMessage[]) {
		this.setState({editor_logs_message: logs_message});
	}

	public set_focus_element(focus_element: Element | null) {
		this.setState({editor_focus_element: focus_element});
	}

	public set_window_popup(popup_type: string, binding_id: string, toggle: boolean, values?: {[key: string]: any}) {
		let new_window_popup = this.state.editor_window_popup;
		if (new_window_popup[popup_type] === undefined) {
			new_window_popup[popup_type] = {};
		}
		if (toggle === true) {
			new_window_popup[popup_type][binding_id] = {active: toggle, data: values || {}};
		} else {
			delete new_window_popup[popup_type][binding_id];
		}
		this.setState({editor_window_popup: new_window_popup});
	}

	private get_active_popup(): JSX.Element {
		if (this.check_popup_active("loading")) {
			return <PagePopupLoading title="Loading" subtitle="please wait..."/>;
		} else if (this.check_popup_active("warning")) {
			const warning_data = this.get_popup_data("warning");
			return <PagePopupWarning message={warning_data.message}/>;
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

	private get_popup_data(popup_type: string): {[key: string]: any} {
		const popup_bindings = this.state.editor_window_popup[popup_type];
		if (popup_bindings === null || popup_bindings === undefined) {
			return {};
		}
		const first_binding = Object.keys(popup_bindings)[0];
		const first_binding_data = this.state.editor_window_popup[popup_type][first_binding]?.data;
		return first_binding_data !== undefined ? first_binding_data : {};
	}

	render() {
		return <BrowserRouter><Routes>
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
		</Routes></BrowserRouter>;
	}
}
