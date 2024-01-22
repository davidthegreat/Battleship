import { useCallback, useEffect, useMemo, useState } from 'react';



function GameView() {



    // const onClickBoardBox = (item: BoardBoxItem) => {
	// 	if (gameReady) {
	// 		onClickBoxToShotHandler(item);
	// 	} else {
	// 		onClickToSetBoatHandler();
	// 	}
	// };

	return (
		<>
			{/* {shotResult && <ShotFeedback type={shotResult.type} content={shotResult.content} />} */}

			<div>
				<div className="flex">
					<div className="flex flex-col">
						<h2 className="text-4xl py-2">Your board</h2>
						{/* <PlayerBoardView
							onClick={onClickBoardBox}
							onMouseOver={onMouseOverBoard}
							onMouseLeave={onMouseLeaveBoard}
							counter={counter}
							board={board}
							gameReady={gameReady}
							turn={turn}
							disableClick={isConflict && !!boatToSet}
							boatsInGame={boatsInGame}
						/> */}
					</div>

				
				</div>



			
			</div>
		</>
	);
}

export default GameView;