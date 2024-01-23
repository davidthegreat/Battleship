import { BOAT, TPOSITION, TPLAYER_TYPE } from "../types";

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
	PLAYER: "player",
	COMPUTER: "computer",
}