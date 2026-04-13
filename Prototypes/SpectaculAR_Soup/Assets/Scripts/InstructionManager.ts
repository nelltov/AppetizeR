@component
export class InstructionManager extends BaseScriptComponent {

    @input
    public instructionArray : string[]

    @input
    public instructionStringHolderObject : Text

    @input
    public saltShakerObject : SceneObject

    @input
    public gameRootObject : SceneObject

    private currentInstruction: number = 0

    public nextInstruction()
    {
        this.currentInstruction += 1

        if (this.currentInstruction >= this.instructionArray.length) {
            this.saltShakerObject.enabled = false
            this.gameRootObject.enabled = true
        } else {
            this.instructionStringHolderObject.text= this.instructionArray[this.currentInstruction]
        }
    }
}
