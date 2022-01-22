import { SkriptObject } from "./objects/SkriptObject";

function skript_reader(script: string): SkriptObject {
    // don't want carriage returns to mess up the reader
    script = script.replace(/\r/g, "");
    return new SkriptObject(script, "body", 0, [], {}, false);
}

export default skript_reader;