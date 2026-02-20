import { EventManager } from "Scripts/EventManager";
import { IngredientInfo } from "Scripts/Ingredients/Ingredient";

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

        EventManager.SoupPotIngredientCollisionEvent.add((IngredientInfo: IngredientInfo) => {
            print("Received message in SoupPotMarker: " + IngredientInfo.variantName)
            // update storage property
        })
        EventManager.SoupPotIngredientCollisionEvent.trigger(new IngredientInfo(1, 2))
    }
}
