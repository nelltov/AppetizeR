import { EventWrapper } from "SpectaclesSyncKit.lspkg/Core/EventWrapper";
import { IngredientInfo } from "./Ingredients/Ingredient";

/**
 * Defines the events that scripts can subscribe to and trigger in the project.
 */
@component
export class EventManager extends BaseScriptComponent {
    // Game Events
    static PlayerReadyEvent = new EventWrapper()

    // Put chef and apprentice objects around the table
    static CenterPositionSetLocal = new EventWrapper<[vec3]>()
    static RecipeSelected = new EventWrapper<[string]>()  
    static SpawnPlayerIngredients = new EventWrapper<[number[]]>()  
    static SpawnChefInstructions = new EventWrapper<[IngredientInfo[]]>()

    // Chef progressing through recipe instructions and other players adding ingredients to soup
    static NextInstructionNetworkEvent = new EventWrapper() 
    static NextInstructionLocalEvent = new EventWrapper()
    static SoupPotIngredientCollisionNetworkEvent = new EventWrapper<[IngredientInfo]>() 
    static SoupPotIngredientCollisionLocalEvent = new EventWrapper<[IngredientInfo]>() 

    // Transition to the stage of checking the soup
    static SaltSoupLocalEvent = new EventWrapper()
    static SaltSoupNetworkEvent = new EventWrapper()
    static CheckSoupLocalEvent = new EventWrapper()
    static CheckSoupNetworkEvent = new EventWrapper()
    static CheckRecipeLocalEvent = new EventWrapper()

    // Ending and resetting the game
    static PlayerVictoryNetworkEvent = new EventWrapper<[boolean]>()
    static PlayerVictoryLocalEvent = new EventWrapper<[boolean]>()
    static ResetGameNetworkEvent = new EventWrapper()

    // Shader/Soup Pot actions
    static UpdateSoupSwirlAmount = new EventWrapper<[number]>()

    // Add more events as needed, following the pattern above.
    // Specify the event name and the types of parameters it should accept.
}
