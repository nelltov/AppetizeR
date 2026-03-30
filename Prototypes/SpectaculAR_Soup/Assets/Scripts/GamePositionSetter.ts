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

    @input
    renderMesh: RenderMeshVisual | null = null;

    @input
    lockGameRoot: boolean = false;

    @input
    gameRoot: SceneObject;

    @input
    confirmButtonText: Text | null = null;

    private awaitingConfirmation: boolean = false;
    private interactableComponent: InteractableManipulation | null = null;
    private gameRootInteractable: InteractableManipulation | null = null;

    private syncEntity: SyncEntity | null = null;

    private isLockedProp: StorageProperty<any> | null = null;


    onAwake()
    {
        this.syncEntity = new SyncEntity(this);

        // Register storage property BEFORE notifyOnReady so it syncs correctly
        this.isLockedProp = StorageProperty.manualBool("isLocked", false);
        this.syncEntity.addStorageProperty(this.isLockedProp);

        this.interactableComponent = this.getSceneObject().getComponent(
            InteractableManipulation.getTypeName()
        ) as InteractableManipulation;

        if (this.lockGameRoot && this.gameRoot)
        {
            this.gameRootInteractable = this.gameRoot.getComponent(
                InteractableManipulation.getTypeName()
            ) as InteractableManipulation;
        }

        if (this.renderMesh == null)
        {
            this.renderMesh = this.getSceneObject().getComponent("Component.RenderMeshVisual") as RenderMeshVisual;
        }

        this.syncEntity.notifyOnReady(() =>
        {
            // Subscribe to changes (THIS is what syncs behavior across players)
            this.isLockedProp.onAnyChange.add((newVal: boolean) =>
            {
                if (newVal)
                {
                    this.applyLockedState();
                }
            });

            // Apply initial state for late-joiners
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

        if (!this.awaitingConfirmation)
        {
            this.awaitingConfirmation = true;
            if (this.confirmButtonText) this.confirmButtonText.text = "Finalize position?";
            return;
        }

        this.isLockedProp!.setPendingValue(true);
        this.applyLockedState();
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

        print("[GamePositionSetter] BEFORE — interactableComponent.enabled=" + this.interactableComponent.enabled);
        this.interactableComponent.enabled = false;
        print("[GamePositionSetter] AFTER — interactableComponent.enabled=" + this.interactableComponent.enabled);

        for (let i = 0; i < this.ingredientsObjects.length; i++)
        {
            if (isNull(this.ingredientsObjects[i])) continue;
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

        if (this.lockGameRoot && this.gameRootInteractable)
        {
            this.gameRootInteractable.enabled = false;
        }

        print("[GamePositionSetter] Locked: interactable/menu disabled locally.");
    }
}
