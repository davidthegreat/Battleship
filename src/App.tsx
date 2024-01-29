import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

import { randomNumber } from './utils';
import { TPOSITION, BOARD_ITEM, TPLAYER_TYPE } from './types';
import { BOARD_SIZE, BOATS, POSITION, PLAYER, SHOT_VALUE } from './constants';
import { createBoard, generateItems } from './methods';
import { Board } from './components';

let boatsForPlayer = structuredClone(BOATS.map(b => ({
  ...b,
  pending: false,
  done: false,
})));

function App() {
  const [boxesOver, setBoxesOver] = useState<number[]>([]);
  const [gameReady, setGameReady] = useState<boolean>(false);
  const [gameStarted] = useState<boolean>(false);

  const [boatToSet, setBoatToSet] = useState<any | null>(null);
  const [cursorPosition, setCursorPosition] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>(structuredClone(generateItems()));

  const [hideBoats, setHideBoats] = useState<boolean>(false);
  const [turn, setTurn] = useState<TPLAYER_TYPE | null>(null);

  const orientation = useRef<TPOSITION>(POSITION.HORIZONTAL);

  const playersAreReady = useMemo(() => {
    const boatsLeng = BOATS.map((boat) => boat.squares)
      .reduce((accumulator, current) => accumulator + current, 0);
    const computerIsReady = items.filter((item) => item.player[PLAYER.COMPUTER]?.filled).length === boatsLeng;
    const humanIsReady = items.filter((item) => item.player[PLAYER.HUMAN]?.filled).length === boatsLeng;

    return computerIsReady && humanIsReady;
  }, [items])

  const isConflict = useMemo(() => {
    return boatToSet && items.some((i: any) => {
      return i.player[PLAYER.HUMAN].filled && boxesOver.includes(i.box);
    });
  }, [boxesOver, items, boatToSet]);
  
  const setBoatPosition = useCallback(({ box, row, boat }: any) => {
    const horizontal = orientation.current === POSITION.HORIZONTAL;
    const vertical = orientation.current === POSITION.VERTICAL;

    let boxes = [box]
    const even = Boolean(boat % 2);
    const rest = Math.ceil(boat / 2);

    if (horizontal) {
      const boxLeft = even ? rest - 1 : rest;
      const boxRight = even ? rest - 1 : rest - 1;

      boxes = [
        ...Array.from(new Array(boxLeft)).map((_, k) => box - (k + 1)).reverse(),
        ...boxes,
        ...Array.from(new Array(boxRight)).map((_, k) => box + (k + 1))
      ];

      const outLeft = Math.max(0, (BOARD_SIZE * (row - 1)) - (boxes[0] + 1) + boxLeft);
      const outRight = Math.max(0, ((boxes[boxes.length - 1]) - (BOARD_SIZE * row)));

      // validates that the boat user is trying to place doesn't 
      // wrap around to the left of board
      if (outLeft > 0) {
        boxes = [
          ...Array.from(new Array(outLeft + boxRight)).map((_, k) => box + (k + 1)).reverse(),
          box,
          ...Array.from(new Array(outLeft + boxRight)).map((_, k) => box + (k + 1))
        ];
      }
      // validates that the boat user is trying to place doesn't 
      // wrap around to the right of board
      if (outRight > 0) {
        boxes = [
          ...Array.from(new Array(outRight + boxLeft)).map((_, k) => box - (k + 1)).reverse(),
          box,
          ...Array.from(new Array(boxRight - outRight)).map((_, k) => box + (k + 1)),
        ];
      }
    }

    if (vertical) {
      const boxTop = even ? rest - 1 : rest;
      const boxBottom = even ? rest - 1 : rest - 1;

      boxes = [
        ...Array.from(new Array(boxTop)).map((_, k) => {
          return box - ((k + 1) * BOARD_SIZE)
        }).reverse(),
        ...boxes,
        ...Array.from(new Array(boxBottom)).map((_, k) => {
          return box + ((k + 1) * BOARD_SIZE)
        })
      ];

      const outTop = boxes.filter(i => i <= 0).length;
      const outBottom = boxes.filter(i => i > 100).length;

      if (outTop > 0) {
        boxes = [
          ...Array.from(new Array(boxTop - outTop)).map((_, k) => {
            return box - ((k + 1) * BOARD_SIZE)
          }),
          box,
          ...Array.from(new Array(outTop + boxBottom)).map((_, k) => {
            return box + ((k + 1) * BOARD_SIZE)
          })
        ];
      } else if (outBottom > 0) {
        boxes = [
          ...Array.from(new Array(boxTop + outBottom)).map((_, k) => {
            return box - ((k + 1) * BOARD_SIZE)
          }).reverse(),
          box,
          ...Array.from(new Array(boxBottom - outBottom)).map((_, k) => {
            return box + ((k + 1) * BOARD_SIZE)
          })
        ];
      }
    }
    setBoxesOver(boxes);
    setItems((prevItems) => {
      return (prevItems.map((i, k) => {
        if (boxes.includes(i.box)) {
          i.over = true
        } else {
          i.over = false
        }

        return i
      }))
    });
    return boxes;
  }, [orientation])

  // auto position computer boats
  let mounted = false;
  useEffect(() => {
    if (mounted) return;
    setItems(structuredClone(generateItems()));

    mounted = true;

    const boats: any[] = [...BOATS];
    let _items = structuredClone(items);
    console.log(boats,"sss")
    while (boats.length) {
      const boat = (boats.pop());
      const box = randomNumber(1, BOARD_SIZE * BOARD_SIZE);
      const row = Math.ceil(box / BOARD_SIZE);
      orientation.current = [POSITION.VERTICAL, POSITION.HORIZONTAL][randomNumber(0, 1)];

      const boxes = setBoatPosition({ box, row, boat: boat?.squares });

      const conflict = _items.some((i: any) => {
        return i.player[PLAYER.COMPUTER].filled && boxes.includes(i.box);
      });
      if (conflict) {
        boats.push(boat);

        continue;
      }

      _items = _items.map((i: any) => {
        if (boxes.includes(i.box)) {
          return { 
            ...i, 
            player: {
              ...i.player,
              [PLAYER.COMPUTER]: {
                ...i.player[PLAYER.COMPUTER],
                filled: true,
              }
            },
          };
        }

        return i;
      })
    }
    setItems(_items)

  }, [gameStarted])

  const board = useMemo(() => {
    console.log(items,"itemssss333")
    return createBoard(items);
  }, [items])
  console.log(board,"boardddllll")
  const onClickStartGame = useCallback(() => {
    if (playersAreReady) {
      setGameReady(true);
    }
    setHideBoats((prev) => !prev)
  }, [playersAreReady])

  const onClickBoxToShotHandler = useCallback(({ box }: any) => {
    setItems((prevItems: BOARD_ITEM[]) => {
      return prevItems.map((item: BOARD_ITEM) => {
        const isComputerBoat = item.player[PLAYER.COMPUTER].filled;
        if (item.box === box) {
          item.player[PLAYER.HUMAN].shot = isComputerBoat
            ? SHOT_VALUE.TOUCH
            : SHOT_VALUE.WATER;
        }

        return item;
      })
    });
    setTurn(PLAYER.COMPUTER);
  }, [])



  const onMouseOverToSetBoatHandler = useCallback(({ box, row }: any) => {
    if (!boatToSet) return;

    setCursorPosition({ box, row, boat: boatToSet.boat.squares });
    setBoatPosition({ box, row, boat: boatToSet.boat.squares });
  }, [setCursorPosition, setBoatPosition, boatToSet]);

  const playerBoatsDone = useMemo(() => {
    const squares = BOATS.map(b => b.squares).reduce((a, b) => a + b, 0);
    return items.filter(i => i.player[PLAYER.HUMAN].filled).length === squares;
  }, [items]);

  const onClickToSetBoatHandler = useCallback(() => {
    if (playerBoatsDone) return;
    if (!boatToSet) return;

    setItems((prevItems: any) => {
      return prevItems.map((i: any) => {
        if (boxesOver.includes(i.box)) {
          return {
            ...i,
            player: {
              ...i.player,
              [PLAYER.HUMAN]: {
                ...i.player[PLAYER.HUMAN],
                filled: true,
              }
            },
          };
        }

        return i;
      })
    });

    setCursorPosition(null);
    boatsForPlayer[boatToSet.key].pending = false;
    boatsForPlayer[boatToSet.key].done = true;
    setBoatToSet(null);
    setBoxesOver([]);
    setItems((prevItems) => {
      return (prevItems.map((i, k) => {
        i.over = false;

        return i
      }))
    });
  }, [boxesOver, boatToSet, playerBoatsDone]);



  const onClickBoatHandler = useCallback((boat: any, key: number) => {
    setBoatToSet({ boat, key });

    boatsForPlayer = boatsForPlayer.map((b: any) => ({
      ...b,
      pending: false,
    }))
    boatsForPlayer[key].pending = true;
  }, []);


// computer and player score 
const totalPosibleScores = BOATS.map((boat) => boat.squares).reduce((a, b) => a + b, 0);

const humanScores = useMemo(() => {
  return items.filter((item) => {
    return item.player[PLAYER.HUMAN].shot === SHOT_VALUE.TOUCH;
  }).length;
}, [items]);

const computerScores = useMemo(() => {
  return items.filter((item) => {
    return item.player[PLAYER.COMPUTER].shot === SHOT_VALUE.TOUCH;
  }).length;
}, [items]);

const computerWins = useMemo(() => {
  return computerScores === totalPosibleScores;
}, [computerScores])

const humanWins = useMemo(() => {
  return humanScores === totalPosibleScores;
}, [humanScores])



  //
  const computerTurnAction = useCallback(async () => {
    await new Promise((resolve) => setTimeout(() => resolve(null), 1000));

    const allowedBoxes = items.filter((item) => !item.player[PLAYER.COMPUTER].shot);
    const box = randomNumber(0, allowedBoxes.length);
    const alreadyDone = items.find((item, itemIndex) => (
      itemIndex === box && item.player[PLAYER.COMPUTER].shot
    ));

    if (alreadyDone) {
      computerTurnAction();
      return;
    }

    setItems((prevItems: BOARD_ITEM[]) => {
      return prevItems.map((item: BOARD_ITEM) => {
        const isHumanBoat = item.player[PLAYER.HUMAN].filled;
        if (item.box === box) {
          item.player[PLAYER.COMPUTER].shot = isHumanBoat
            ? SHOT_VALUE.TOUCH
            : SHOT_VALUE.WATER;
        }

        return item;
      });
    });

    setTurn(PLAYER.HUMAN);
  }, [items]);

  useEffect(() => {
    if (turn === PLAYER.COMPUTER) {
      computerTurnAction();
    }
  }, [turn, computerTurnAction]);

  const resetGame = () => {
    window.location.reload();
  };

  const onClickBoxOnHumanBoard = ({ box }: BOARD_BOX) => {
    if (gameReady) {
      onClickBoxToShotHandler({ box });
    } else {
      onClickToSetBoatHandler();
    }
  }


  if (computerWins) {
    return <div className='flex'>
      <div className='absolute z-10 inset-0 w-full h-full bg-white text-red-600 flex items-center justify-center flex-col'>
        <div className='text-8xl'>
          You lost!!
        </div>
        <button
          onClick={resetGame}
          className='py-2 px-4 bg-blue-800 text-white hover:bg-blue-950 mt-12 rounded-full'
        >
          reset game
        </button>
      </div>
    </div>
  }

  if (humanWins) {
    return <div className='flex'>
      <div className='absolute z-10 inset-0 w-full h-full bg-white text-green-600 flex items-center justify-center flex-col'>
        <div className='text-8xl'>
          You win!!!
        </div>
        <button
          onClick={resetGame}
          className='py-2 px-4 bg-blue-800 text-white hover:bg-blue-950 mt-12 rounded-full'
        >
          reset game
        </button>
      </div>
    </div>
  }

  return (
    <>
      <div className='flex'>
        <div className='flex flex-col w-full justify-center items-center'>
          {turn === PLAYER.COMPUTER && <div className='absolute inset-0 w-full h-full bg-white bg-opacity-80 flex items-center justify-center'>
            Computer is thinking
          </div>}
          <Board
                  board={board}
                  isConflict={isConflict}
                  onMouseOver={onMouseOverToSetBoatHandler}
                  onClick={onClickBoxOnHumanBoard}
                  boatToSet={boatToSet}
                  hideBoats={hideBoats}
                />
        </div>

      {!gameReady && <div className='w-full bg-slate-50 p-4'>
          <h2>Boats</h2>
          <div className='w-auto'>
            {boatsForPlayer?.map((boat: any, boatKey: number) =>
              <div className='relative border hover:border-2' key={boatKey} onClick={() => onClickBoatHandler(boat, boatKey)}>
                <div className='w-full h-full absolute flex items-center justify-center pointer-events-none'>{boat.label}</div>
                <div className='flex items-center justify-center pointer-events-none'>
                  {Array.from(new Array(boat.squares)).map((_, squareKey: number) => {
                    return <div className={[
                      'w-[50px] h-[50px] border',
                      boat.pending ? 'bg-orange-200' : 'bg-blue-600',
                      boat.done ? 'bg-green-200' : 'bg-blue-600',
                    ].join(" ")} key={squareKey}></div>
                  })}
                </div>
              </div>)}
          </div>

          <div className='mt-12'>
              <button
                className={[
                  "text-2xl py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-800 hover:cursor-pointer",
                  !playerBoatsDone ? "cursor-not-allowed disabled:bg-gray-400" : ''
                ].join(" ")}
                disabled={!playersAreReady}
                onClick={onClickStartGame}
              >start</button>
            </div>
          </div>}     
          </div>
    </>
  )
}

export default App
