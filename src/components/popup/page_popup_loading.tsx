import React, { Component } from 'react';
import LoadSpinner from '../global/global';
import "./page_popup.css";
import PagePopupTemplate from './page_popup_template';

interface Props {
    title: string,
	subtitle: string
};
interface State {};

export default class PagePopupLoading extends Component<Props, State> {
	render() {
		return <PagePopupTemplate inner_content={<div className="popup_loading">
				<div className="popup_loading_title">
					<p>{this.props.title}</p>
				</div>
				<div className="popup_loading_subtitle">
					<p>{this.props.subtitle}</p>
				</div>
				<LoadSpinner/>
		</div>}/>
	}
}
