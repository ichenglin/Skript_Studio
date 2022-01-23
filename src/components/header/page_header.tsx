import React, { Component } from "react";
import "./page_header.css";

export default class PageHeader extends Component {
	render() {
		return <div className="page_header">
			<div className="page_header_title">
				<p>Skript Studio</p>
			</div>
			<div className="page_header_subtitle">
				<p>made with </p>
				<i className="fas fa-heart"></i>
				<p> by RuntimeCloud.com</p>
			</div>
		</div>;
	}
}

//			<div className="page_header_icons">
//				<p>GitHub</p>
//				<i className="fab fa-github"></i>
//			</div>
