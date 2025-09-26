import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useState } from 'react';

export default function PGNImportDialog({ open, onClose, onImport }) {
  const [pgn, setPgn] = useState('');

  const handleSubmit = () => {
    if (pgn.trim().length < 5) return; // اعتبارسنجی ساده
    onImport?.(pgn.trim()); // برگرداندن متن به والد
    onClose(); // بستن پاپ‌آپ
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Paste PGN Or FEN</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          minRows={10}
          value={pgn}
          onChange={(e) => setPgn(e.target.value)}
          placeholder={`rnbqkbnr/pp2p1pp/5p2/2pp4/3P3P/5P2/PPP1P1P1/RNBQKBNR w KQkq - 0 4\n\n OR a game\n\n[Event "…"]\n[Site "…"]\n1.e4 e5 2.Nf3 Nc6 …`}
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}
