import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { IngredientInfo } from "./Ingredients/Ingredient";
import { EventManager } from "Scripts/EventManager";
import { BaseButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/BaseButton";
import { ourRecipes } from "./Recipes";

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



    onReady() 
    {
        //Reference to the UI button to start game
        const startGameButton = this.getSceneObject().getComponent(
            BaseButton.getTypeName()
        ) as BaseButton;

        //Event subscribing to make a new chef
        let startEvent = startGameButton.onStateChanged
        startEvent.bind(() => { this.chooseRandomChef() })
    }


    onAwake() {

        //Setting Sync Entity
        this.syncEntity = new SyncEntity(this);

        //Setting up necessary functions and subscriptions once in sessions
        this.syncEntity.notifyOnReady(() => this.onReady())

        //Initializing the Chef Variab;le
        this.syncEntity.addStorageProperty(this.currentChef);
    }
    
    chooseRandomChef()
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
