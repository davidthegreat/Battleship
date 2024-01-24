import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import './App.css'
import { randomNumber } from './utils';


import { TPOSITION, BOARD_ITEM } from './types';
import { BOARD_SIZE, BOATS, POSITION, PLAYER, SHOT_VALUE } from './constants';
import { createBoard, generateItems } from './methods';

type BOAT_STATUS = {
  uuid?: string;
  name: string;
  damage: {
    box: string;
    col: number;
    row: number;
  }[];
}

type PLAYER_DATA = {
  name: string;
  boats: { [key: string]: BOAT_STATUS };
}


let boatsForPlayer = structuredClone(BOATS.map(b => ({
  ...b,
  pending: false,
  done: false,
})));

function App() {
  const [computerData, setComputerData] = useState<TPLAYER_DATA>();
  const [playerData, setPlayerData] = useState<TPLAYER_DATA>();
  const [boxesOver, setBoxesOver] = useState<number[]>([]);
  // const [isConflict, setIsConflict] = useState<boolean>(false);
  const [gameReady, setGameReady] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const [boatToSet, setBoatToSet] = useState<any | null>(null);
  const [cursorPosition, setCursorPosition] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>(structuredClone(generateItems()));


  const [hideBoats, setHideBoats] = useState<boolean>(false);

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
  const orientation = useRef<TPOSITION>(POSITION.HORIZONTAL);

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

  const switchOrientation = () => {
    orientation.current = orientation.current === POSITION.HORIZONTAL
      ? POSITION.VERTICAL
      : POSITION.HORIZONTAL;
  }

  const onKeydownHandler = useCallback(async ($event: any) => {
    if ($event.code === "Space") {
      switchOrientation();

      if (cursorPosition) {
        setBoatPosition(cursorPosition);
      }
    }
  }, [cursorPosition, setBoatPosition]);

  useEffect(() => {
    document.addEventListener("keydown", onKeydownHandler);

    return () => {
      document.removeEventListener("keydown", onKeydownHandler);
    }
  }, [onKeydownHandler])

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
    return createBoard(items);
  }, [items])

  const onClickStartGame = useCallback(() => {
    if (playersAreReady) {
      setGameReady(true);
    }
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
  }, [])

  // const update = () => {
  //   setItems((prevItems) => {
  //     prevItems[35].done = true;

  //     return structuredClone(prevItems);
  //   })
  // }

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

  return (
    <>
      <pre>{JSON.stringify(isConflict)}</pre>
      <pre>{JSON.stringify(boxesOver)}</pre>
      <pre>{JSON.stringify(gameReady)} gameReady</pre>
      {/* <button onClick={update}>HIT</button> */}

      <div className='flex'>
        <div className='flex flex-col w-full justify-center items-center'>
          {board.map((r, rowKey) => {
            return <div key={rowKey} className='flex'>
              {r.map((c: any) => <div
                className='flex'
                key={c.label}
                data-position={
                  `{ "col": ${c.col}, "row": ${c.row}, "box": ${c.box} }`
                }
                onMouseOver={() => onMouseOverToSetBoatHandler(c)}
                onClick={() => gameReady
                  ? onClickBoxToShotHandler({ box: c.box })
                  : onClickToSetBoatHandler()
                }
              >
                <div
                  className={[
                    "w-[50px] h-[50px] flex items-center justify-center text-xs border border-solid hover:border-2 hover:cursor-pointer hover:border-slate-600 flex-col",
                    c.over && !isConflict && boatToSet ? 'bg-slate-200' : '',
                    c.over && isConflict && boatToSet ? 'bg-red-200 relative' : '',
                    c.player[PLAYER.HUMAN].filled ? 'bg-blue-500' : '',
                    c.filled && c.filledBy === PLAYER.PLAYER ? 'bg-blue-500' : '',
                    c.player[PLAYER.HUMAN].shot === SHOT_VALUE.TOUCH ? 'border-red-400 border-2' : '',
                    c.player[PLAYER.HUMAN].shot === SHOT_VALUE.WATER ? 'border-blue-400 border-2' : '',
                    !hideBoats && c.player[PLAYER.HUMAN].filled ? 'bg-blue-500' : '',
                    hideBoats && c.player[PLAYER.HUMAN].filled ? 'bg-blue-50' : '',
                  ].join(' ')}
                ><div></div><div className='text-xs'></div></div>
              </div>)}
            </div>
          })}
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
          {gameReady && <div className='w-full p-4'>
            <h2>Scores</h2>

            <div className='w-auto space-y-4'>
              ...
            </div>
          </div>}      
          </div>
    </>
  )
}

export default App
