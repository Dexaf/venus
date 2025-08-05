import { Vector2 } from "three";

export const magnitude2D = (vector: Vector2) => {
	return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
};
