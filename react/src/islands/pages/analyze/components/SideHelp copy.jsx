import {
  Box,
  Paper,
  Stack,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Tooltip,
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
    <Paper
      elevation={3}
      sx={{
        // position: 'fixed',
        // right: 0,
        // top: 0,
        height: '100vh',
        // width: { xs: '88%', sm: 340, md: 380 },
        boxSizing: 'border-box',
        p: 1,
        overflowY: 'auto',
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

      <Divider sx={{ my: 1 }} />

      {/* Quick Start */}
      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
        Quick Start (2 steps)
      </Typography>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PlayArrowIcon fontSize="small" />
          <Typography variant="body2">
            <strong>Start the engine</strong> → Click <strong>Play</strong> (▶) in the Help panel.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <KeyboardIcon fontSize="small" />
          <Typography variant="body2">
            <strong>Navigate moves</strong> → Use <strong>← / →</strong> under the board.
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ my: 1 }} />

      {/* Full Walkthrough Sections */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PlayArrowIcon fontSize="small" />
            <Typography variant="subtitle1">1) Start / Stop the Engine</Typography>
            <Chip size="small" label="Where to click" sx={{ ml: 1 }} />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Click <strong>▶ Start Engine</strong>. The status badge changes to{' '}
            <strong>Running</strong>. To stop, click <strong>■ Stop</strong>.
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Where to click:</strong> Help panel → <em>Engine</em> section → buttons{' '}
            <strong>▶ / ■</strong>.
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Start Engine (visual only)">
              <Button size="small" variant="outlined" startIcon={<PlayArrowIcon />} disabled>
                Start
              </Button>
            </Tooltip>
            <Tooltip title="Stop Engine (visual only)">
              <Button size="small" variant="outlined" startIcon={<StopIcon />} disabled>
                Stop
              </Button>
            </Tooltip>
            <Tooltip title="Engine Settings (visual only)">
              <Button size="small" variant="text" startIcon={<SettingsIcon />} disabled>
                Settings
              </Button>
            </Tooltip>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutorenewIcon fontSize="small" />
            <Typography variant="subtitle1">2) Rotate the Board</Typography>
            <Chip size="small" label="Where to click" sx={{ ml: 1 }} />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Click the <strong>Rotate</strong> icon (↻/🔄) to switch White/Black view.
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Where to click:</strong> Top-right toolbar above the board →{' '}
            <strong>Rotate (↻)</strong>, or Help panel → <em>Rotation</em> section →{' '}
            <strong>Rotate</strong> button.
          </Typography>
          <Tooltip title="Rotate (visual only)">
            <Button size="small" variant="outlined" startIcon={<AutorenewIcon />} disabled>
              Rotate
            </Button>
          </Tooltip>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <KeyboardIcon fontSize="small" />
            <Typography variant="subtitle1">3) Navigate the Move List</Typography>
            <Chip size="small" label="Where to click" sx={{ ml: 1 }} />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1} sx={{ mb: 1 }}>
            <Typography variant="body2">
              <strong>Previous:</strong> click ← &nbsp; &nbsp; <strong>Next:</strong> click → &nbsp;
              &nbsp;
              <strong>First:</strong> ⏮ &nbsp; <strong>Last:</strong> ⏭
            </Typography>
            <Typography variant="body2">
              <strong>Where to click:</strong> Controls under the board (⏮ ← → ⏭) or see keys
              below.
            </Typography>
          </Stack>

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
            <Stack direction="row" spacing={1} alignItems="center">
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
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SettingsIcon fontSize="small" />
            <Typography variant="subtitle1">4) Engine Settings (depth & lines)</Typography>
            <Chip size="small" label="Where to click" sx={{ ml: 1 }} />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Click <strong>Settings</strong> (⚙), set <strong>Depth</strong> and{' '}
            <strong>Lines (MultiPV)</strong>, then <strong>Save</strong>.
          </Typography>
          <Typography variant="body2">
            <strong>Where to click:</strong> Help panel → <em>Engine</em> →{' '}
            <strong>⚙ Settings</strong>.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <EmojiEventsIcon fontSize="small" />
            <Typography variant="subtitle1">5) Icons & Legend</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            <ListItem disableGutters>
              <ListItemIcon>
                <StarIcon />
              </ListItemIcon>
              <ListItemText primary="⭐ Recommended move – best line from the engine" />
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon>
                <BoltIcon />
              </ListItemIcon>
              <ListItemText primary="⚡ Tactic/Critical – sharp or mistake-related line" />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 1 }} />

      {/* Troubleshooting */}
      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
        Troubleshooting
      </Typography>
      <Stack spacing={0.75} sx={{ mb: 2 }}>
        <Typography variant="body2">
          Engine doesn’t start → Help → <em>Engine</em> → click <strong>▶ Start</strong> → wait for{' '}
          <strong>Running</strong> badge.
        </Typography>
        <Typography variant="body2">
          Board didn’t rotate → Toolbar above board → click <strong>↻ Rotate</strong> once.
        </Typography>
        <Typography variant="body2">
          Keys not working → Click once on the board area to focus, then use keys.
        </Typography>
      </Stack>

      {/* Mini Map */}
      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
        Mini Map (actions → where to click)
      </Typography>
      <Stack spacing={0.5}>
        <Typography variant="body2">Start/Stop engine → Help → Engine → ▶ / ■</Typography>
        <Typography variant="body2">
          Rotate board → Toolbar ↻ (or Help → Rotation → Rotate)
        </Typography>
        <Typography variant="body2">Move navigation → Under-board controls ⏮ ← → ⏭</Typography>
        <Typography variant="body2">Engine settings → Help → Engine → ⚙</Typography>
        <Typography variant="body2">Shortcuts → Help → Shortcuts section</Typography>
        <Typography variant="body2">Close Help → (Esc)</Typography>
      </Stack>

      <Box sx={{ height: 16 }} />
    </Paper>
  );
}
