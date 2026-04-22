@component
export class NewScript extends BaseScriptComponent {
    private sceneObj: SceneObject
    private rotateSpeed: number

    onAwake() {
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })

        let updateEvent = this.createEvent("UpdateEvent")
        updateEvent.bind(() => { this.onUpdate() })
    }

    onStart() {
        this.sceneObj = this.getSceneObject()
        this.rotateSpeed = Math.PI * 0.5
    }

    onUpdate() {
        var transform = this.sceneObj.getTransform();
        var rotation = transform.getLocalRotation();
        var rotateBy = quat.angleAxis(-this.rotateSpeed * getDeltaTime(), vec3.forward());
        rotation = rotation.multiply(rotateBy);
        transform.setLocalRotation(rotation);
    }
}
