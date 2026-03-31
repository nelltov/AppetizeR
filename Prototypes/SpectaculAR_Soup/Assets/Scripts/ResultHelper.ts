import { EventManager } from "./EventManager";

@component
export class ResultHelper extends BaseScriptComponent {
  
  onAwake(): void {
    let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onReady() })
  }

  onReady(): void {
    const visualEffect = this.sceneObject.getComponent("Component.RenderMeshVisual");
    if(visualEffect == null) print("didntfindRenderMatForResultObject");
    EventManager.PlayerVictoryNetworkEvent.add(() => {

                print("GM heard the Event Manager call for a victory");
                    visualEffect.enabled = true;
                })
    
  }
}
