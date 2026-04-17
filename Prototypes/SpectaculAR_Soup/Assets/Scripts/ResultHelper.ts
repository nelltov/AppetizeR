import { EventManager } from "./EventManager";
import { GameManager } from "./GameManager";

@component
export class ResultHelper extends BaseScriptComponent {
  @input
  winObject!: SceneObject | null

  @input
  winSFXObject! : SceneObject | null

  @input
  loseSFXObject! : SceneObject | null

  @input
  winText!: Text | null

  @input
  gm!: GameManager | null

    onAwake(): void {
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart(): void {
        const visualEffect = this.sceneObject.getComponent("Component.RenderMeshVisual")
        if (visualEffect == null) print("didntfindRenderMatForResultObject")

        EventManager.PlayerVictoryNetworkEvent.add((isVictory: boolean) => {
            if (isVictory) {
                if (!this.winObject?.enabled) {
                    this.winObject.enabled = true;
                    this.winSFXObject.enabled = true;
                    this.winSFXObject.getComponent("VFXComponent").restart();
                    if (this.gm?.starterRecipeComplete.currentValue) {
                        this.winText.text = "To PLAY AGAIN hit restart...Or just enjoy the Soup of the Day!!!"
                    } else {
                        this.winText.text = "That one was a warmup! Go Again!"
                    }
                }
                //visualEffect.enabled = true;
            } else {
                print("GM heard the Event Manager call for a loss")
                this.loseSFXObject.enabled = true;
                this.loseSFXObject.getComponent("VFXComponent").restart();
            }
        })

        EventManager.ResetGameNetworkEvent.add(() => {
            visualEffect.enabled = false;
            this.winObject.enabled = false;
            this.winSFXObject.enabled = false;
            this.loseSFXObject.enabled = false;
        })
    }
}
