import { Vector2 } from "three";

export const pointerEventClientCToVector2 = (event: PointerEvent) => {
	return new Vector2(event.clientX, event.clientY);
};
