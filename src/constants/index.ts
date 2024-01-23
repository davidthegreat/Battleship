import { BOAT, TPOSITION, TPLAYER_TYPE, TSHOT_VALUE } from "../types";

export const BOARD_SIZE = 10;
export const LETTERS = "ABCDEFGHIJ";

export const BOATS: BOAT[] = [{
	label: "Aircraft",
	squares: 5,
  }, {
	label: "Battleship",
	squares: 4,
  }, {
	label: "Destroyer",
	squares: 3,
  }, {
	label: "Submarine",
	squares: 3,
  }];

export const POSITION: { [key: string]: TPOSITION } = {
	"VERTICAL": "vertical",
	"HORIZONTAL": "horizontal",
}

export const PLAYER: { [key: string]: TPLAYER_TYPE } = {
	HUMAN: "human",
	COMPUTER: "computer",
}


export const SHOT_VALUE: { [key: string]: TSHOT_VALUE } = {
	TOUCH: "touch",
	WATER: "water",
}