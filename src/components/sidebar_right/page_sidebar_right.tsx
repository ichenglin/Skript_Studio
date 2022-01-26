import React, { Component } from "react";
import "./page_sidebar_right.css";
import * as markup_colors from "../../data/skript_language_markup_colors.json";
import { stringify } from "querystring";

interface Props {
	editor_focus_element: Element | null;
}

interface State {}

interface ElementDetail {
	name: string,
	value: string,
	color?: string
}

export default class PageSidebarRight extends Component<Props, State> {

	async componentDidMount() {
		// react couldn't catch text content update, therefore I have to use this method
		let last_content = null;
		while (true) {
			if (last_content !== this.props.editor_focus_element?.textContent) {
				last_content = this.props.editor_focus_element?.textContent;
				this.forceUpdate();
				console.log("update!");
			}
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	}

	private get_element_details(element: Element | null): ElementDetail[] {
		if (element === null) {
			return [];
		}
		const output_detail: ElementDetail[] = [];
		const element_style = (element as any).style;
		const element_type_raw = element_style.getPropertyValue("--type") as string;
		const element_type = element_type_raw.replaceAll("_", " ");
		const element_color = markup_colors[element_type as keyof typeof markup_colors] as string;
		const element_content_raw = element.textContent as string;
		const element_content = element_content_raw.replace(/^\s*/, "") as string;
		output_detail.push({name: "Type", value: element_type, color: `#${element_color}`} as ElementDetail);
		output_detail.push({name: "Content", value: element_content} as ElementDetail);
		output_detail.push({name: "Length", value: `${element_content_raw.length} characters`} as ElementDetail);
		return output_detail;
	}

	render(): JSX.Element {
		return <div className="page_sidebar_right global_scrollable">
			{this.get_element_details(this.props.editor_focus_element).map((element_detail, index) => (
				<div className="page_sidebar_right_item" key={index}>
					<pre className="page_sidebar_right_item_name">{element_detail.name + ":"}</pre>
					<pre className="page_sidebar_right_item_value" style={{color: element_detail.color}}>{element_detail.value}</pre>
				</div>
			))}
		</div>;
	}
}