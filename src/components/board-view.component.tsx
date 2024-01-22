import { useState } from "react";

import { HumanBoard } from "@/components";
import { PLAYER } from "@/constants";
import { BoardBoxItem, BoardRow, BoatsInGame, Player } from "@/types";

type Props = {
	onMouseLeave: () => void;
	onMouseOver: (item: BoardBoxItem) => void;
	onClick: (item: BoardBoxItem) => void;
	board: BoardRow[];
	counter: {
		value: number;
		label: string;
	};
	turn: Player | null;
	disableClick: boolean;
	gameReady: boolean;
	boatsInGame: BoatsInGame;
}

const PlayerBoardView = ({
	onClick,
	onMouseLeave,
	onMouseOver,
	board,
	gameReady,
	counter,
	turn,
	disableClick,
	boatsInGame,
}: Props) => {
	const [hideBoats, setHideBoats] = useState<boolean>(false);

	return (
		<div>
			<div
				data-testid="player-board-view"
				className="flex flex-col w-full justify-center items-center relative"
				onMouseLeave={onMouseLeave}
			>
				{/* {counter.label && (
					<div className="absolute inset-0 w-full h-full bg-white bg-opacity-80 flex items-center justify-center">
						<div className="text-8xl">{counter.label}</div>
					</div>
				)} */}
				{/* {turn === PLAYER.COMPUTER && (
					<div className="absolute inset-0 w-full h-full bg-white bg-opacity-80 flex items-center justify-center">
						Computer is thinking
					</div>
				)} */}

				{/* <HumanBoard
					board={board}
					disableClick={disableClick}
					onMouseOver={onMouseOver}
					onClick={onClick}
					hideBoats={hideBoats}
					boatsInGame={boatsInGame}
				/> */}
			</div>
			{/* {gameReady && !counter.label && (
				<div>
					<div className="w-full flex items-start">
						<button
							onClick={() => setHideBoats((prev) => !prev)}
							className="p-2 bg-blue-800 text-white hover:bg-blue-950"
						>
							{!hideBoats && <div>hide boats</div>}
							{hideBoats && <div>show boats</div>}
						</button>
					</div>
					<div className="w-full">
						{turn === PLAYER.HUMAN && (
							<span className="text-green-600">your turn</span>
						)}
						{turn === PLAYER.COMPUTER && (
							<span className="text-red-600">
								wait!, the computer is thinking
							</span>
						)}
					</div>
				</div>
			)} */}
		</div>
	);
};

export default PlayerBoardView;