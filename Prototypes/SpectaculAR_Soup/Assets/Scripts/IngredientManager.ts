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

    private currentIngredients: StorageProperty<StorageTypes.vec2Array>
    
    onAwake()
    {
        
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart()
    {
        EventManager.SoupPotIngredientCollisionEvent.add((ingredientInfo: IngredientInfo) => 
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
        const newIngredientToAdd = new vec2(newIngredient.category, newIngredient.variantId)
        var newIngredientList: vec2[] = this.currentIngredients.currentValue
        newIngredientList.push(newIngredientToAdd);
        this.currentIngredients.setPendingValue(newIngredientList)
        
    }


}