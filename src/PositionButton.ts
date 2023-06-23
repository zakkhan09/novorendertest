import { Camera } from "@novorender/webgl-api";
import { quat, vec3 } from "gl-matrix";

export default class PositionButton {
    positionX:number;
    positionY:number;
    positionZ:number;
    rotation:quat;
    camera: Camera;
    constructor(camera:Camera){
        this.positionX = 0
        this.positionY = 0
        this.positionZ = 0
        this.rotation = [0,0,0,0]
        this.camera = camera
    }

    generateButton(){
        const buttonContainer = document.getElementsByClassName('button-container')        
        var button = document.createElement('button')
        button.innerText = 'Slot';
        buttonContainer[0].appendChild(button)
        button.onmousedown = (e) => {
        if (e.shiftKey == true && e.button == 0) { //Left mouse button on Mac
               const positions = this.camera.position;
               const rotation:any = [...this.camera.rotation];
               this.rotation = rotation;
               this.positionX = positions[0]
               this.positionY = positions[1]
               this.positionZ = positions[2]
            }else if(e.button == 0){
                const movePosition:vec3 =[ this.positionX, this.positionY, this.positionZ]
                this.camera.controller.moveTo(movePosition,this.rotation);
            }
        };
    }
}