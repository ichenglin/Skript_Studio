export function editor_relative_cursor(absolute_cursor: {x: number, y: number}): {x: number, y: number} {
    const editor_object = document.getElementsByClassName("page_body_content_editor");
    if (editor_object === undefined || editor_object[0] === undefined) {
        return absolute_cursor;
    }
    const cursor_relative_x = absolute_cursor.x - (editor_object[0] as any).offsetLeft + (editor_object[0] as any).scrollLeft;
    const cursor_relative_y = absolute_cursor.y - (editor_object[0] as any).offsetTop + (editor_object[0] as any).scrollTop;
    return {x: cursor_relative_x, y: cursor_relative_y};
}

export function editor_relative_focus(relative_cursor: {x: number, y: number}): Element | null {
    // search for new focus element
    const cursor_relative_index = Math.ceil(relative_cursor.y / 16);
    const cursor_relative_line = document.getElementsByClassName("page_body_content_mirror_line");
    if (cursor_relative_line === undefined || cursor_relative_line[cursor_relative_index - 1] === undefined) {
        // line doesn't exist
        return null;
    }
    const cursor_relative_line_elements = cursor_relative_line[cursor_relative_index - 1].children;
    let length_after_element = 0;
    for (let element_index = 0; element_index < cursor_relative_line_elements.length; element_index++) {
        length_after_element += cursor_relative_line_elements[element_index].clientWidth;
        if (relative_cursor.x < length_after_element) {
            // return the element that matches both x and y
            return cursor_relative_line_elements[element_index];
        }
    }
    // no element match
    return null;
}

export function editor_update_focus(previous_focus: Element | null, new_focus: Element | null): Element | null {
    if (previous_focus?.isEqualNode(new_focus)) {
        // same object, no update needed
        return previous_focus;
    }
    // remove focus tag from previous element (if exist)
    if (previous_focus !== null) {
        const element_color = (previous_focus as any).style.getPropertyValue("--focus_color");
        if (previous_focus.classList.contains("page_body_content_mirror_focus")) {
            // previous focus element is shown
            (previous_focus as any).style.removeProperty("--focus_color");
            (previous_focus as any).style.setProperty("color", element_color);
            previous_focus.classList.remove("page_body_content_mirror_focus");
        }
    }
    // add focus tag to new element (if exist)
    if (new_focus !== null) {
        const element_type = (new_focus as any).style.getPropertyValue("--type");
        const element_color = (new_focus as any).style.getPropertyValue("color");
        if (element_type !== "indention" && element_type !== "comment" && element_type !== "error") {
            // don't allow focus on error and indention elements
            (new_focus as any).style.removeProperty("color");
            (new_focus as any).style.setProperty("--focus_color", element_color);
            new_focus.classList.add("page_body_content_mirror_focus");
        }
    }
    return new_focus;
}