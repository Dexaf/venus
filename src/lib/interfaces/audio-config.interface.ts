import { PositionalConfigInterface } from "./positional-config.interface";

export interface AudioConfigInterface {
	path: string;
	volume?: number;
	loop?: boolean;
	key?: string;
	playOnLoad?: boolean;
	positionalConfig?: PositionalConfigInterface;
}
