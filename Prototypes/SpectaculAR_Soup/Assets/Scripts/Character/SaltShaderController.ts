import { EventManager } from "Scripts/EventManager"

@component
export class SaltShaderController extends BaseScriptComponent {
    @input
    saltObject: SceneObject
    private saltShader: Pass

    @input 
    faceObject: SceneObject
    private faceShader: Pass

    @input
    saltVFX: SceneObject

    @input
    startsTalking: boolean = false

    private saltAmount: number
    private pourThreshold: number
    private pourSpeed: number
    private wh: vec2

    private tilt: number
    private pour: boolean

    public cooldownHeart: number = 1
    private startHeartTime: number = 0
    private currentHeartDuration: number = 0

    onAwake() {
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })

        let updateEvent = this.createEvent("UpdateEvent")
        updateEvent.bind(() => { this.onUpdate() })
    }

    onStart() {
        // Assign materials and shaders
        const saltShaderMaterial = this.saltObject.getComponent("Component.RenderMeshVisual").getMaterial(0)
        this.saltShader = saltShaderMaterial.mainPass

        const faceShaderMaterial = this.faceObject.getComponent("Component.RenderMeshVisual").getMaterial(0)
        this.faceShader = faceShaderMaterial.mainPass

        // Starting params
        this.saltAmount = 0.8
        this.pourThreshold = -0.1
        this.pourSpeed = 0.1
        this.wh = new vec2(3, 5.25)
        this.tilt = 1.0
        this.pour = false

        // Shader params
        this.saltShader.surfacelevel = this.calculateSurfaceLevel(this.wh, this.tilt, this.saltAmount)

        // Saltie talking
        this.faceShader.talk = this.startsTalking

        EventManager.StartSaltieDialogue.add(() => {
            print("Saltie start talking (confirmed position)")
            this.faceShader.talk = true
        })

        EventManager.PlayerReadyEvent.add(() => {
            print("Saltie stop talking (player ready)")
            this.faceShader.talk = false
        })

        EventManager.CenterPositionSetLocal.add((_) => {
            print("Saltie stop talking (obj spawn)")
            this.faceShader.talk = false
        })

        EventManager.PlayerVictoryNetworkEvent.add((_) => {
            print("Saltie start talking (victory)")
            this.faceShader.talk = true
        })

        // Heart eyes only when you add something to the pot
        EventManager.SoupPotIngredientCollisionLocalEvent.add(() => {
           this.startHeartTime = getTime();
           this.cooldownHeart = Math.random() + 1.0;
        })

        // Reset saltie amount
        EventManager.ResetGameNetworkEvent.add(() => {
            this.saltAmount = 0.8
            this.saltShader.surfacelevel = this.calculateSurfaceLevel(this.wh, this.tilt, this.saltAmount)
            this.faceShader.talk = false
        })
    }

    onUpdate() {
        let transform = this.sceneObject.getTransform()
        this.currentHeartDuration = getTime();

        // tilting status
        this.tilt = transform.up.dot(new vec3(0, 1, 0))
        this.pour = this.tilt < this.pourThreshold

        // set face
        this.faceShader.ahh = this.pour

        if (this.pour) {
            this.saltAmount = Math.max(this.saltAmount - this.pourSpeed * 0.01, 0.01)
        } 

        // Heart eyes
        this.faceShader.love = this.startHeartTime + this.cooldownHeart >= this.currentHeartDuration

        // Pour VFX
        if (this.saltVFX) this.saltVFX.enabled = this.pour && this.saltAmount > 0.03

        // Set salt surface
        if (this.saltAmount > 0.01) {
            this.saltShader.surfacelevel = this.calculateSurfaceLevel(this.wh, this.tilt, this.saltAmount)
        }
    }

    private calculateSurfaceLevel(wh: vec2, tilt: number, saltAmount: number): number {
        const scale = MathUtils.lerp(wh.x, wh.y, Math.abs(tilt))
        const amount = MathUtils.remap(saltAmount, 0, 1, -1, 1)
        return scale * amount
    }
}
