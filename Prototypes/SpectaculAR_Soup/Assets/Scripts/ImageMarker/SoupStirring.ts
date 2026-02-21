@component
export class SoupStirring extends BaseScriptComponent {
    private soupMaterial: Material
    private soupShader: Pass

    onAwake() {
        // Set up Start and Update events
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })

        let updateEvent = this.createEvent("UpdateEvent")
        updateEvent.bind(() => { this.onUpdate() })
    }

    onStart() {
        this.soupMaterial = this.sceneObject.getComponent("Component.RenderMeshVisual").getMaterial(0)
        this.soupShader = this.soupMaterial.mainPass
        // print(`Shader rotation speed - ${this.soupShader.rotationSpeed}`)
        // print(`Shader swirl amount - ${this.soupShader.swirlAmount}`)
    }

    onUpdate() {

    }
}
