import { EventManager } from "../EventManager";
import { Ingredient } from "../Ingredients/Ingredient";

@component
export class IngredientTrigger extends BaseScriptComponent {
    private sceneObj: SceneObject
    private ingredientTrigger: BodyComponent
    private ingredient: Ingredient

    onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        this.sceneObj = this.getSceneObject()
        this.ingredient = this.sceneObj.getComponent(Ingredient.getTypeName()) as Ingredient

        // Bind onCollisionEnter event for the soup pot's collider
        this.ingredientTrigger = this.sceneObj.getComponent("ColliderComponent") as BodyComponent
        if (this.ingredientTrigger) {
            this.ingredientTrigger.onOverlapEnter.add((e) => this.onOverlapEnter(e))
        }
    }

    private onOverlapEnter(other: any) {
        var otherObj = other?.overlap?.collider?.sceneObject
        if (isNull(otherObj)) return

        if (otherObj && otherObj.name === "SoupCollider" && this.ingredient) {
            print("Soup collider!!")
            EventManager.SoupPotIngredientCollisionLocalEvent.trigger(this.ingredient.getIngredientInfo())
            this.sceneObj.enabled = false    // Disable the ingredient object after collision
        }
    }
}
