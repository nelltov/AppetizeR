@component
export class SpawnPosition extends BaseScriptComponent {
    @input
    cameraObject: SceneObject

    @input
    spawnOffset: vec3

    onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        // Move the object to camera position + offset and rotate to face the camera
        const transform = this.getSceneObject().getTransform()
        const cameraTransform = this.cameraObject.getTransform()
        const cameraPos = cameraTransform.getWorldPosition()
        const cameraRot = cameraTransform.getWorldRotation()

        // Transform the offset vector by the camera's rotation to apply it in local space
        const localOffset = cameraRot.multiplyVec3(this.spawnOffset)
        transform.setWorldPosition(cameraPos.add(localOffset))

        // Rotate object to face the camera
        transform.setWorldRotation(quat.lookAt(localOffset.uniformScale(-1) , new vec3(0, 1, 0)))
    }
}
