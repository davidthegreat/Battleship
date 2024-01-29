import { PLAYER, SHOT_VALUE } from "../constants";
import { BOARD_ITEM, BOARD_ROW } from "../types";

type Props = {
	board: BOARD_ROW[];
	isConflict: boolean;
	boatToSet: boolean;
	hideBoats: boolean;
	onMouseOver: (item: BOARD_ITEM) => void;
	onClick: (item: BOARD_ITEM) => void;
};

const Board = ({
	board,
	isConflict,
	onMouseOver,
	onClick,
	boatToSet,
	hideBoats,
}: Props) => {
	return <>
		{board.map((row, rowKey) => {
			return <div key={rowKey} className='flex'>
				{row.map((item: BOARD_ITEM) =>
					<div
						key={item.label}
						onMouseOver={() => onMouseOver(item)}
						onClick={() => onClick(item)}
						className={[
							"w-[50px] h-[50px] flex items-center justify-center text-xs border border-solid hover:border-2 hover:cursor-pointer hover:border-slate-600 flex-col",
							item.player[PLAYER.HUMAN].shot === SHOT_VALUE.TOUCH ? 'border-red-400 border-2 cursor-not-allowed' : '',
							item.player[PLAYER.HUMAN].shot === SHOT_VALUE.WATER ? 'border-blue-400 border-2' : '',
							item.player[PLAYER.COMPUTER].shot === SHOT_VALUE.TOUCH ? 'bg-red-400' : '',
							item.over && !isConflict && boatToSet ? 'bg-slate-200' : '',
							item.over && isConflict && boatToSet ? 'bg-red-200 !cursor-not-allowed' : '',
							!hideBoats && item.player[PLAYER.HUMAN].filled ? 'bg-blue-500' : '',
							hideBoats && item.player[PLAYER.HUMAN].filled ? 'bg-blue-50' : '',
						].join(' ')}
					></div>
				)}
			</div>
		})}
	</>
}

export default Board;