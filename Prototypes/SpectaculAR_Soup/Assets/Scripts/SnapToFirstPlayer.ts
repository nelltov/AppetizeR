import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController";

@component
export class SnapToFirstPlayer extends BaseScriptComponent {

    @input
    target: SceneObject

    @input
    camera: Camera

    private snapped: boolean = false;

    onAwake() {
        SessionController.getInstance().onUserJoinedSession.add(() => {
            if (this.snapped) return;
            // Only snap for the host (first player who started the session)
            if (!SessionController.getInstance().isHost()) return;
            this.snapped = true;
            const t = this.camera.getTransform();
            const offset = t.getWorldRotation().multiplyVec3(new vec3(0, 0, -10));
            this.target.getTransform().setWorldPosition(t.getWorldPosition().add(offset));
            this.target.getTransform().setWorldRotation(t.getWorldRotation());
            print("[SnapToFirstPlayer] Snapped to host headset.");
        });
    }
}
