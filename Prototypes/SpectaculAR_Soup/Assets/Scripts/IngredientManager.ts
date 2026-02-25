import { getEnumMember, getEnumMemberName, IngredientCategory } from "./Ingredients/IngredientTypes";
import { IngredientInfo } from "./Ingredients/Ingredient";
import { EventManager } from "Scripts/EventManager";
import { StoragePropertySet } from "SpectaclesSyncKit.lspkg/Core/StoragePropertySet";
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty";
import { StorageTypes } from "SpectaclesSyncKit.lspkg/Core/StorageTypes";


@component
export class IngredientManager extends BaseScriptComponent{

    @input
    ingredientPrefabList : ObjectPrefab[];

    public currentIngredients: StorageProperty<StorageTypes.vec2Array>

    onAwake()
    {
        
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart()
    {
        this.currentIngredients = StorageProperty.manualVec2Array("currentIngredients", []);
        EventManager.SoupPotIngredientLocalCollisionEvent.add((ingredientInfo: IngredientInfo) => 
                {
                    print(`Ingredient Manager heard the collision`);
                    this.updateStorageProperties(ingredientInfo);
                })
    
    }

    public getCurrentIngredientsInPot()
    {
        return this.currentIngredients;
    }
   
    updateStorageProperties(newIngredient : IngredientInfo)
    {
        print(newIngredient + " has been added to Soup")
        const newIngredientToAdd = new vec2(newIngredient.category, newIngredient.variantId)
        var newIngredientList: vec2[] = this.currentIngredients.currentOrPendingValue
        newIngredientList.push(newIngredientToAdd);
        this.currentIngredients.setPendingValue(newIngredientList)
        
    }


}