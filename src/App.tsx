import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import './App.css'
import { randomNumber } from './utils';

const BOATS = [{
  label: "Battleship",
  squares: 5,
}, {
  label: "Destroyer",
  squares: 4,
}, {
  label: "Destroyer",
  squares: 4,
}];

const BOARD_SIZE = 10;
const LETTERS = "ABCDEFGHIJ";

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
      done: false
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
  const [cursorPosition, setCursorPosition] = useState<any>({
    box: 1,
    row: 1,
    boat: BOATS[0].squares
  });
  const [items, setItems] = useState<any[]>(generateItems());
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

      if (outLeft > 0) {
        boxes = [
          ...boxes.slice(outLeft),
          ...Array.from(new Array(outLeft + boxRight)).map((_, k) => box + (k + 1))
        ]
      }
      if (outRight > 0) {
        boxes = [
          ...Array.from(new Array(boxLeft + outRight)).map((_, k) => box - (k + 1)).reverse(),
          ...boxes.slice(0, boxes.length - outRight),
        ]
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

      const outTop = boxes.filter(i => i < 0).length;
      const outBottom = boxes.filter(i => i > 100).length;

      if (outTop > 0) {
        boxes = [
          ...boxes.slice(outTop),
          ...Array.from(new Array(rest)).map((_, k) => {
            return box +  ((k +  outTop) * BOARD_SIZE)
          })
        ];
      } else if (outBottom > 0) {
        boxes = [
          ...Array.from(new Array(rest)).map((_, k) => {
            return box - ((k +  outBottom) * BOARD_SIZE)
          }),
          ...boxes.slice(0, -outBottom),
        ];
      }
    }

    setItems((prevItems) => {
      return (prevItems.map((i, k) => {
        if (boxes.includes(i.box)) {
          i.done = true
        } else {
          i.done = false
        }

        return i
      }))
    })
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

  // INIT
  let mounted = false;
  useEffect(() => {
    if (mounted) return;

    mounted = true;

    const box = randomNumber(1, BOARD_SIZE * BOARD_SIZE);
    const row = Math.ceil(box / BOARD_SIZE);
    const boat = (BOATS[randomNumber(0, 2)]).squares;

    orientation.current = [ORIENTATION.VERTICAL, ORIENTATION.HORIZONTAL][randomNumber(0, 1)];

    setCursorPosition({ box, row, boat });
    setBoatPosition({ box, row, boat });
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

  return (
    <>
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
            >
              <div
                className={[
                  "w-[50px] h-[50px] flex items-center justify-center text-xs border border-solid hover:border-2 hover:cursor-pointer hover:border-slate-600 flex-col relative z-10",
                  c.done ? 'bg-red-200' : '',
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
