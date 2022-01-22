import skript_reader from "../modules/skript-reader";
import * as markup_colors from "../data/skript_language_markup_colors.json";

export function skript_language_markup(line: string) {
    let respond: {markup: JSX.Element | null, error: string | null} = {markup: null, error: null};
    try {
        const line_components = skript_reader(line).collapse_components();
        const markup_elements = (<>{line_components.map((component, index) => 
            <pre key={index} style={{color: "#" + markup_colors[component.object_type], ["--type" as any]: component.object_type}}>{component.object_content}</pre>
        )}</>);
        respond = {markup: markup_elements, error: null};
    } catch (error) {
        respond = {markup: <pre style={{color: "#FFFFFF", ["--type" as any]: "error"}}>{line}</pre>, error: (error as any).toString()};
    }
    return respond;
}