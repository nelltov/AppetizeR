import { EventManager } from "Scripts/EventManager";

@component
export class SoupPotMarker extends BaseScriptComponent {
    private sceneObj: SceneObject
    private soupCollider: ColliderComponent

    onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        this.sceneObj = this.getSceneObject()
        this.soupCollider = this.sceneObj.getComponent("ColliderComponent") as ColliderComponent

        // print("on start of SoupPotMarker")
        // EventManager.SoupPotIngredientCollisionEvent.add((message: string) => {
        //     print("Received message in SoupPotMarker: " + message)
        // })
        // EventManager.SoupPotIngredientCollisionEvent.trigger("chicken")
    }
}
