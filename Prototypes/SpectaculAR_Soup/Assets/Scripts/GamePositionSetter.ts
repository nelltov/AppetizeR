import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty";
import { InteractableManipulation } from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation";

@component
export class GamePositionSetter extends BaseScriptComponent
{
    @input
    menuObject: SceneObject;

    

    @input
    ingredientsObjects: SceneObject[]

    private renderMesh: RenderMeshVisual | null = null;
   
    private interactableComponent: InteractableManipulation | null = null;

    private syncEntity: SyncEntity | null = null;

    private isLockedProp: StorageProperty<any> | null = null;


    onAwake()
    {
        // Programmatic SyncEntity (matches the AirHockey sample pattern)
        this.syncEntity = new SyncEntity(this);
    
        this.interactableComponent = this.getSceneObject().getComponent(
            InteractableManipulation.getTypeName()
        ) as InteractableManipulation;

        this.renderMesh = this.getSceneObject().getComponent("Component.RenderMeshVisual") as RenderMeshVisual;

        this.syncEntity.notifyOnReady(() =>
        {
            // 1) Create + register synced state
            this.isLockedProp = StorageProperty.manualBool("isLocked", false);
            this.syncEntity!.addStorageProperty(this.isLockedProp);

            // 2) Subscribe to changes (THIS is what syncs behavior across players)
            this.isLockedProp.onAnyChange.add((newVal: boolean) =>
            {
                if (newVal)
                {
                    this.applyLockedState();
                }
            });

            // 3) Apply initial state for late-joiners
            if (this.isLockedProp.currentValue === true)
            {
                this.applyLockedState();
            }
        });
    }

    // Call this when YOU want to lock it for everyone (button press / release event / etc.)
    public lockForEveryone()
    {
       
        if (!this.syncEntity || !this.isLockedProp) return;

            this.isLockedProp!.setPendingValue(true);
            this.applyLockedState(); // do it immediately locally too

        

    }

    // This runs locally on EVERY player when isLocked becomes true
    private applyLockedState()
    {
        if (this.interactableComponent == null)
            {
                this.interactableComponent = this.getSceneObject().getParent().getComponent(InteractableManipulation.getTypeName()
                ) as InteractableManipulation;
                /*this.interactableComponent = this.getSceneObject().getComponent(
                InteractableManipulation.getTypeName()
                ) as InteractableManipulation;*/
            }

            this.interactableComponent.setCanTranslate(false);
            this.interactableComponent.setCanRotate(false);
            this.interactableComponent.setCanScale(false);
            print(this.interactableComponent.canTranslate + " This is the Translate Value.")
            
        for (let i =0; i < this.ingredientsObjects.length; i++)
            {
                this.ingredientsObjects[i].enabled = this.isLockedProp.currentOrPendingValue;
                print("turning on objects");
            }

        if (this.renderMesh)
        {
            print("Going to turn off rendermesh. Rendermesh bool = " + this.renderMesh.enabled)
            this.renderMesh.enabled = false;
            print("Trying to turn off rendermesh. Rendermesh bool = " + this.renderMesh.enabled)
        }
        if (this.menuObject)
            {
                this.menuObject.enabled = false;
            }

        print("[GamePositionSetter] Locked: interactable/menu disabled locally.");
    }
}
