@component
export class BillboardToCamera extends BaseScriptComponent {
    @input
    cameraObject: SceneObject

    onAwake() {
        let updateEvent = this.createEvent("UpdateEvent")
        updateEvent.bind(() => { this.onUpdate() })
    }

    onUpdate() {
        const transform = this.getSceneObject().getTransform()
        const cameraTransform = this.cameraObject.getTransform()
        const cameraPos = cameraTransform.getWorldPosition()

        // Rotate object to face the camera (only around the y-axis)
        const direction = cameraPos.sub(transform.getWorldPosition())
        const horizontalDirection = new vec3(direction.x, 0, direction.z)
        if (horizontalDirection.length > 0) {
            transform.setWorldRotation(quat.lookAt(horizontalDirection, new vec3(0, 1, 0)))
        }
    }
}
