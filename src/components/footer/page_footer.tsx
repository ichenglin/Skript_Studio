import React, { Component } from "react";
import { EditorLogMessage } from "../../objects/EditorLog";
import "./page_footer.css";

interface Props {
	editor_logs_message: EditorLogMessage[]
}

interface State {}

export default class PageFooter extends Component<Props, State> {
	render() {
		return <div className="page_footer">
			<div className="page_footer_title">Compile Result ({this.props.editor_logs_message.length} Errors, 0 Warnings)</div>
			<div className="page_footer_content global_scrollable">
				{this.props.editor_logs_message.map((value) => 
					<div className="page_footer_content_log" key={value.index}>
						<i className="fas fa-exclamation-triangle"></i>
						<pre>{`error in line #${value.index + 1}: ${value.message}`}</pre>
					</div>
				)}
			</div>
		</div>;
	}
}