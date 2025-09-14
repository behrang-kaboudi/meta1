import { useState, useCallback, useEffect, use } from 'react';
import clsx from 'clsx';
import styles from './Analyze.module.css';
import Board from '../../chessBoards/ChessJSBoard.jsx';
import { enrichPgn, addMoveAfterParent } from '@shared/chess/enrichPgn.js';
import PgnViewer from '../../chess/PgnViewer/PgnViewer.jsx';
import PGNImportDialog from './components/PGNImportDialog.jsx';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Loop from '@mui/icons-material/Loop';

export default function Analyze(props) {
  const [orientation, setOrientation] = useState('white');
  const [FEN, setFEN] = useState();
  const [enrichedMove, setEnrichedMove] = useState();

  const [PGNImportDialogShow, setPGNImportDialogShow] = useState(false);
  const [enrichedPgn, setEnrichedPgn] = useState();
  const [pgnViewerVersion, setPgnViewerVersion] = useState(0);
  useEffect(() => {
    // فقط برای تست
    // if (enrichedPgn) console.log('enrichedPgn changed:', enrichedPgn);
    setFEN(enrichedPgn?.startFEN || enrichedPgn?.game?.moves?.[0]?.enriched?.fenBefore);
  }, [enrichedPgn]);

  //for test
  useEffect(() => {
    let game = enrichPgn(
      // '[Event "Casual Game"]\n[Site "Berlin GER"]\n[Date "1852.??.??"]\n[EventDate "?"]\n[Round "?"]\n[Result "1-0"]\n[White "Adolf Anderssen"]\n[Black "Jean Dufresne"]\n[ECO "C52"]\n[WhiteElo "?"]\n[BlackElo "?"]\n[PlyCount "47"]\n\n1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24.Bxe7# 1-0',
      '[Variant "From Position"][FEN "8/2P5/6k1/1K6/8/8/8/8 w - - 0 1"] 1. Kc6 Kg7 (1... Kf5) 2. c8=Q',
    );
    setEnrichedPgn(game);
  }, []);

  function setPGNFromPast(pgn) {
    let game = enrichPgn(pgn);

    setEnrichedPgn(game);
  }
  let onMoveClick = useCallback((m) => {
    setEnrichedMove(m);
    // console.log('[clicked SAN]:', m?.enriched?.san || m?.notation?.notation || '');
    // '1. e4 e5 2. d4 (2. f3 g6 (2... c6 3. d4) 3. h3 h5) (2. Nc3 b6) 2... exd4 (2... c5 3. dxc5 h6) 3. c3 f6',
    //1. e4 e5 2. d4 (2. f3 g6 (2... c6 3. d4) 3. h3 h5) (2. Nc3 b6) 2... exd4 (2... c5 3. dxc5 h6) 3. c3 f6
  }, []);
  function afterBoardMove(moveObj) {
    let changed = addMoveAfterParent({
      enrichedPgn: enrichedPgn,
      parentId: enrichedMove?.enriched.id,
      move: moveObj.san,
    });

    if (changed.existed) {
      setEnrichedMove(enrichedPgn.map[changed.id]);
      return;
    }
    setEnrichedPgn(changed.enrichedPgn);
    setEnrichedMove(changed.enrichedPgn.map[changed.newMoveObj.enriched.id]);
    setPgnViewerVersion((x) => x + 1);
    //todo set enriched move and PGN
  }
  return (
    <>
      <div className={clsx(styles.mainDiv)}>
        <div className={clsx(styles.board)}>سسی</div>
        <div className={clsx(styles.pgn)}>
          <PGNImportDialog
            open={PGNImportDialogShow}
            onClose={() => setPGNImportDialogShow(false)}
            onImport={setPGNFromPast}
          />
          <Board
            boardOrientation={orientation}
            enrichedMove={enrichedMove}
            position={FEN}
            afterBoardMove={afterBoardMove}
          />
        </div>
        <div className={clsx(styles.btns)}>
          <div>
            <Button variant="text" onClick={() => setPGNImportDialogShow(true)}>
              pgn
            </Button>
            <IconButton
              onClick={() => setOrientation(orientation === 'white' ? 'black' : 'white')}
              aria-label="loop"
            >
              <Loop />
            </IconButton>
            <button>btn3</button>
            <button>btn4</button>
            <button>btn5</button>
          </div>
          <div>
            <PgnViewer key={pgnViewerVersion} enrichPgn={enrichedPgn} onClick={onMoveClick} />
          </div>
        </div>
      </div>
    </>
  );
}
