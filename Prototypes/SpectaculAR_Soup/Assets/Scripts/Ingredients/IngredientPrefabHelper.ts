import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty";
import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController";
import { InteractableManipulation } from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation";

@component
export class IngredientPrefabHelper extends BaseScriptComponent 
{

    private syncEntity: SyncEntity
    private playerOwnerNumber = StorageProperty.manualInt("currentRecipe", 1)

    @input()
    manipulatable: InteractableManipulation

    onAwake()
    {
        this.syncEntity = new SyncEntity(this);

        this.syncEntity.addStorageProperty(this.playerOwnerNumber);
        //Setting up necessary functions and subscriptions once in sessions
        this.syncEntity.notifyOnReady(() => this.onReady())

        //Initializing the Chef Variab;le

    }

    private onReady()
    {
        
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

