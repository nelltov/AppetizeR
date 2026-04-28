/**
 * Specs Inc. 2026
 * ImageScrollList – programmatic vertical scroll list driven by a texture array.
 * Drop on any SceneObject, assign textures, a scrollable list builds itself at runtime.
 * No prefabs, no scene setup, no extra assignments.
 */
import { ScrollWindow } from "SpectaclesUIKit.lspkg/Scripts/Components/ScrollWindow/ScrollWindow";
import { GridLayout, LayoutDirection } from "SpectaclesUIKit.lspkg/Scripts/Components/GridLayout/GridLayout";
import { RectangleButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RectangleButton";
import { IMAGE_MATERIAL_ASSET } from "SpectaclesUIKit.lspkg/Scripts/Components/Element";

// ── Layout constants (world units / cm) ──────────────────────────────────────
const ITEM_W = 20;  // width of each row
const ITEM_H = 8;   // height of each row
const WIN_H  = 24;  // visible viewport height (shows 3 items at once)

@component
export class ImageScrollListReference extends BaseScriptComponent {

    @input
    textures: Texture[] = [];

    // Runtime objects
    private scrollComp: ScrollWindow;
    private gridObj: SceneObject;
    private gridComp: GridLayout;

    onAwake(): void {
        this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
    }

    onStart(): void {
        if (!this.textures || this.textures.length === 0) {
            print("ImageScrollList: no textures assigned – nothing to build.");
            return;
        }
        this.buildScrollWindow();
    }

    // ── Build hierarchy ───────────────────────────────────────────────────────

    private buildScrollWindow(): void {
        // ScrollWindow – the masked, scrollable viewport
        const scrollObj = global.scene.createSceneObject("Scroll");
        scrollObj.setParent(this.sceneObject);

        this.scrollComp = scrollObj.createComponent(ScrollWindow.getTypeName()) as ScrollWindow;
        this.scrollComp.vertical   = true;
        this.scrollComp.horizontal = false;
        this.scrollComp.windowSize = new vec2(ITEM_W, WIN_H);
        // Placeholder; the real value is written after items are created
        this.scrollComp.scrollDimensions = new vec2(ITEM_W, WIN_H + 1);

        // GridLayout container – created now so ScrollWindow.initialize() moves
        // it into its internal Scroller object for us automatically
        this.gridObj = global.scene.createSceneObject("Grid");
        this.gridObj.setParent(scrollObj);

        this.gridComp = this.gridObj.createComponent(GridLayout.getTypeName()) as GridLayout;
        this.gridComp.columns  = 1;
        this.gridComp.rows     = this.textures.length;
        this.gridComp.cellSize = new vec2(ITEM_W, ITEM_H);
        this.gridComp.layoutBy = LayoutDirection.Row;

        // onInitialized is a ReplayEvent: fires immediately if already init'd,
        // otherwise fires when ScrollWindow's OnStartEvent runs next frame
        this.scrollComp.onInitialized.add(() => this.buildItems());
    }

    private buildItems(): void {
        const count = this.textures.length;

        for (let i = 0; i < count; i++) {
            this.createItem(i);
        }

        // Sync rows to actual item count (may differ from constructor default)
        this.gridComp.rows = count;

        // Defer one tick so every child is registered before layout runs
        const ev = this.createEvent("DelayedCallbackEvent");
        ev.bind(() => {
            this.gridComp.layout();
            this.setScrollDimensions(count);
        });
        ev.reset(0);
    }

    private createItem(index: number): void {
        const itemObj = global.scene.createSceneObject("Item_" + index);
        itemObj.setParent(this.gridObj);

        // RectangleButton provides hover + trigger interaction out of the box
        const btn = itemObj.createComponent(RectangleButton.getTypeName()) as RectangleButton;
        btn.size = new vec3(ITEM_W, ITEM_H, 1);
        btn.initialize();

        btn.onTriggerUp.add(() => {
            print("ImageScrollList: tapped item " + index);
            this.onItemTapped(index);
        });

        // Texture thumbnail sitting just in front of the button face
        const tex = this.textures[index];
        if (tex) {
            const thumbObj = global.scene.createSceneObject("Thumb");
            thumbObj.setParent(itemObj);
            thumbObj.getTransform().setLocalPosition(new vec3(0, 0, 0.15));
            thumbObj.getTransform().setLocalScale(new vec3(ITEM_W * 0.92, ITEM_H * 0.88, 1));

            const img = thumbObj.createComponent("Image") as Image;
            img.mainMaterial     = IMAGE_MATERIAL_ASSET.clone();
            img.mainPass.baseTex = tex;
            img.stretchMode      = StretchMode.Fit;
        }
    }

    private setScrollDimensions(count: number): void {
        const totalH = count * ITEM_H;
        // scrollDimensions.y must be strictly > windowSize.y to enable scrolling
        const scrollH = Math.max(WIN_H + 0.02, totalH);
        this.scrollComp.scrollDimensions = new vec2(ITEM_W, scrollH);
        // Start at the top of the list
        if (totalH > WIN_H) {
            this.scrollComp.scrollPositionNormalized = new vec2(0, 1);
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Override to respond to item taps.
     * @param index zero-based item index
     */
    protected onItemTapped(_index: number): void {
        // Override in a derived class or use setItemCallback()
    }

    /**
     * Wire a callback for a specific item after build (0-based index).
     */
    public setItemCallback(index: number, callback: () => void): void {
        if (!this.gridObj || index < 0 || index >= this.textures.length) return;
        const itemObj = this.gridObj.getChild(index);
        if (!itemObj) return;
        const btn = itemObj.getComponent(RectangleButton.getTypeName()) as RectangleButton;
        if (btn) btn.onTriggerUp.add(callback);
    }
}