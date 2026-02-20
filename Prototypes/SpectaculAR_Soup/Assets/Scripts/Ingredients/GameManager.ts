import { getEnumMember, getEnumMemberName, IngredientCategory } from "./IngredientTypes";
import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { IngredientInfo } from "./Ingredient";
import { EventManager } from "Scripts/EventManager";
import { BaseButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/BaseButton";

export enum RoundState{
    
    PreRound,
    InRound,
    PostRound
}

type Recipes = [string, IngredientInfo[]] 

export const Recipe0 : IngredientInfo[] = [
    new IngredientInfo(1,1),    //Onion
    new IngredientInfo(1,11),   //Garlic
    new IngredientInfo(0,0),    //Beef
    new IngredientInfo(3,4),    //ChickenBroth
    new IngredientInfo(1,6),    //Tomato
    new IngredientInfo(1,2),    //Carrot
    new IngredientInfo(2,5)     //Rosemary
]

export const Recipe1 : IngredientInfo[] = [
    new IngredientInfo(1,1),    //Onion
    new IngredientInfo(1,7),    //Celery
    new IngredientInfo(0,1),    //Chicken
    new IngredientInfo(1,2),    //Carrot
    new IngredientInfo(1,0),    //Potatoe
    new IngredientInfo(4,6),    //Bay Leaf
    new IngredientInfo(5,0)     //Noodles
]

const ourRecipes : Recipes[] = [
    ["BeefStew", Recipe0],
    ["Chicken Noodle", Recipe1]
]

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
