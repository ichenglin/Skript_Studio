export function open_url(url: string) {
    // window.open(link, "_blank").focus();
    Object.assign(document.createElement("a"), {target: "_blank", href: url}).click();
}

export function download_file(name: string, content: string) {
    const download_element = document.createElement("a");
    const download_file = new Blob([content], {type: "text/plain;charset=utf-8"});
    download_element.href = URL.createObjectURL(download_file);
    download_element.download = name;
    //document.body.appendChild(download_element);
    download_element.click();
}

/* function copied from page_body.tsx (all the same except renamed) */
export function set_editor_content(content: string): void {
    // a backdoor to trigger react's input event
    const input_event = new Event("input", {bubbles: true});
    (input_event as any).simulated = true;
    const editor_object = document.getElementById("editor") as HTMLElement;
    (editor_object as any).value = content;
    editor_object.dispatchEvent(input_event);
}