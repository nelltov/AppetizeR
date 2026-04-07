import { EventManager } from "./EventManager";

@component
export class ResultHelper extends BaseScriptComponent {
  @input
  winObject!: SceneObject | null;

    onAwake(): void {
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart(): void {
        const visualEffect = this.sceneObject.getComponent("Component.RenderMeshVisual");
        if(visualEffect == null) print("didntfindRenderMatForResultObject");

        EventManager.PlayerVictoryNetworkEvent.add((isVictory: boolean) => {
            if (isVictory) {
                print("GM heard the Event Manager call for a victory");
                if (this.winObject?.enabled == false){
                    this.winObject.enabled = true;
                }
                visualEffect.enabled = true;
            } else {
                print("GM heard the Event Manager call for a loss");
                // TODO: loss object
            }
        })

        EventManager.ResetGameNetworkEvent.add(() => {
            visualEffect.enabled = false;
            this.winObject.enabled = false;
        })
    }
}
