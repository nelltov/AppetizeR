import { EventManager } from "Scripts/EventManager";

@component
export class ResetGameHelper extends BaseScriptComponent {
  
  onAwake(): void {
    let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onReady() })
  }

  onReady(): void {
    const chefChooserButton = this.sceneObject.getComponent("Component.RenderMeshVisual");
    if(chefChooserButton == null) print("didntfindRenderMatForResultObject");
    EventManager.ResetGameNetworkEvent.add(() => {

                print("Game Should be Reset");
                    chefChooserButton.enabled = true;
                })
    
  }
}
