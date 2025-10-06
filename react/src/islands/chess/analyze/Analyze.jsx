import { useState, useCallback, useEffect, use } from 'react';
import useResizeObserver from '../../hooks/useResizeObserver.ts';
import useKeyPress from '../../hooks/useKeyPress.jsx';
import clsx from 'clsx';
import styles from './Analyze.module.css';
import Board from '../../chessBoards/ChessJsBoard.jsx';
import EvalGauge from '../EvalGauge/EvalGauge.jsx';
import { enrichPgn, addMoveAfterParent } from '@shared/chess/enrichPgn.js';

import PgnViewer from '../PgnViewer/PgnViewer.jsx';
import Engine from '../engines/Engine.jsx';
import { Button, Box, Paper } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import Loop from '@mui/icons-material/Loop';

const scrollbarWidth = 7;
export default function Analyze({ pgnText }) {
  const [orientation, setOrientation] = useState('white');
  const [gaugeReverse, setGaugeReverse] = useState(false);
  const [moveObj, setMoveObj] = useState();
  const [enrichedMove, setEnrichedMove] = useState();
  const [enrichedPgn, setEnrichedPgn] = useState();
  const [pgnViewerVersion, setPgnViewerVersion] = useState(0);
  const [boardPartHeight, setPartHeight] = useState();
  const [evalValue, setEvalValue] = useState(0);
  const [arrows, setArrows] = useState([]);
  const { ref: boardPart } = useResizeObserver({
    onResize: ({ width, height }) => {
      setPartHeight(height);
    },
  });

  useEffect(() => {
    setBoardAndPgnViewer(null, enrichedPgn?.game?.tags?.FEN);
  }, [enrichedPgn]);

  useEffect(() => {
    console.log(pgnText.pgn);

    let game = enrichPgn(
      pgnText.pgn || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      // '[Event "Casual Game"]\n[Site "Berlin GER"]\n[Date "1852.??.??"]\n[EventDate "?"]\n[Round "?"]\n[Result "1-0"]\n[White "Adolf Anderssen"]\n[Black "Jean Dufresne"]\n[ECO "C52"]\n[WhiteElo "?"]\n[BlackElo "?"]\n[PlyCount "47"]\n\n1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24.Bxe7# 1-0',
      // '[Variant "From Position"][FEN "8/2P5/6k1/1K6/8/8/8/8 w - - 0 1"] 1. Kc6 Kg7 (1... Kf5) 2. c8=Q',
      // '1. d4 d5 (1... f6 2. h3 (2. b3 b6) (2. Nc3 a6) 2... h6 3. a3 (3. Bf4 e5 4. dxe5) (3. c4)) (1... c6) 2. f3 Nf6',
      // '1. d4 d5 (1... f6 2. h3 (2. b3 b6) (2. Nc3 a6) 2... h6 (2... e6 3. f4 d5 (3... c5)) 3. a3 (3. Bf4 e5 4. dxe5) (3. c4) (3. g4)) (1... c6) 2. f3 (2. g3) 2... e5 3. dxe5 c5 4. c4 d4 5. e3 Nc6 6. exd4 Nxd4 7. Bd3',
    );
    if (!game) return;
    setEnrichedPgn(game);
  }, [pgnText]);
  useKeyPress('ArrowRight', onClickNext);
  useKeyPress('ArrowLeft', onClickPrev);
  useKeyPress('ArrowUp', onClickStartPosition);
  useKeyPress('ArrowDown', onClickEnd);
  // useKeyPress('KeyF', setSide());

  function afterBoardMove(moveObj, type = 'manual') {
    let changed = addMoveAfterParent({
      enrichedPgn: enrichedPgn,
      parentId: enrichedMove?.enriched.id,
      move: moveObj.san,
    });
    if (changed.existed) {
      let m = enrichedPgn.map[changed.newMoveObj.enriched.id];
      setBoardAndPgnViewer(m, '', type);
      return;
    }
    setEnrichedPgn(changed.enrichedPgn);
    setBoardAndPgnViewer(changed.enrichedPgn.map[changed.newMoveObj.enriched.id], '', type);
    setPgnViewerVersion((x) => x + 1);
    //todo set enriched move and PGN
  }
  function setBoardAndPgnViewer(enrichedMove, position = null, type = 'manual') {
    setEnrichedMove(enrichedMove);
    setMoveObj({ position, enrichedMove, enrichedPgn, type });
    setArrows([]);
  }
  function onClickNext() {
    let nextMove = null;
    if (!enrichedMove) {
      if (enrichedPgn?.game?.moves?.length === 0) return;
      nextMove = enrichedPgn?.game?.moves?.[0];
    } else {
      nextMove = enrichedMove?.enriched.line[enrichedMove?.enriched.index + 1];
    }
    if (nextMove) setBoardAndPgnViewer(nextMove);
  }
  function onClickEnd() {
    let nextMove = enrichedPgn.game?.moves[enrichedPgn.game?.moves.length - 1] || null;
    if (nextMove) setBoardAndPgnViewer(nextMove);
  }
  function onClickStartPosition() {
    setBoardAndPgnViewer(null, enrichedPgn?.game?.tags?.FEN);
  }
  function onClickPrev() {
    if (!enrichedMove) return;
    let prevMove = enrichedMove?.enriched.parent || null;
    if (!prevMove) {
      onClickStartPosition();
    } else {
      setBoardAndPgnViewer(prevMove);
    }
  }
  function setSide() {
    setOrientation(orientation === 'white' ? 'black' : 'white');
    setGaugeReverse(!gaugeReverse);
  }
  function onMoveClick(m) {
    setBoardAndPgnViewer(m);
  }
  function onAnalyze(line) {
    let value = line.normalizedEvalValue;

    setEvalValue(value);
    try {
      if (line.enrichedMoves?.length > 1) {
        setArrows([
          {
            startSquare: line.enrichedMoves[0].from,
            endSquare: line.enrichedMoves[0].to,
            color: 'red',
          },
          {
            startSquare: line.enrichedMoves[1].from,
            endSquare: line.enrichedMoves[1].to,
            color: 'blue',
          },
          {
            startSquare: line.enrichedMoves[2].from,
            endSquare: line.enrichedMoves[2].to,
            color: 'green',
          },
        ]);
      }
    } catch (e) {
      console.error('Error analyzing line:', e);
    }
  }
  return (
    <Box>
      <div className={clsx(styles.mainDiv)}>
        <div>
          <div ref={boardPart} className={clsx(styles['board-part'])}>
            <div>
              <Board
                boardOrientation={orientation}
                // enrichedMove={enrichedMove}
                // position={FEN}
                moveObj={moveObj}
                afterBoardMove={afterBoardMove}
                arrows={arrows}
              />
            </div>
            <div>
              <EvalGauge reverse={gaugeReverse} value={evalValue} />
            </div>
          </div>
        </div>
        <Box
          sx={{
            mx: [0, 0, 1],
            mt: [1, 1, 0],
            // ms: [0, 0, 1],
            height: [280, boardPartHeight],
            border: 1,
            borderRadius: 1,
          }}
        >
          <Box
            sx={{
              // display: 'flex', flexDirection: 'column',
              height: '100%',
              display: 'grid',
              gap: 1,
              padding: 0.7,
              bgcolor: '#e8e2d9',
              // gridTemplateColumns: '1fr 40px',
              gridTemplateRows: 'auto minmax(20px, 1fr) auto',
            }}
            className={clsx()}
          >
            <Box sx={{ border: 1, borderRadius: 1 }} className={clsx('')}>
              <Engine moveObj={moveObj} onAnalyze={onAnalyze} />
            </Box>
            <Paper
              sx={{
                border: 1,
                borderRadius: 1,
                '--u-scroll-size': `${scrollbarWidth * 1.25}px`,
                // maxHeight: '100%',
                // maxwidth: '100%',
              }}
              className={clsx('u-scroll')}
            >
              <PgnViewer
                key={pgnViewerVersion}
                enrichPgn={enrichedPgn}
                onClick={onMoveClick}
                enrichedMove={enrichedMove}
                // view="line"
              />
            </Paper>
            <Box
              sx={{
                width: `calc(100% - ${scrollbarWidth}px)`,
                py: [0.5],
              }}
            >
              <Box sx={{}} className={clsx('d-flex justify-content-around  pb-1')}>
                <IconButton sx={{ p: 0 }} onClick={setSide}>
                  <Loop />
                </IconButton>
                <IconButton sx={{ p: 0 }} onClick={onClickStartPosition}>
                  <FirstPageIcon />
                </IconButton>
                <IconButton sx={{ p: 0 }} onClick={onClickPrev}>
                  <NavigateBeforeIcon />
                </IconButton>
                <IconButton sx={{ p: 0 }} onClick={onClickNext}>
                  <NavigateNextIcon />
                </IconButton>
                <IconButton sx={{ p: 0 }} onClick={onClickEnd}>
                  <LastPageIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </div>
    </Box>
  );
}
