import {
  Box,
  Paper,
  Stack,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  Tooltip,
  Switch,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import BoltIcon from '@mui/icons-material/Bolt';
import SettingsIcon from '@mui/icons-material/Settings';

// Small helper to render keycaps like <kbd>
function Kbd({ keys }) {
  const parts = Array.isArray(keys) ? keys : String(keys).split(' ');
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {parts.map((k, i) => (
        <Box
          key={`${k}-${i}`}
          component="kbd"
          sx={{
            display: 'inline-block',
            px: 1,
            py: 0.25,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            fontFamily: 'monospace',
            fontSize: 12,
            lineHeight: 1.6,
            minWidth: 22,
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          {k}
        </Box>
      ))}
    </Stack>
  );
}

export default function SideHelp() {
  return (
    <Box
      elevation={3}
      sx={{
        // position: 'fixed',
        // right: 0,
        // top: 0,
        // height: '100%',
        // width: { xs: '88%', sm: 340, md: 380 },
        // boxSizing: 'border-box',
        p: 1,
        // overflowY: 'auto',
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <HelpOutlineIcon />
        <Typography variant="h6">Analysis Help</Typography>
        <Box sx={{ flex: 1 }} />
        <Chip size="small" variant="outlined" label="Beginner" />
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Use this guide to know exactly where to click.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Quick Start */}
      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
        Quick Start
      </Typography>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PlayArrowIcon fontSize="small" />
          <Typography variant="body2">
            <strong>Start the engine</strong> → Click <Switch disabled /> in the panel.
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ my: 1 }} />

      {/* Full Walkthrough Sections */}
      <Stack direction="row" spacing={1} alignItems="center">
        <AutorenewIcon fontSize="small" />
        <Typography variant="subtitle1">
          {' '}
          Rotate the Board: Click the <strong>Rotate</strong> icon to switch White/Black view.
        </Typography>
      </Stack>

      <Accordion defaultExpanded sx={{ border: '1px solid', borderRadius: 2, mx: 0, mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <KeyboardIcon fontSize="small" />
            <Typography variant="subtitle1">Navigate the Move List</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          {/* Keyboard Shortcut List */}
          <Stack spacing={0.75}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Kbd keys="ArrowLeft" />
              <Typography variant="body2">Previous move</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Kbd keys="ArrowRight" />
              <Typography variant="body2">Next move</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Kbd keys="ArrowUp" />
              <Typography variant="body2">First move</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Kbd keys="ArrowDown" />
              <Typography variant="body2">Last move</Typography>
            </Stack>
            {/*  <Stack direction="row" spacing={1} alignItems="center">
              <Kbd keys="Space" />
             <Typography variant="body2">Start/Stop engine</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Kbd keys="R" />
              <Typography variant="body2">Rotate board</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Kbd keys="Esc" />
              <Typography variant="body2">Close Help</Typography> 
            </Stack>*/}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ height: 16 }} />
    </Box>
  );
}
