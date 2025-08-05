export interface RoverControllerInterface {
	keys: {
		holded: KeyInterfaceH<any>;
		pressed: KeyInterface<string>;
		released: KeyInterface<string>;
	};
	touch: {
		down: TouchInterface;
		up: TouchInterface;
		moving: TouchInterface;
	};
	wheel: WheelInputReactionInterface;
	/** those reactions are fired everytime the controller is updated*/
	reactions: Map<ReactionKey, Reaction>;
	isPaused: boolean;
	name: string;
}

export type ReactionKey = string;

export type Reaction = Function;

export type TouchReaction = Function;

export interface KeyInterfaceH<T> {
	inputs: T;
	reactions: Map<ReactionKey, Reaction>;
}

export interface KeyInterface<T> {
	input: T;
	reactions: Map<ReactionKey, Reaction>;
}

export interface TouchInterface {
	inputs: TouchInputDataInterface[];
	reactions: Map<ReactionKey, TouchReaction>;
}

export interface TouchInputDataInterface {
	event: PointerEvent | null;
}

export const PointerButtons = {
	LeftTouch: 1,
	RightTouch: 2,
	MiddleTouch: 4,
};

export interface WheelInputReactionInterface {
	event: WheelEvent | null;
	reactions: Map<ReactionKey, Reaction>;
}
