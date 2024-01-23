import { BOARD_SIZE } from "../constants";

const createBoard = (items: any[]) => {
	let row: any[] = [];
	return items.reduce((a: any[], b: any) => {
		if ((b.col % BOARD_SIZE) === 0) {
			row.push(b);
			a.push(row);
			row = [];
		} else {
			row.push(b);
		}

		return a;
	}, [])
}

export default createBoard;