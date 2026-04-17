import { EventManager } from "./EventManager";
import { GameManager } from "./GameManager";

@component
export class ResultHelper extends BaseScriptComponent {
  @input
  winObject!: SceneObject | null

//   @input
//   winSFXObject! : SceneObject | null

  @input
  winTextObject!: SceneObject | null

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
                    if (this.gm?.starterRecipeComplete.currentValue) {
                        const winText = this.winTextObject.getComponent("Text")
                        winText.sizeToFit == false
                        winText.size = 40
                        winText.text = "To PLAY AGAIN hit restart, OR if you want to see Peppi's response to our soup FLIP OVER YOUR PLACEMAT!"
                    }
                }
                //visualEffect.enabled = true;
            } else {
                print("GM heard the Event Manager call for a loss")
                // TODO: loss object
            }
        })

        EventManager.ResetGameNetworkEvent.add(() => {
            visualEffect.enabled = false;
            this.winObject.enabled = false;
        })
    }
}
