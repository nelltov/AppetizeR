import { EventManager } from "Scripts/EventManager";

@component
export class SoupPotMarker extends BaseScriptComponent {
    onStart() {
        print("on start of SoupPotMarker")
        EventManager.SoupPotIngredientCollisionEvent.add((message: string) => {
            print("Received message in SoupPotMarker: " + message)
        })
        EventManager.SoupPotIngredientCollisionEvent.trigger("chicken")
    }

    onAwake() {
        print("on awake of SoupPotMarker")

        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart()})
    }
}
