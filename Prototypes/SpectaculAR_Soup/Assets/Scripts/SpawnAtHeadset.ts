import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity"

@component
export class SpawnAtHeadset extends BaseScriptComponent {

    @input
    camera: Camera

    @input
    targetObject: SceneObject

    onAwake() {
        const syncEntity = new SyncEntity(this)
        syncEntity.notifyOnReady(() => {
            if (!SessionController.getInstance().isHost()) {
                print("[SpawnAtHeadset] I am not the host — disabling script.")
                this.enabled = false
                return
            }

            // Non-host: move object to local camera position
            const t = this.camera.getTransform()
            this.targetObject.getTransform().setWorldPosition(t.getWorldPosition())
            this.targetObject.getTransform().setWorldRotation(t.getWorldRotation())
            print("[SpawnAtHeadset] Non-host placed object at local headset.")
        })
    }
}
