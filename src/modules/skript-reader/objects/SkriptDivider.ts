import { SkriptObject } from "./SkriptObject";
import { SkriptType } from "./skript_object_types";

export interface SkriptDividerComponent {
    begin_index: number,
    end_index: number,
    component_type: SkriptType
};

export class SkriptDivider {

    private components: SkriptDividerComponent[];

    constructor() {
        this.components = [];
    }

    public add_component(component: SkriptDividerComponent): void {
        const override = this.override_component(component.begin_index, component.end_index);
        if (override.length > 0) {
            // component override
            return;
        }
        // component doesn't override
        this.components.push(component);
    }

    public get_component(): SkriptDividerComponent[] {
        this.sort_component();
        return this.components;
    }

    public get_component_by_type(component_type: SkriptType): SkriptDividerComponent[] {
        // find all components with the given type
        return this.components.filter(loop_component => loop_component.component_type === component_type);
    }

    public override_component(begin: number, end: number): SkriptDividerComponent[] {
        // find all components that override the given component
        return this.components.filter(loop_component => loop_component.begin_index <= end && loop_component.end_index >= begin);
    }

    public export_component(script: string, parent_object: SkriptObject): SkriptObject[] {
        this.sort_component();
        let export_objects = [], next_index = 0;
        for (let component_index = 0; component_index < this.components.length; component_index++) {
            const loop_component = this.components[component_index];
            if (loop_component.begin_index >= next_index + 1) {
                export_objects.push(divider_component_to_object(script, {begin_index: next_index, end_index: loop_component.begin_index - 1, component_type: parent_object.object_type}, parent_object.object_depth, parent_object.parent_types, parent_object.object_data, true));
            }
            // clone parent object parent types with different reference
            let loop_component_parent_types = [...parent_object.parent_types];
            if (!loop_component_parent_types.includes(loop_component.component_type)) {
                // add new parent type if not included
                loop_component_parent_types.push(loop_component.component_type);
            }
            export_objects.push(divider_component_to_object(script, loop_component, parent_object.object_depth, loop_component_parent_types, parent_object.object_data, false));
            next_index = loop_component.end_index + 1;
        }
        if (this.components.length > 0 && script.length >= next_index + 1) {
            export_objects.push(divider_component_to_object(script, {begin_index: next_index, end_index: script.length - 1, component_type: parent_object.object_type}, parent_object.object_depth, parent_object.parent_types, parent_object.object_data, true));
        }
        return export_objects;
    }

    private sort_component(): void {
        this.components = this.components.sort((component_1, component_2) => component_1.begin_index - component_2.begin_index);
    }

}

function divider_component_to_object(script: string, divider_component: SkriptDividerComponent, parent_depth: number, parent_types: SkriptType[], parent_data: {[key: string]: any}, object_final: boolean): SkriptObject {
    const script_component = script.slice(divider_component.begin_index, divider_component.end_index + 1);
    return new SkriptObject(script_component, divider_component.component_type, parent_depth + 1, parent_types, parent_data, object_final);
}