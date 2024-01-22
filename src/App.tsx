import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import './App.css'
import { randomNumber } from './utils';

const BOATS = [{
  label: "Aircraft",
  squares: 5,
}, {
  label: "Battleship",
  squares: 4,
}, {
  label: "Destroyer",
  squares: 3,
}, {
  label: "Submarine",
  squares: 3,
}];

const BOARD_SIZE = 10;
const LETTERS = "ABCDEFGHIJ";

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
      done: false,
      over: false,
      filled: false,
    };
  });
}
console.log(generateItems(),"generateItems")

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

type TORIENTATION = "vertical" | "horizontal";
const ORIENTATION: { [key: string]: TORIENTATION } = {
  "VERTICAL": "vertical",
  "HORIZONTAL": "horizontal",
}

console.log(ORIENTATION,"ORIENTATION")
function App() {

  const [computerData, setComputerData] = useState<PLAYER_DATA>();
  const [playerData, setPlayerData] = useState<PLAYER_DATA>();
  const [boxesOver, setBoxesOver] = useState<number[]>([]);

  const [cursorPosition, setCursorPosition] = useState<any>({
    box: 1,
    row: 1,
    boat: BOATS[0].squares
  });
  const [items, setItems] = useState<any[]>(generateItems());
  
  const isConflict = useMemo(() => {
    return items.some((i: any) => i.filled && boxesOver.includes(i.box));
  }, [boxesOver, items]);
  const orientation = useRef<TORIENTATION>(ORIENTATION.HORIZONTAL);

  const setBoatPosition = useCallback(({ box, row, boat }: any) => {
    const horizontal = orientation.current === ORIENTATION.HORIZONTAL;
    const vertical = orientation.current === ORIENTATION.VERTICAL;

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
    orientation.current = orientation.current === ORIENTATION.HORIZONTAL
      ? ORIENTATION.VERTICAL
      : ORIENTATION.HORIZONTAL;
  }

  const onKeydownHandler = useCallback(async ($event: any) => {
    if ($event.code === "Space") {
      switchOrientation();

      setBoatPosition(cursorPosition);
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

    mounted = true;

    const boats: any[] = [...BOATS];
    let _items = structuredClone(items);
    console.log(boats,"sss")
    while (boats.length) {
      const boat = (boats.pop());
      const box = randomNumber(1, BOARD_SIZE * BOARD_SIZE);
      const row = Math.ceil(box / BOARD_SIZE);
      orientation.current = [ORIENTATION.VERTICAL, ORIENTATION.HORIZONTAL][randomNumber(0, 1)];

      const boxes = setBoatPosition({ box, row, boat: boat?.squares });

      const conflict = _items.some((i: any) => i.filled && boxes.includes(i.box));
      if (conflict) {
        boats.push(boat);

        continue;
      }

      _items = _items.map((i: any) => {
        if (boxes.includes(i.box)) {
          return { ...i, filled: true };
        }

        return i;
      })
    }
    setItems(_items)

  }, [])

  const board = useMemo(() => {
    return createBoard(items);
  }, [items])

  // const update = () => {
  //   setItems((prevItems) => {
  //     prevItems[35].done = true;

  //     return structuredClone(prevItems);
  //   })
  // }

  const onMouseOverHandler = useCallback(({ box, label, col, row}: any) => {
    // OPTION
    setCursorPosition({ box, row, boat: BOATS[0].squares });
    setBoatPosition({ box, row, boat: BOATS[0].squares });
  }, [setCursorPosition, setBoatPosition])

  const onClickBoxHandler = useCallback(() => {
    console.log("onClickBoxHandler", boxesOver);
    setItems((prevItems: any) => {
      return prevItems.map((i: any) => {
        if (boxesOver.includes(i.box)) {
          return {
            ...i,
            filled: true,
          }
        }

        return i;
      })
    })
  }, [boxesOver]);

  return (
    <>
          <pre>{JSON.stringify(isConflict)}</pre>
      <pre>{JSON.stringify(boxesOver)}</pre>
      {/* <button onClick={update}>HIT</button> */}

      <div className='flex flex-col w-full justify-center items-center'>
        {board.map((r, rowKey) => {
          return <div key={rowKey} className='flex'>
            {r.map((c: any) => <div
              className='flex'
              key={c.label}
              data-position={
                `{ "col": ${c.col}, "row": ${c.row}, "box": ${c.box} }`
              }
              onMouseOver={() => onMouseOverHandler(c)}
              onClick={onClickBoxHandler}
            >
              <div
                className={[
                  "w-[50px] h-[50px] flex items-center justify-center text-xs border border-dashed hover:border-2 hover:cursor-pointer hover:border-slate-600 flex-col",
                  c.over && !isConflict ? 'bg-slate-200' : '',
                  c.over && isConflict ? 'bg-red-200 relative' : '',
                  c.filled ? 'bg-blue-200' : '',
                ].join(' ')}
              ><div></div><div className='text-xs'></div></div>
            </div>)}
          </div>
        })}
      </div>
    </>
  )
}

export default App
