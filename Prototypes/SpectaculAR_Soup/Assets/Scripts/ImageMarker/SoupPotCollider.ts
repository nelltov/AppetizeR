import { EventManager } from "Scripts/EventManager";
import { Ingredient, IngredientInfo } from "Scripts/Ingredients/Ingredient";

@component
export class SoupPotCollider extends BaseScriptComponent {
    @input
    private debugText: Text

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

        // Debug print whenever collision event triggers to verify collision and ingredient info retrieval
        EventManager.SoupPotIngredientCollisionNetworkEvent.add((ingredientInfo: IngredientInfo) => {
            print(`Ingredient collided with pot: ${ingredientInfo.variantName}`)
            if (this.debugText) {
                this.debugText.text = `${ingredientInfo.variantName} has been added to the soup`
            }
        })
    }

    private onCollisionEnter(other: any) {
        var otherObj = other?.collision?.collider?.sceneObject
        if (isNull(otherObj)) return

        // Guard against double-processing if collision fires again before disabled
        if (!otherObj.enabled) return

        const ingredient = otherObj.getComponent(
            Ingredient.getTypeName()
        ) as Ingredient

        if (ingredient) {
            // Disable immediately so re-entry collisions are ignored
            otherObj.enabled = false

            // Trigger event for ingredient colliding with the pot, passing in the ingredient info
            EventManager.SoupPotIngredientCollisionLocalEvent.trigger(ingredient.getIngredientInfo())
        }
    }
}
