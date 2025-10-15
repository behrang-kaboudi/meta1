import { useState, useCallback, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import styles from './Analyze.module.css';
import AnalyzePart from '../../chess/analyze/Analyze.jsx';
import PGNImportDialog from './components/PGNImportDialog.jsx';
import SideHelp from './components/SideHelp.jsx';
import { Button, Paper, Box } from '@mui/material';
const st = {
  aspectRatio: '18 / 8.5',
  maxHeight: ['auto', 'auto', '75vh'],
  mx: 'auto',
  // border: '1px solid',
  // borderRadius: 2,
  p: [0, 1, 2],
  '& .mainDiv': {
    display: 'grid',
    gridTemplateColumns: ['100%', , '25% 75%'],
    m: [0, 'auto'],
    height: 'auto',
  },
  '& .helpSide': { gridRow: ['2/3', , '1/2'] },
  '& .help-text': {
    aspectRatio: ['1', , '0.685'],
    m: 0.7,
    mt: 1,
  },
  '.boardContainer': {
    p: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
export default function Analyze(props) {
  const [PGNImportDialogShow, setPGNImportDialogShow] = useState(false);
  const [pgnText, setPgnText] = useState({ pgn: '' });

  function setPGNFromPast(pgn) {
    // let game = enrichPgn(pgn);
    if (!pgn) return;
    setPgnText({ pgn });
  }

  return (
    <Paper sx={st}>
      <PGNImportDialog
        open={PGNImportDialogShow}
        onClose={() => setPGNImportDialogShow(false)}
        onImport={setPGNFromPast}
      />
      <Box className={clsx('mainDiv u-border')} sx={{ height: '100%' }}>
        <Box className={clsx('helpSide')} sx={{}}>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 1, pt: 2, gap: 1 }}>
            <Button
              variant="contained"
              sx={{ fontSize: [16], width: ['75%'] }}
              // variant="text"
              onClick={() => setPGNImportDialogShow(true)}
            >
              Click!! to import PGN/FEN
            </Button>
            <Button
              variant="contained"
              sx={{ fontSize: [16], width: '25%' }}
              // variant="text"
              onClick={() =>
                setPgnText({ pgn: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' })
              }
            >
              NEW Game
            </Button>
          </Box>
          <div sx={{}} className={clsx('help-text u-scroll u-border')}>
            {<SideHelp />}
          </div>
        </Box>
        <div className={clsx('boardContainer')}>
          <AnalyzePart pgnText={pgnText} />
        </div>
      </Box>
    </Paper>
  );
}
