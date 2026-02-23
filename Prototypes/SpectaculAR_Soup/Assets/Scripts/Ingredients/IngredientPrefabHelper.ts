import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty";
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

        //Setting up necessary functions and subscriptions once in sessions
        this.syncEntity.notifyOnReady(() => this.onReady())

        //Initializing the Chef Variab;le
        this.syncEntity.addStorageProperty(this.playerOwnerNumber);
    }

    private onReady()
    {
      if (this.syncEntity.networkRoot.locallyCreated) {
            // Piece belongs to me, I can move it
            this.manipulatable.setCanTranslate(true)
            
        } else {
            // Piece belongs to other player, I can't move it
            this.manipulatable.setCanTranslate(false)
        } 
    }



    public setPlayerOwner(number)
    {
        this.playerOwnerNumber.setPendingValue(number);
    }

    public getPlayerOwner(number)
    {
        if (number == this.playerOwnerNumber)
        {
            return true;
        }
        else return false;
    }
}

