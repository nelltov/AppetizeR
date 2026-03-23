import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty";
import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController";
import { InteractableManipulation } from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation";

@component
export class IngredientPrefabHelper extends BaseScriptComponent 
{

    private syncEntity: SyncEntity
    private playerOwnerNumber = StorageProperty.manualInt("currentRecipe", 1)
    private hasUnparented = false

    private manipulatable: InteractableManipulation

    @input()
    worldRoot: SceneObject

    onAwake()
    {
        this.syncEntity = new SyncEntity(this);

        this.manipulatable = this.getSceneObject().getComponent(
            InteractableManipulation.getTypeName()
        ) as InteractableManipulation;

        this.syncEntity.addStorageProperty(this.playerOwnerNumber);
        //Setting up necessary functions and subscriptions once in sessions
        this.syncEntity.notifyOnReady(() => this.onReady())

    }

    private onReady()
    {
        this.manipulatable.onManipulationStart.add(() => this.unparentOnFirstInteraction());
    }

    private unparentOnFirstInteraction()
    {
        if (this.hasUnparented) return;
        this.hasUnparented = true;

        const obj = this.getSceneObject();
        const t = obj.getTransform();

        // Capture world transform before reparenting
        const worldPos = t.getWorldPosition();
        const worldRot = t.getWorldRotation();
        const worldScale = t.getWorldScale();

        // Move to colocated world root to shed the parent's scale
        obj.setParent(this.worldRoot);

        // Restore world transform so it doesn't jump
        t.setWorldPosition(worldPos);
        t.setWorldRotation(worldRot);
        t.setWorldScale(worldScale);

        print("[IngredientPrefabHelper] Unparented on first interaction.");
    }



    public setPlayerOwner(number)
    {
        this.playerOwnerNumber.setPendingValue(number);
    }

    public getPlayerOwner(): number
    {
        return this.playerOwnerNumber.currentOrPendingValue;
    }
}

