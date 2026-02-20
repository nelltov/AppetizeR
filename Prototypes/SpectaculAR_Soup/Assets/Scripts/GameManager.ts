import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { IngredientInfo } from "./Ingredients/Ingredient";
import { EventManager } from "Scripts/EventManager";
import { ourRecipes } from "./Recipes";
import { InteractableManipulation } from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation";

export enum RoundState{
    
    PreRound,
    InRound,
    PostRound
}

@component
export class GameManager extends BaseScriptComponent {

    

    private syncEntity: SyncEntity
    private playerId: number
    private currentRecipe = StorageProperty.manualInt("currentRecipe", 1)
    private currentChef = StorageProperty.manualString("currentChefConnectionId", "");

    @input
    gameStartButton : SceneObject


    onReady() 
    {

    }


    onAwake() {

        //Setting Sync Entity
        this.syncEntity = new SyncEntity(this);

        //Setting up necessary functions and subscriptions once in sessions
        this.syncEntity.notifyOnReady(() => this.onReady())

        //Initializing the Chef Variab;le
        this.syncEntity.addStorageProperty(this.currentChef);
    }
    
    public chooseRandomChef()
    {
        //Sort through all users
        const users = SessionController.getInstance().getUsers();

        //Choose Random
        const chosenChef = this.getRandomElement(users);

        //Get connection Id from UserInfo
        const chosenConnectionId = (chosenChef as any).connectionId as string;

        //sets new Main Chef
        this.currentChef.setPendingValue(chosenConnectionId)

        print("Picked chef connectionId = " + chosenConnectionId);
    }
    getRandomElement<T>(array: T[]): T | undefined
    {
        if (array.length === 0)
        {
            return undefined;
        }
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }
}
