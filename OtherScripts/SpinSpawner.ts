@component
export class SpinSpawner extends BaseScriptComponent {

    @input
    markerRoot: SceneObject

    @input
    objectWhenRotating: SceneObject

    @input
    objectWhenNotRotating: SceneObject

    @input
    rotationThresholdDeg: number = 2.0   // degrees per frame-ish threshold

    @input
    settleFrames: number = 10            // how many frames of "no rotation" to switch back

    private isRotating: boolean = false
    private lastMarkerRot: quat = quat.quatIdentity()
    private stillFrames: number = 0

    onAwake() {
        if (!this.markerRoot || !this.objectWhenRotating || !this.objectWhenNotRotating) {
            print("MarkerRotationToggle: missing @input references")
            return
        }

        // Initialize last rotation
        this.lastMarkerRot = this.markerRoot.getTransform().getWorldRotation()

        // Apply initial state
        this.applyState(false)

        this.createEvent("UpdateEvent").bind(() => this.onUpdate())
    }

    private onUpdate() {
        const markerTransform = this.markerRoot.getTransform()
        const currentRot = markerTransform.getWorldRotation()

        // Angle between last and current rotation (in degrees)
        const deltaDeg = this.quatAngleDegrees(this.lastMarkerRot, currentRot)

        if (deltaDeg >= this.rotationThresholdDeg) {
            this.stillFrames = 0
            if (!this.isRotating) {
                this.isRotating = true
                this.applyState(true)
            }
        } else {
            this.stillFrames++
            if (this.isRotating && this.stillFrames >= this.settleFrames) {
                this.isRotating = false
                this.applyState(false)
            }
        }

        this.lastMarkerRot = currentRot
    }

    private applyState(rotating: boolean) {
        // Only one active at a time
        this.objectWhenRotating.enabled = rotating
        this.objectWhenNotRotating.enabled = !rotating
    }

    // Compute angular difference between two quaternions (degrees)
    private quatAngleDegrees(a: quat, b: quat): number {
        // qDelta = inverse(a) * b
        const invA = a.invert()
        const qDelta = invA.multiply(b)

        // Clamp for safety
        const w = Math.max(-1.0, Math.min(1.0, qDelta.w))
        const angleRad = 2.0 * Math.acos(w)

        return angleRad * (180.0 / Math.PI)
    }
}
