type BOARD_ITEM = {
	box: number;
	col: number;
	row: number;
	label: string;
	over: boolean;
	player: { [key: string]: any | null };
};

export default BOARD_ITEM;