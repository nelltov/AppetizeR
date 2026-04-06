import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import { GameManager } from "./GameManager";

@component
export class InstructionManager extends BaseScriptComponent {

    @input
    public instructionArray : string[];

    @input
    public instructionImageHolderObject : SceneObject;

     @input
    public instructionStringHolderObject : SceneObject;


    @input
    public saltShakerObject : SceneObject;

    @input
    public gameRootObject : SceneObject;

    @input
    public instructionImages : Texture[];


    private syncEntity : SyncEntity

    private currentInstruction = StorageProperty.manualInt("currentInstruction", 0)

    onAwake() {
        this.syncEntity = new SyncEntity(this)
        this.syncEntity.addStorageProperty(this.currentInstruction)

        // Update UI on all clients whenever the instruction index changes
        this.currentInstruction.onAnyChange.add((value) => {
            if (value >= this.instructionImages.length)
            {
                this.saltShakerObject.enabled = false;
                this.gameRootObject.enabled = true;
                return;
            }
            
            this.instructionImageHolderObject.getComponent("Image").mainPass.baseTex = this.instructionImages[value];
            this.instructionStringHolderObject.getComponent("Text").text= this.instructionArray[value]
            
        })
    }

    public nextInstruction()
    {
        const next = this.currentInstruction.currentOrPendingValue + 1;
        this.currentInstruction.setPendingValue(next);
    }
}
