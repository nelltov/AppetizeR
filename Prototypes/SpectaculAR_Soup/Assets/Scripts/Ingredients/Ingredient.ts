import { getEnumMember, getEnumMemberName, IngredientCategory } from "./IngredientTypes";

export class IngredientInfo {
    category: IngredientCategory
    variantId: number
    variantName: string

    // Used to initialize an instance of this class by passing in the category and variant numbers
    constructor(category: IngredientCategory, variantId: number) {
        this.category = category
        this.variantId = variantId
        this.variantName = getEnumMemberName(category, variantId) ?? "Unknown Ingredient"
    }
}

@component
export class Ingredient extends BaseScriptComponent {
    @input
    public categoryNumber: number = 0

    @input
    public variantId: number = 0

    

    private ingredientInfo: IngredientInfo | null = null

    // Returns the ingredientInfo object (initializing it if not yet created)
    public getIngredientInfo(): IngredientInfo {
        if (!this.ingredientInfo) {
            this.ingredientInfo = new IngredientInfo(this.categoryNumber as IngredientCategory, this.variantId)
        }
        return this.ingredientInfo
    }

    public isSameIngredient(other: Ingredient): boolean {
        return this.categoryNumber === other.categoryNumber && this.variantId === other.variantId
    }

    protected getVariantName(): string {
        return getEnumMemberName(this.categoryNumber, this.variantId) ?? "Unknown Ingredient"
    }

    

}

/*/*import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty";
import { InteractableManipulation } from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation";

@component
export class GamePositionSetter extends BaseScriptComponent
{
    @input
    menuObject: SceneObject;

    private interactableComponent: InteractableManipulation | null = null;

    private syncEntity: SyncEntity | null = null;
    private MenuSyncEntity: SyncEntity | null = null;
    private isLockedProp: StorageProperty<any> | null = null;

    onAwake()
    {
        // Programmatic SyncEntity (matches the AirHockey sample pattern)
        this.syncEntity = new SyncEntity(this);

        // Cache interactable on this object (ok if null)
        this.interactableComponent = this.getSceneObject().getComponent(
            InteractableManipulation.getTypeName()
        ) as InteractableManipulation;

        print(this.interactableComponent.name);

        this.syncEntity.notifyOnReady(() =>
        {
            // 1) Create + register synced state
            this.isLockedProp = StorageProperty.manualBool("isLocked", false);
            this.syncEntity!.addStorageProperty(this.isLockedProp);

            // 2) Subscribe to changes (THIS is what syncs behavior across players)
            this.isLockedProp.onAnyChange.add((newVal: boolean) =>
            {
                if (newVal)
                {
                    this.applyLockedState();
                }
            });

            // 3) Apply initial state for late-joiners
            if (this.isLockedProp.currentValue === true)
            {
                this.applyLockedState();
            }
        });
    }

    // Call this when YOU want to lock it for everyone (button press / release event / etc.)
    public lockForEveryone()
    {
        print("locked for all");
        if (!this.syncEntity || !this.isLockedProp) return;

        const doLock = () =>
        {
            this.isLockedProp!.setPendingValue(true);
            this.applyLockedState(); // do it immediately locally too
        };

        // Ownership check (multiplayer authority)
        if (!this.syncEntity.canIModifyStore())
        {
            this.syncEntity.requestOwnership(
                () => doLock(),
                (err: string) => print("[GamePositionSetter] Ownership request failed: " + err)
            );
            return;
        }

        doLock();
    }

    // This runs locally on EVERY player when isLocked becomes true
    private applyLockedState()
    {
        if (this.interactableComponent)
        {
            this.interactableComponent.setCanTranslate(false);
            this.interactableComponent.setCanRotate(false);
            this.interactableComponent.setCanScale(false);
        }

        if (this.menuObject)
        {
            this.menuObject.enabled = false;
        }

        print("[GamePositionSetter] Locked: interactable/menu disabled locally.");
    }
}
*/
