import { EventManager } from "Scripts/EventManager"

@component
export class SoupStirring extends BaseScriptComponent {
    private soupMaterial: Material
    private soupShader: Pass

    onAwake() {
        // Set up Start and Update events
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        // Assign references to material and shader
        const meshVisual = this.sceneObject.getComponent("Component.RenderMeshVisual") as RenderMeshVisual
        this.soupMaterial = meshVisual.getMaterial(0).clone()
        meshVisual.mainMaterial = this.soupMaterial
        this.soupShader = this.soupMaterial.mainPass

        this.soupShader.swirlAmount = 0

        // Respond to event containing updated value of swirlAmount parameter
        EventManager.UpdateSoupSwirlAmount.add((swirlAmount: number) => {
            this.soupShader.swirlAmount = swirlAmount
        })
    }
}
