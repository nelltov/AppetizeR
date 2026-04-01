import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { InstantiationOptions, Instantiator } from "SpectaclesSyncKit.lspkg/Components/Instantiator";
import { IngredientManager } from "./IngredientManager";
import { EventManager } from "./EventManager";
import { ourRecipes, DebugRecipe, Recipe0, Recipe1, Recipes, recipeDictionary} from "./Recipes";
import { IngredientInfo } from "./Ingredients/Ingredient";

export enum RoundState{
    
    PreRound, //0
    InRound, //1
    PostRound //2
}

@component
export class GameManager extends BaseScriptComponent {
    private syncEntity: SyncEntity
    

    private chefSelected = StorageProperty.manualBool("has chef been chose", false);
    private currentChef = StorageProperty.manualString("", "");
    private soupIngredientsCorrect = StorageProperty.manualBool("Soup ing were correct", false);
    private networkedUnusedRecipesArray = StorageProperty.manualStringArray("recipeName", ["this should be the first optional value", "This should be the second optional value"])
    private myID : string;

    private player: number | null = null

    @input
    camera: Camera

    @input
    instantiator : Instantiator

    @input
    ingManager: IngredientManager

    @input
    gameStartButton : SceneObject

    @input
    chefPlayerInfo : SceneObject

    @input
    chefRecipeCheckButton : SceneObject

    @input
    enableHeadFollow: boolean = true

    @input
    chefPlateObjects: SceneObject[]

    private currentIngredientInfoPosition : number = 0
    private followingHead : boolean = true
    private readonly headOffset : vec3 = new vec3(0, 0, -60)
    
 

    private unUsedRecipesArray: string[]
    private currentRecipeIngredientInfo: IngredientInfo[] | null;
    private nonChefPlateIndex: number = -1

    onReady()
    {
        // Subscribe to synced chef property changes
        this.currentChef.onAnyChange.add(() =>
        {
            print("Chef subscribed");
            this.amITheChef();
        })

        this.chefSelected.onAnyChange.add(() =>
        {
            this.amITheChef();
        })


        this.unUsedRecipesArray= ourRecipes.map((recipe) => recipe[0]);

        // for ( let i=0; i<this.unUsedRecipesArray.length; i++)
        // {
        //     this.networkedUnusedRecipesArray[i].setPendingValue(ourRecipes.0)
        //     print(this.networkedUnusedRecipesArray[i].currentOrPendingValue)
        // }
        print(this.networkedUnusedRecipesArray.currentOrPendingValue[0]);

        this.networkedUnusedRecipesArray.setPendingValue(this.unUsedRecipesArray)
    

        // Network event for assigning non-chef plate index
        this.syncEntity.onEventReceived.add("assignNonChefPlateIndex", (messageInfo) => {
            const data = messageInfo.data as { connectionId: string, plateIndex: number }

            // respond if client is the target
            if (SessionController.getInstance().getLocalUserInfo().connectionId === data.connectionId) {
                this.nonChefPlateIndex = data.plateIndex;
            }
        })

        //ensuring all players hear the networked event
        this.syncEntity.onEventReceived.add('heardVictoryCondition', () => {
            EventManager.PlayerVictoryNetworkEvent.trigger(true)
        })

        //
        EventManager.PlayerVictoryLocalEvent.add(() =>
        {
            this.syncEntity.sendEvent('heardVictoryCondition')
        }); 

        // Handle late-joiners: if chef was already selected before this player joined,
        // onAnyChange will never fire, so check the current value immediately
        this.amITheChef()
    }

    onAwake()
    {
        // Keep gameStartButton in front of the headset until the game starts
        const update = this.createEvent("UpdateEvent")

        update.bind(() =>
        {
            if (!this.followingHead) {
                update.enabled = false;
                return;
            }
            if (!this.enableHeadFollow || !this.camera || !this.gameStartButton) return;
            if (!SessionController.getInstance().isHost()) return;
            const t = this.camera.getTransform();
            const worldOffset = t.getWorldRotation().multiplyVec3(this.headOffset);
            this.gameStartButton.getTransform().setWorldPosition(t.getWorldPosition().add(worldOffset));
            this.gameStartButton.getTransform().setWorldRotation(t.getWorldRotation());
        })

        //Setting Sync Entity
        this.syncEntity = new SyncEntity(this);
    

        //Setting up necessary functions and subscriptions once in sessions
        this.syncEntity.notifyOnReady(() => this.onReady())

        //Initializing the Chef Variab;le
        this.syncEntity.addStorageProperty(this.currentChef);
        this.syncEntity.addStorageProperty(this.soupIngredientsCorrect)
        this.syncEntity.addStorageProperty(this.chefSelected)
        this.syncEntity.addStorageProperty(this.networkedUnusedRecipesArray)
    }

    public RandomizeRecipe()
    {
        // Take a SHALLOW COPY so you're not mutating the networked array directly
        const currentRecipes: string[] = [...this.networkedUnusedRecipesArray.currentOrPendingValue];

        print("Network Recipes = " + currentRecipes.length + " and Local Recipe = " + this.unUsedRecipesArray.length);

        if (currentRecipes.length === 0)
        {
            print("No recipes left!");
            return;
        }

        const recipeName = this.getRandomElement<string>(currentRecipes) as string;
        print("Selected recipe: " + recipeName);

        // Find and remove the chosen recipe from the copy
        const index = currentRecipes.indexOf(recipeName);
        if (index !== -1)
        {
            currentRecipes.splice(index, 1);
        }

        // Update both local and networked state from the same source of truth
        this.currentRecipeIngredientInfo = recipeDictionary[recipeName];
        this.unUsedRecipesArray = currentRecipes;
        this.networkedUnusedRecipesArray.setPendingValue(currentRecipes);

        print("After splice — Local: " + this.unUsedRecipesArray.length 
            + ", Network pending: " + this.networkedUnusedRecipesArray.currentOrPendingValue.length);
    }

    public RandomizePlayerRoles()
    {
        if (this.chefSelected.currentOrPendingValue == true) return;

        this.followingHead = false;

       this.RandomizeRecipe();
       

        // Pick a random chef and collect all non-chef players
        const users = SessionController.getInstance().getUsers();
        const chefId = SessionController.getInstance().getLocalConnectionId() as string;
        const nonChefIds = users
            .map(u => (u as any).connectionId as string)
            .filter(id => id !== chefId);

        if (nonChefIds.length === 0)
        {
            print("No non-chef players to receive ingredients.");
            return;
        }

        // Assign index for plate to spawn for each of the non-chef players
        for (let i = 0; i < nonChefIds.length; i++)
        {
            this.syncEntity.sendEvent("assignNonChefPlateIndex", { connectionId: nonChefIds[i], plateIndex: i });
        }

        this.assignChef(chefId, nonChefIds.length);

        // Distribute ingredient prefabs as evenly as possible across non-chef players
        // e.g. 9 prefabs / 4 players → 3 players get 2, 1 player gets 3
        const prefabs = this.ingManager.ingredientPrefabList;
        const baseEach = Math.floor(prefabs.length / nonChefIds.length);
        const remainder = prefabs.length % nonChefIds.length;
    }

    private assignChef(chefId: string, nonChefCount: number)
    {
        this.chefSelected.setPendingValue(true);
        this.currentChef.setPendingValue(chefId);
        this.player = nonChefCount;
        print("Picked chef connectionId = " + chefId);
    }

    private amITheChef()
    {   
        // Get my own ID
        this.myID = SessionController.getInstance().getLocalUserInfo().connectionId

        // Turn off game start locally
        if (this.chefSelected.currentOrPendingValue !== true) return;
        this.gameStartButton.enabled = false;

        // If myID is same as chef I am the chef so I should turn on this local object
        if (this.myID === this.currentChef.currentOrPendingValue) {
            this.chefPlayerInfo.enabled = true;
            this.chefRecipeCheckButton.enabled = true;
            this.chefPlayerInfo.getTransform().setWorldPosition(this.gameStartButton.getTransform().getWorldPosition());
            print(this.myID + " Should turn on the Chef Info")
        }
        // else {  // non-chef player: try to enable corresponding plate based on assigned index
        //     if (this.nonChefPlateIndex >= 0 && this.nonChefPlateIndex < this.chefPlateObjects.length) {
        //         this.chefPlateObjects[this.nonChefPlateIndex].enabled = true;
        //         print(this.myID + " Should turn on plate " + this.nonChefPlateIndex)
        //     }
        // }
    }

    private nextChefIngredient()
    {
        if (this.currentIngredientInfoPosition > this.currentRecipeIngredientInfo.length)
        {
            this.currentIngredientInfoPosition = this.currentRecipeIngredientInfo.length;
            this.chefPlayerInfo.getComponent("Text").text = "No more ingredients should be added!";
            return;
        }
        
        const currentIngredientDisplayed = this.currentRecipeIngredientInfo[this.currentIngredientInfoPosition].variantName;
        this.chefPlayerInfo.getComponent("Text").text = "Current Ingredient to put in soup is: " + currentIngredientDisplayed;
        this.currentIngredientInfoPosition++;
    }
    private isTheSoupRightDemo()
    {
        // Get pot contents (vec2[] where x=category, y=variantId)
        const pot = this.ingManager.getCurrentIngredientsInPot().currentOrPendingValue;
        //print("Pot contents (" + pot.length + "): " + pot.map(v => "(cat=" + v.x + ", var=" + v.y + ")").join(", "));
        
        // Quick fail: different lengths cannot match exactly
        if (pot.length != this.currentRecipeIngredientInfo.length)
        {
            print(pot.length + ": pot length and Recipe length is: " + this.currentRecipeIngredientInfo.length)
            return false;
        }

        // Compare each ingredient slot
        for (let i = 0; i < pot.length; i++)
        {
            const potVec = pot[i];
            const expected = this.currentRecipeIngredientInfo[i];

            // Compare values
            const matches =
                potVec.x === expected.category &&
                potVec.y === expected.variantId;

            if (!matches)
            {
                print(
                    "Soup check failed for " + this.currentRecipeIngredientInfo +
                    " at index " + i +
                    " pot=(" + potVec.x + "," + potVec.y + ")" +
                    " expected=(" + expected.category + "," + expected.variantId + ")"
                );
                
                return false;
            }
        }

        // If we never failed, it matches
        this.soupIngredientsCorrect.setPendingValue(true);

        print("Soup check passed. Setting the soupIngredientsCorrect to True");
        
        EventManager.PlayerVictoryLocalEvent.trigger(true);

        return true;
    }

    private getRandomElement<T>(array: T[]): T | undefined
    {
        if (array.length === 0)
        {
            return undefined;
        }
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }
}
