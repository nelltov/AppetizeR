import { EventManager } from "../EventManager";

@component
export class PlayerIngredientManager extends BaseScriptComponent {
    onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        EventManager.CenterPositionSetLocal.add((centerPosition: vec3) => {
            print(`Received center position: ${centerPosition.toString()}`)
        })
    }
}
