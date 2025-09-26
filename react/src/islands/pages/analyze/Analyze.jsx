import { useState, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import styles from './Analyze.module.css';
import AnalyzePart from '../../chess/analyze/Analyze.jsx';
import PGNImportDialog from './components/PGNImportDialog.jsx';
import { Button } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Loop from '@mui/icons-material/Loop';

export default function Analyze(props) {
  const [PGNImportDialogShow, setPGNImportDialogShow] = useState(false);
  const [pgnText, setPgnText] = useState();

  function setPGNFromPast(pgn) {
    // let game = enrichPgn(pgn);
    if (!pgn) return;
    setPgnText(pgn);
  }

  return (
    <>
      <div className={clsx(styles.mainDiv)}>
        <div className={clsx(styles.board)}>
          <Button variant="text" onClick={() => setPGNImportDialogShow(true)}>
            pgn
          </Button>
          <PGNImportDialog
            open={PGNImportDialogShow}
            onClose={() => setPGNImportDialogShow(false)}
            onImport={setPGNFromPast}
          />
        </div>
        <div className={clsx('')}>
          <AnalyzePart pgnText={pgnText} />
        </div>
      </div>
    </>
  );
}
