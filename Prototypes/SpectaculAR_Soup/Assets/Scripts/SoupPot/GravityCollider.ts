import { Ingredient } from "../Ingredients/Ingredient"

@component
export class GravityCollider extends BaseScriptComponent {
    private sceneObj: SceneObject
    private gravityCollider: ColliderComponent

    onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        this.sceneObj = this.getSceneObject()

        // Bind onOverlapEnter event for the gravity collider (trigger collider)
        this.gravityCollider = this.sceneObj.getComponent("ColliderComponent") as ColliderComponent
        if (this.gravityCollider) {
            this.gravityCollider.onOverlapEnter.add((e) => this.onOverlapEnter(e))
        }
    }

    private onOverlapEnter(other: any) {
        var otherObj = other?.overlap?.collider?.sceneObject
        if (isNull(otherObj)) return

        // only apply to objects with Ingredient component
        const ingredient = otherObj.getComponent(
            Ingredient.getTypeName()
        ) as Ingredient

        if (ingredient) {
            // Add mass so gravity will be applied
            const physicsBody = other.overlap.collider as BodyComponent
            if (physicsBody) {
                physicsBody.intangible = true
                print("trying to apply gravity!")
                physicsBody.mass = 1.0
            }
        }
    }
}
