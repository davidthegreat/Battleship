import { LETTERS } from "@/constants";
import items from "@/mocks/items.json";
import { BOARD_ITEM, BOARD_ROW } from "@/types";

import { createBoard } from ".";

describe("[Method]: createBoard", () => {
	let board: BOARD_ROW[];
	beforeAll(() => {
		board = createBoard(items);
	});
	describe("`board` should be a matrix of 10x10", () => {
		test("10 rows", async () => {
			expect(board).toHaveLength(10);
		});

		test("and each row 10 columns", async () => {
			board.forEach((row: BOARD_ROW) => {
				expect(row).toHaveLength(10);
			});
		});

		test("each element should have the proper label", async () => {
			board.forEach((row: BOARD_ROW, rowKey: number) => {
				row.forEach((element: BOARD_ITEM, elementKey) => {
					expect(element.label).toBe(`${LETTERS[elementKey]}${rowKey + 1}`);
				});
			});
		});
	});
});
