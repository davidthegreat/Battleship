import { BOARD_SIZE, LETTERS } from "../constants";

const generateItems = () => {
	let row = 0;
	return Array.from(new Array(BOARD_SIZE * BOARD_SIZE)).map((i, index) => {
		if (index % BOARD_SIZE === 0) {
			row++;
		}

		const col = (index % BOARD_SIZE + 1);

		return {
			box: index + 1,
			col,
			row,
			label: `${LETTERS[col - 1]}${row}`,
			over: false,
			filled: false,
			filledBy: null,
			done: false,
		};
	});
}

export default generateItems;