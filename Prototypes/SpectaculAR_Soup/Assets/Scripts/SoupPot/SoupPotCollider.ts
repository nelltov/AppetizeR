import { EventManager } from "../EventManager";
import { Ingredient } from "../Ingredients/Ingredient";

@component
export class SoupPotCollider extends BaseScriptComponent {
    private sceneObj: SceneObject
    private soupCollider: ColliderComponent

    onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        this.sceneObj = this.getSceneObject()

        // Bind onCollisionEnter event for the soup pot's collider
        this.soupCollider = this.sceneObj.getComponent("ColliderComponent") as ColliderComponent
        if (this.soupCollider) {
            this.soupCollider.onCollisionEnter.add((e) => this.onCollisionEnter(e))
        }
    }

    private onCollisionEnter(other: any) {
        var otherObj = other?.collision?.collider?.sceneObject
        if (isNull(otherObj)) return

        // Get relevant information from the colliding ingredient object
        const ingredient = otherObj.getComponent(
            Ingredient.getTypeName()
        ) as Ingredient

        // Trigger one-time event for ingredient colliding with the pot, passing in the ingredient info
        if (ingredient) {
            EventManager.SoupPotIngredientCollisionLocalEvent.trigger(ingredient.getIngredientInfo())
            otherObj.enabled = false    // Disable the ingredient object after collision
            // TODO: add an event to actually destroy the object once the interaction ends?
        }
    }
}
