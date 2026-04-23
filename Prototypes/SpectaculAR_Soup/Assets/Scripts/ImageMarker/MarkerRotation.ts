import { lerp } from "SpectaclesInteractionKit.lspkg/Utils/mathUtils"
import { EventManager } from "Scripts/EventManager"

@component
export class SoupStirring extends BaseScriptComponent {
    private prevFrameRot: quat
    private swirlAmount: number

    // Shader parameters
    @input
    minRotationThresholdDeg: number = 1.0   // Minimum rotation (in degrees) to start affecting the soup

    onAwake() {
        // Set up Start and Update events
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })

        let updateEvent = this.createEvent("UpdateEvent")
        updateEvent.bind(() => { this.onUpdate() })
    }

    onStart() {
        // Initialize shader parameters and previous rotation
        this.swirlAmount = 0
        this.prevFrameRot = this.sceneObject.getTransform().getWorldRotation()
    }

    onUpdate() {
        // Compute rotation since last frame
        const currentRot = this.sceneObject.getTransform().getWorldRotation()
        const rotationSinceLastFrame = this.getRotationAngleDegrees(this.prevFrameRot, currentRot)

        // Update shader values based on rotation
        const smoothingAlpha = 0.05
        if (Math.abs(rotationSinceLastFrame) >= this.minRotationThresholdDeg) {
            this.swirlAmount = lerp(this.swirlAmount, Math.sign(rotationSinceLastFrame), smoothingAlpha) 
        } else {
            // Decay at a slower rate than speed up
            this.swirlAmount = lerp(this.swirlAmount, 0, smoothingAlpha / 5)
        }

        EventManager.UpdatePotRotation.trigger(rotationSinceLastFrame)
        EventManager.UpdateSoupSwirlAmount.trigger(this.swirlAmount)

        // Update rotation value for next frame
        this.prevFrameRot = currentRot
    }

    /**
     * Helper function for computing the change in the object's rotation between frames,
     * specifically the component of rotation around the local up axis. Returns the signed angle in degrees.
     * Positive is counterclockwise, and negative is clockwise when looking at object from above.
     */
    private getRotationAngleDegrees(prevRot: quat, currentRot: quat): number {
        // qRel = current * inverse(prev)
        const qRel = currentRot.multiply(prevRot.invert())

        const rotAngle = qRel.getAngle()
        const rotAxis = qRel.getAxis().normalize()

        // tiny-angle guard
        if (Math.abs(rotAngle) < 1e-6) return 0

        // Object's local up rotated into world space
        const localUpWorld = currentRot.multiplyVec3(vec3.up()).normalize()

        // Compute the rotation component specifically around the object's local up axis.
        const localUpProjection = MathUtils.clamp(rotAxis.dot(localUpWorld), -1, 1)
        let signedAroundUp = rotAngle * localUpProjection
       
        // Wrap to [-PI, PI]
        if (signedAroundUp > Math.PI) signedAroundUp -= 2 * Math.PI
        if (signedAroundUp < -Math.PI) signedAroundUp += 2 * Math.PI

        // Convert to degrees and print
        const degAroundUp = signedAroundUp * 180 / Math.PI
        return degAroundUp
    }
}
