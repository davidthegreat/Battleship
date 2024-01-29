import { BOARD_SIZE } from "@/constants";

import { generateItems } from ".";

describe("[Method]: generateItems", () => {
	test(`generate ${BOARD_SIZE * BOARD_SIZE} items`, () => {
		expect(generateItems()).toHaveLength(100);
	});
});