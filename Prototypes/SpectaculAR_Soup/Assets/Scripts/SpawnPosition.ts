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

        // Rotate object to face the camera (only around the y-axis)
        const direction = localOffset.uniformScale(-1)
        const horizontalDirection = new vec3(direction.x, 0, direction.z)
        if (horizontalDirection.length > 0) {
            transform.setWorldRotation(quat.lookAt(horizontalDirection, new vec3(0, 1, 0)))
        }
    }
}
