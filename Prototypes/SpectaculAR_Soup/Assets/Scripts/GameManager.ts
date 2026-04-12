import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { IngredientManager } from "./IngredientManager";
import { EventManager } from "./EventManager";
import { ourRecipes, recipeDictionary} from "./Recipes";
import { IngredientInfo } from "./Ingredients/Ingredient";
import { distributeIngredients } from "./Ingredients/IngredientDistribution";

@component
export class GameManager extends BaseScriptComponent {
    private syncEntity: SyncEntity
    
    private chefSelected = StorageProperty.manualBool("has chef been chose", false);
    private currentChef = StorageProperty.manualString("", "");
    public starterRecipeComplete = StorageProperty.manualBool("Has Starter Recipe Been Finished?", false);
    private networkedUnusedRecipesArray = StorageProperty.manualStringArray("recipeName", ["this should be the first optional value", "This should be the second optional value"])

    @input
    camera: Camera

    @input
    ingManager: IngredientManager

    @input
    public gameStartButton : SceneObject

    @input
    enableHeadFollow: boolean = true

    private followingHead : boolean = true
    private readonly headOffset : vec3 = new vec3(0, 0, -60)
    
    private unUsedRecipesArray: string[]
    private currentRecipeIngredientInfo: IngredientInfo[] | null;
    private myID: string = ""

    onReady()
    {
        // Subscribe to synced chef property changes
        this.currentChef.onAnyChange.add(() =>
        {
            print("Chef subscribed");
            this.amITheChef();
            print("Current Chef will change")
            // Spawn chef instructions with the recipe info
            if (SessionController.getInstance().getLocalUserInfo().connectionId === this.currentChef.currentOrPendingValue) {
                print("Nellie wants print statements that say i am the chef as she stands here and tells me everything to type")
                EventManager.SpawnChefInstructions.trigger(this.currentRecipeIngredientInfo || [])
            }
        })

        this.chefSelected.onAnyChange.add(() =>
        {
            this.amITheChef();
        })


        this.unUsedRecipesArray = ourRecipes.map((recipe) => recipe[0]);

        this.networkedUnusedRecipesArray.setPendingValue(this.unUsedRecipesArray)
    
        // TODO: make these event bindings into helper functions
        // Instantiate plates for each non-chef player
        this.syncEntity.onEventReceived.add("distributeNonChefIngredients", (messageInfo) => {
            const data = messageInfo.data as { connectionId: string, ingredientsList : number[] }

            // respond if client is the target
            if (SessionController.getInstance().getLocalUserInfo().connectionId === data.connectionId) {
                EventManager.SpawnPlayerIngredients.trigger(data.ingredientsList)
            }
        })

        /* Sync events for recipe UI progression */
        EventManager.NextInstructionLocalEvent.add(() => {
            this.syncEntity.sendEvent("nextInstruction", {})
        })

        this.syncEntity.onEventReceived.add("nextInstruction", () => {
            EventManager.NextInstructionNetworkEvent.trigger()
        })

        EventManager.CheckSoupLocalEvent.add(() => {
            // TODO: actually check the soup on this event too (after removing placeholder buttons)
            this.syncEntity.sendEvent("checkSoup", {})
        })

        this.syncEntity.onEventReceived.add("checkSoup", () => {
            EventManager.CheckSoupNetworkEvent.trigger()
        })

        EventManager.CheckRecipeLocalEvent.add(() => {
            this.syncEntity.sendEvent("checkRecipe", { connectionId: this.myID })
        })

        this.syncEntity.onEventReceived.add("checkRecipe", (messageInfo) => {
            // Have the chef specifically call the soup checking function
            const data = messageInfo.data as { connectionId: string }
            if (this.myID === data.connectionId) {
                this.isTheSoupRightDemo()
            }
        })

        /* End of game events */
        // Ensuring all players hear the networked event
        this.syncEntity.onEventReceived.add('heardVictoryCondition', (messageInfo) => {
            const data = messageInfo.data as { isVictory: boolean }
            EventManager.PlayerVictoryNetworkEvent.trigger(data.isVictory)
        })

        // One person triggering local event propagates event to all other devices
        EventManager.PlayerVictoryLocalEvent.add((isVictory: boolean) =>
        {
            this.syncEntity.sendEvent('heardVictoryCondition', { isVictory: isVictory })
        })

        this.syncEntity.onEventReceived.add('heardResetCondition', () => {
            this.ingManager.resetCurrentIngredients();  // one-time reset of the current ingredients in the pot
            EventManager.ResetGameNetworkEvent.trigger();
        })

        // Reset the chef selection button
        EventManager.ResetGameNetworkEvent.add(() =>
        {
            this.gameStartButtonReset();
        })

    
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
        this.syncEntity.addStorageProperty(this.chefSelected)
        this.syncEntity.addStorageProperty(this.networkedUnusedRecipesArray);
        this.syncEntity.addStorageProperty(this.starterRecipeComplete);
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

        var recipeName = this.getRandomElement<string>(currentRecipes) as string;
        
        if (this.starterRecipeComplete.currentOrPendingValue == false) {
            recipeName = "StarterRecipe";
            
        }
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

        // Get ingredient lists for each non-chef player based on the current recipe
        const ingredientsDistribution = distributeIngredients(this.currentRecipeIngredientInfo as IngredientInfo[], nonChefIds.length)

        // Assign index for plate to spawn for each of the non-chef players
        for (let i = 0; i < nonChefIds.length; i++)
        {
            this.syncEntity.sendEvent("distributeNonChefIngredients", { connectionId: nonChefIds[i], ingredientsList: ingredientsDistribution[i] })
        }

        this.assignChef(chefId)
    }

    private assignChef(chefId: string)
    {
        this.chefSelected.setPendingValue(true);
        this.currentChef.setPendingValue(chefId);
        print("Picked chef connectionId = " + chefId);
    }


    // Phasing this out, won't be needed for the refactored game start
    private amITheChef()
    {   
        // Get my own ID
        this.myID = SessionController.getInstance().getLocalUserInfo().connectionId

        // Turn off game start locally
        if (this.chefSelected.currentOrPendingValue !== true) return;
        this.gameStartButton.enabled = false;

        // If myID is same as chef I am the chef so I should turn on this local object
        // if (this.myID === this.currentChef.currentOrPendingValue) {
        //     this.chefPlayerInfo.enabled = true;
        //     this.chefRecipeCheckButton.enabled = true;
        //     this.chefPlayerInfo.getTransform().setWorldPosition(this.gameStartButton.getTransform().getWorldPosition());
        //     print(this.myID + " Should turn on the Chef Info")
        // }
    }

    private GameReset()
    {
        print("Game Resetting!")
        this.syncEntity.sendEvent('heardResetCondition')
    }

    public gameStartButtonReset() {
        this.gameStartButton.enabled = true;
        this.chefSelected.setPendingValue(false);
        this.currentChef.setPendingValue("");
    }

    private isTheSoupRightDemo()
    {
        // Get pot contents (number[] of ingredient types)
        const pot : number[] = this.ingManager.getCurrentIngredientsInPot().currentOrPendingValue;
        
        // Quick fail: different lengths cannot match exactly
        if (pot.length != this.currentRecipeIngredientInfo.length)
        {
            
            EventManager.PlayerVictoryLocalEvent.trigger(false)
            return false
        }

        // Compare each ingredient slot
        for (let i = 0; i < pot.length; i++)
        {
            const potIng = pot[i]
            const expected = this.currentRecipeIngredientInfo[i]

            // Compare values
            const matches = expected.isSameIngredient(new IngredientInfo(potIng))

            if (!matches)
            {
                print(`Soup check failed for ${this.currentRecipeIngredientInfo} at index ${i} pot=(${potIng}) expected=(${expected.ingredient})`)
                EventManager.PlayerVictoryLocalEvent.trigger(false)
                return false
            }
        }

        print("Soup check passed.");
        this.starterRecipeComplete.setPendingValue(true);
        EventManager.PlayerVictoryLocalEvent.trigger(true)
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
