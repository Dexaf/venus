import { Vector2 } from "three";
export const pointerEventClientCToVector2 = (event) => {
    return new Vector2(event.clientX, event.clientY);
};
