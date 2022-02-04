import React, { Component } from 'react';
import "./page_popup.css";

interface Props {
    inner_content: JSX.Element
};
interface State {};

export default class PagePopupTemplate extends Component<Props, State> {
	render(): JSX.Element {
		return <div className="popup_template">
			<div className="popup_template_window">
                {this.props.inner_content}
            </div>
		</div>;
	}
}