import html2canvas from "html2canvas";
import { async_delay } from "../../system/async_delay";

interface CaptureImageResizeElement {
    element: HTMLElement,
    width: string,
    height: string
}

export function open_url(url: string): void {
    // window.open(link, "_blank").focus();
    Object.assign(document.createElement("a"), {target: "_blank", href: url}).click();
}

export async function capture_image(set_window_popup: Function): Promise<void> {
    // toggle window loading animation (delay is required after for window to render)
    set_window_popup("loading", "left_sidebar_capture_image", true);
    await async_delay(1);
    // page elements
    const editor_body = document.getElementsByClassName("page_body")[0] as HTMLElement;
    const editor_index = document.getElementsByClassName("page_body_index")[0] as HTMLElement;
    const editor_textarea = document.getElementsByClassName("page_body_content_editor")[0] as HTMLElement;
    const editor_mirror_background = window.getComputedStyle(editor_body).backgroundColor;
    // resize for screenshot size
    editor_body.style.width = "max-content";
    editor_body.style.height = "max-content";
    editor_textarea.style.overflow = "hidden";
    // get screenshot size
    const canvas_width = editor_index.scrollWidth + editor_textarea.scrollWidth + 2;
    const canvas_height = editor_textarea.scrollHeight + 1;
    // undo resize
    editor_body.style.width = "";
    editor_body.style.height = "";
    editor_textarea.style.overflow = "scroll";
    // screenshot
    const editor_body_canvas = await html2canvas(editor_body, {
        width: canvas_width,
        height: canvas_height,
        windowWidth: canvas_width,
        windowHeight: canvas_height,
        scrollX: 0,
        scrollY: editor_body.offsetTop * (-1),
        backgroundColor: editor_mirror_background,
        foreignObjectRendering: true,
        onclone: (cloned_document) => {
            // fix incorrect element dimensions caused by html2canvas library
            const cloned_page_root = cloned_document.getElementById("page_root") as HTMLElement;
            const cloned_editor_content = cloned_document.getElementsByClassName("page_body_content")[0] as HTMLElement;
            const cloned_editor_body = cloned_document.getElementsByClassName("page_body")[0] as HTMLElement;
            const cloned_editor_index = cloned_document.getElementsByClassName("page_body_index")[0] as HTMLElement;
            const cloned_editor_textarea = cloned_document.getElementsByClassName("page_body_content_editor")[0] as HTMLElement;
            const cloned_editor_mirror = cloned_document.getElementsByClassName("page_body_content_mirror")[0] as HTMLElement;
            cloned_page_root.style.gridTemplateColumns = `0px ${canvas_width}px 0px`;
            cloned_page_root.style.gridTemplateRows = `30px ${canvas_height}px 0px`;
            cloned_editor_content.style.width = `${canvas_width}px`;
            cloned_editor_content.style.height = `${canvas_height}px`;
            cloned_editor_content.style.gridTemplateColumns = `${canvas_width}px`;
            cloned_editor_content.style.gridTemplateRows = `${canvas_height}px`;
            cloned_editor_body.style.width = "100%";
            cloned_editor_body.style.height = "100%";
            cloned_editor_index.style.height = `${canvas_height}px`;
            cloned_editor_textarea.style.overflow = "hidden";
            cloned_editor_mirror.style.width = `${canvas_width}px`;
            cloned_editor_mirror.style.height = `${canvas_height}px`;
        }
    });
    editor_body_canvas.toBlob(async blob => {
        const blob_type = (blob as any).type as string;
        await navigator.clipboard.write([new ClipboardItem(Object.defineProperty({}, blob_type, {value: blob, enumerable: true}))]);
        set_window_popup("loading", "left_sidebar_capture_image", false);
    });
}

export function download_file(name: string, content: string): void {
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