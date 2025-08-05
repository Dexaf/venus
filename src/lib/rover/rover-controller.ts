import { RoverControllerInterface, TouchInputDataInterface } from "../interfaces/rover-controller.interface";

export const CreateRoverController = (name: string): RoverControllerInterface => {
	return {
		keys: {
			holded: {
				inputs: {},
				reactions: new Map(),
			},
			pressed: {
				input: "",
				reactions: new Map(),
			},
			released: {
				input: "",
				reactions: new Map(),
			},
		},
		touch: {
			down: {
				inputs: [],
				reactions: new Map(),
			},
			up: {
				inputs: [],
				reactions: new Map(),
			},
			moving: {
				inputs: [],
				reactions: new Map(),
			},
		},
		wheel: {
			event: null,
			reactions: new Map(),
		},
		reactions: new Map(),
		isPaused: false,
		name: name,
	};
};
