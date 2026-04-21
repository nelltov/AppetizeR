import { EventManager } from "./EventManager";
import { GameManager } from "./GameManager";

@component
export class ResultHelper extends BaseScriptComponent {
  @input
  dialogueObject: SceneObject | null

  @input
  dialogueText: Text | null

  @input
  winSFXObject : SceneObject | null

  @input
  loseSFXObject : SceneObject | null

  @input
  gameManager!: GameManager | null

    onAwake(): void {
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart(): void {
        const visualEffect = this.sceneObject.getComponent("Component.RenderMeshVisual")
        if (visualEffect == null) print("didntfindRenderMatForResultObject")

        EventManager.PlayerVictoryNetworkEvent.add((isVictory: boolean) => {
            this.dialogueObject.enabled = true;

            if (isVictory) {
                this.winSFXObject.enabled = true;
                this.winSFXObject.getComponent("VFXComponent").restart()

                if (this.gameManager?.starterRecipeComplete.currentValue) {
                    this.dialogueText.text = "We've done it, Chefs! This \"Soup of the Day\" is perfect!"
                } else {
                    this.dialogueText.text = "That one was a warmup! Now make the real thing!"
                }
            } else {
                print("GM heard the Event Manager call for a loss")

                this.dialogueText.text = "Oof, that's a... unique flavor."
                this.loseSFXObject.enabled = true;
                this.loseSFXObject.getComponent("VFXComponent").restart()
            }
        })

        EventManager.ResetGameNetworkEvent.add(() => {
            visualEffect.enabled = false
            this.dialogueObject.enabled = false
            this.winSFXObject.enabled = false
            this.loseSFXObject.enabled = false
        })
    }
}
