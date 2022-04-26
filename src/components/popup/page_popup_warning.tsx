import React, { Component } from 'react';
import "./page_popup.css";
import PagePopupTemplate from './page_popup_template';

interface Props {
	message: string
};
interface State {};

export default class PagePopupWarning extends Component<Props, State> {
	render() {
		return <PagePopupTemplate inner_content={<div className="popup_warning">
				<i className="fas fa-exclamation-triangle"></i>
				<div className="popup_global_title">
					<p>{this.props.message}</p>
				</div>
		</div>}/>
	}
}
