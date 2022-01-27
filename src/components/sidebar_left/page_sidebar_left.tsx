import React, { Component } from "react";
import skript_obfuscator from "../../modules/skript-obfuscator";
import "./page_sidebar_left.css";
import { capture_image, download_file, open_url, set_editor_content } from "./page_sidebar_left_actions";

interface Props {};
interface State {
	items: PageSidebarLeftItem[]
};

interface PageSidebarLeftItem {
	name: string,
	icon_class: string,
	icon_size: number,
	click_action: Function
}

export default class PageSidebarLeft extends Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = {items: [
			{
				name: "Obfuscate (BETA)",
				icon_class: "fas fa-shield-alt",
				icon_size: 28,
				click_action: () => {
					const obfuscator_label = [
						`# ==== ( Information ) ====`,
						`#`,
						`# @Name        | New Script`,
						`# @Description | Description`,
						`# @Author      | You`,
						`# @Version     | 1.0.0`,
						`# @Date        | ${new Date(Date.now()).toLocaleDateString()}`,
						"#",
						"# (Automatically Generated)"
					];
					try {
						const editor_content = (document.getElementById("editor") as any).value;
						const editor_contente_obfuscated = skript_obfuscator(editor_content);
						set_editor_content(obfuscator_label.join("\n") + "\n".repeat(2) + editor_contente_obfuscated);
					} catch (error: any) {
						alert("obfuscation request denied due to error detected in script!");
					}
				}
			} as PageSidebarLeftItem, {
				name: "Capture Image",
				icon_class: "fas fa-camera-retro",
				icon_size: 28,
				click_action: () => capture_image()
			} as PageSidebarLeftItem, {
				name: "Download",
				icon_class: "fas fa-file-code",
				icon_size: 28,
				click_action: () => download_file("skript_studio_download.sk", (document.getElementById("editor") as any).value)
			} as PageSidebarLeftItem, {
				name: "Github",
				icon_class: "fab fa-github",
				icon_size: 28,
				click_action: () => open_url("https://github.com/fireclaws9")
			} as PageSidebarLeftItem
		]};
		/*{name: "More Tools", icon_class: "fas fa-tools", icon_size: 28} as PageSidebarLeftItem,*/
	}

	render() {
		return <div className="page_sidebar_left">
			{this.state.items.map((sidebar_item, index) => (
				<div className="page_sidebar_left_item" key={index} onClick={event => sidebar_item.click_action(event)}>
					<i className={sidebar_item.icon_class} style={{fontSize: `${sidebar_item.icon_size}px`}}></i>
					<p>{sidebar_item.name}</p>
				</div>
			))}
		</div>;
	}
}