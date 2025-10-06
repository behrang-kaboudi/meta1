// اسکلت کمینه (جاوا اسکریپت، نه تایپ اسکریپت)
import { useEffect, useRef, useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import { toFigurineSAN } from '../PgnViewer/utils/MoveText.jsx';
import {
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
  ButtonGroup,
  Button,
  Switch,
  Tooltip,
  Box,
} from '@mui/material';
import styles from './Engine.module.css';
import clsx from 'clsx';
export default function Engine(props) {
  const { onAnalyze, onToggle, onDepthChange, moveObj } = props;

  const workerRef = useRef(null);
  const FEN = useRef();
  const engineStatus = useRef(false); // 'idle'|'loading'|'ready'|'analyzing'|'error |'uci-sent'|'uciok'|'ready-sent'
  const [allowAnalyze, setAllowAnalyze] = useState(false);
  const [engineMassages, setEngineMassages] = useState();
  const [engineSwitch, setEngineSwitch] = useState(false);
  const [analyzeAns, setAnalyzeAns] = useState(false);
  const [currentDepth, setCurrentDepth] = useState('-'); // depth
  const [evalScore, setEvalScore] = useState(0); // depth
  const send = useMemo(() => {
    return (cmd) => {
      if (!workerRef.current) return;
      workerRef.current.postMessage(cmd);
      // console.log('>>', cmd);
    };
  }, []);
  useEffect(() => {
    // console.log('moveObj00000', moveObj.enrichedMove.enriched.fenAfter, FEN.current, 'current');
    if (!moveObj) return;

    let pos = moveObj.position ? moveObj.position : moveObj?.enrichedMove?.enriched.fenAfter;

    if (pos == FEN.current) return;

    FEN.current = pos;
    if (allowAnalyze) {
      send('isready');
    }
  }, [moveObj]);

  useEffect(() => {
    if (engineStatus) {
    }
    if (allowAnalyze) {
      if (engineStatus.current == 'error') {
        setEngineSwitch(false);
        return;
      }
      setEngineSwitch(true);
      send('isready');

      //do
    } else {
      setEngineSwitch(false);
      engineStatus.current = 'idle';
      //TODO test
      send('stop');
      //stop
    }
  }, [allowAnalyze]);
  useEffect(() => {
    if (!engineMassages || !engineStatus.current) return;

    if (engineMassages.includes('uciok')) {
      // very light parser example
      engineStatus.current = 'uciok';
      send('setoption name Threads value 4');
      send('setoption name Hash value 256');
      // send('setoption name MultiPV value 3');
    } else if (engineMassages.includes('readyok')) {
      engineStatus.current = 'ready';
      if (allowAnalyze) {
        analyze();
      }
    } else if (isGoodEvalLine(engineMassages)) {
      // let moveNum = !moveObj.enrichedMove
      //   ? moveObj.enrichedPgn.game.enrichedData.moveNo
      //   : moveObj.enrichedMove.enriched.moveNo;
      let info = parseUciInfo(engineMassages);
      setEnrichedMove(info, FEN.current);

      normalizeScore(info);
      setCurrentDepth(info.depth || '-');
      setEvalMateText(info);
      onAnalyze?.(info);
      let line = convertAnalyze(info);
      setAnalyzeAns(line);
    }
  }, [engineMassages]);
  function setEvalMateText(info) {
    if (info.score?.type === 'mate') {
      let multiple = info.enrichedMoves[0].side === 'w' ? 1 : -1;
      setEvalScore(`#${info.score?.value * multiple}`);
    } else {
      setEvalScore(info.normalizedEvalValue || 0);
    }
  }
  // initialing: engine
  useEffect(() => {
    engineStatus.current = 'loading';
    const w = new Worker('/public/components/sf/src/stockfish.js'); // classic worker
    workerRef.current = w;
    w.onerror = () => (engineStatus.current = 'error');
    w.onmessage = (e) => {
      setEngineMassages(String(e.data.trim() ?? ''));
    };

    //TODO create with timer until true set for engineStatus
    w.postMessage('uci');
    return () => workerRef.current.terminate(); // cleanup to prevent leaks
  }, []);
  function analyze() {
    ////TODO  Always safe: will be queued if not yet ready
    send('ucinewgame');
    send(`position fen ${FEN.current}`);
    send('go depth 22'); // or 'go infinite'
    engineStatus.current = 'analyzing';
  }
  return (
    <Box className={clsx(styles['engine-card'])} sx={{ p: 0.5 }}>
      <Box className={clsx(styles['engine-card__content'])}>
        <div className={clsx(styles['engine-header'])}>
          <Stack className={clsx(styles['engine-header__left'])} direction="row">
            <Typography className={clsx(styles['engine-eval'])} sx={{ fontSize: 24 }}>
              {evalScore}
            </Typography>
            <Typography className={clsx(styles['engine-meta'])} sx={{ mx: 1 }}>
              depth: {currentDepth}
            </Typography>
          </Stack>
          <Stack
            className={clsx(styles['engine-header__right'])}
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <ButtonGroup variant="outlined" size="small" aria-label="Depth presets">
              <Button onClick={() => onDepthChange?.(n)}>-</Button>
              <Button onClick={() => onDepthChange?.(n)}>+</Button>
            </ButtonGroup>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Switch
                // checked={!!enabled}
                checked={engineSwitch}
                onChange={(e) => {
                  onToggle?.(e.target.checked);
                  setAllowAnalyze(e.target.checked);
                }}
                // inputProps={{ 'aria-label': 'Enable engine' }}
              />
            </Stack>
          </Stack>
        </div>

        {/* PV area */}
        <Box className={clsx(styles['engine-pv'], 'u-scroll')} role="log" aria-live="polite">
          {analyzeAns || 'No analysis'}
        </Box>
      </Box>
    </Box>
  );
}

function normalizeScore(line) {
  if (!line || !line.score) return;
  let value;
  let multiple = line.enrichedMoves[0].side === 'w' ? 1 : -1;
  if (line?.score?.type === 'cp') {
    value = (multiple * line?.score?.value) / 100;
  } else if (line?.score?.type === 'mate') {
    value = 1000; //line?.score?.value;
    value = multiple * value * line?.score?.value; // اگر طرف سیاه باشد، علامت معکوس میشود
  }
  line.normalizedEvalValue = value;
  return;
  // if (!line || !line.score) return;

  // let value;
  // let multiple = line.enrichedMoves[0].side === 'w' ? 1 : -1;

  // if (line?.score?.type === 'cp') {
  //   value = (multiple * line?.score?.value) / 100;
  // } else if (line?.score?.type === 'mate') {
  //   // مات در K حرکت
  //   value = 10000; //line?.score?.value;
  //   // if (line.enrichedMoves[0].side === 'b') {
  //   value = multiple * value; // اگر طرف سیاه باشد، علامت معکوس میشود
  //   // }
  // }
  // line.normalizedEvalValue = value;
}
function isGoodEvalLine(s) {
  if (!s.startsWith('info ')) return false;

  if (!s.includes(' score ')) return false;
  if (!s.includes(' pv ')) return false;

  if (s.includes(' lowerbound') || s.includes(' upperbound')) return false;
  // Keep only top line when MultiPV is enabled
  // if (s.includes(' multipv ') && !s.includes(' multipv 1')) return false;

  // Optional: require non-decreasing depth
  // const m = s.match(/\bdepth\s+(\d+)/);
  // if (m) {
  //   const d = +m[1];
  //   if (d < bestDepthSeen) return false;
  //   bestDepthSeen = Math.max(bestDepthSeen, d);
  // }
  return true;
}
function parseUciInfo(line) {
  if (!line || typeof line !== 'string') return null;
  line = line.trim();
  if (!line.startsWith('info ')) return null;

  const out = { type: 'info' };
  const tok = line.split(/\s+/);
  for (let i = 1; i < tok.length; i++) {
    const k = tok[i];
    switch (k) {
      case 'depth':
        out.depth = +tok[++i];
        break;
      case 'seldepth':
        out.seldepth = +tok[++i];
        break;
      case 'time':
        out.time = +tok[++i];
        break;
      case 'nodes':
        out.nodes = +tok[++i];
        break;
      case 'nps':
        out.nps = +tok[++i];
        break;
      case 'hashfull':
        out.hashfull = +tok[++i];
        break;
      case 'tbhits':
        out.tbhits = +tok[++i];
        break;
      case 'multipv':
        out.multipv = +tok[++i];
        break;
      case 'score': {
        const t = tok[++i]; // cp | mate | wdl
        if (t === 'cp') out.score = { type: 'cp', value: +tok[++i] };
        else if (t === 'mate') out.score = { type: 'mate', value: +tok[++i] };
        else if (t === 'wdl') {
          console.log('wdl score: check for info in uci important'); // debug
          out.score = { type: 'wdl', w: +tok[++i], d: +tok[++i], l: +tok[++i] };
        }
        // optional flags after score: lowerbound / upperbound
        if (tok[i + 1] === 'lowerbound' || tok[i + 1] === 'upperbound') {
          out.score.bound = tok[++i + 0]; // store the bound flag
        }
        break;
      }
      case 'pv': {
        out.pv = tok.slice(i + 1); // rest of tokens are moves
        i = tok.length; // end
        break;
      }
      case 'string': {
        out.string = tok.slice(i + 1).join(' ');
        i = tok.length;
        break;
      }
      default:
        // skip other tokens: currmove, currmovenumber, cpuload, refutation, currline, ...
        break;
    }
  }

  return out;
}
function setEnrichedMove(info, fen) {
  const chessTmp = new Chess(fen);
  if (info.pv) {
    let enrichedMoves = [];
    info.pv.forEach((element) => {
      let mv = chessTmp.move(element, { sloppy: true });
      if (!mv) return;
      let enriched = mv;
      const { side, moveNo } = metaFromFEN(fen);

      enriched.side = side;
      enriched.moveNo = moveNo;

      enrichedMoves.push(enriched);
      fen = chessTmp.fen();
    });
    info.enrichedMoves = enrichedMoves;
  }
  // console.log(info);
}
// function isGoodEvalInfo(info) {
//   if (!info) return false;
//   if (!info.score || info.score.bound) return false; // ignore lower/upper bound
//   if (!info.pv || info.pv.length === 0) return false;
//   // if (info.multipv && info.multipv !== 1) return false; // top line only
//   if (typeof info.depth === 'number') {
//     // if (info.depth < bestDepthSeen) return false;
//     // bestDepthSeen = Math.max(bestDepthSeen, info.depth);
//   }

//   return true;
// }
/**
 * Enhanced convertAnalyse
 * @param {object} info  - UCI line: "info depth ... score ... pv e2e4 e7e5 ..."
 * @param {string} fen
 */
function convertAnalyze(info) {
  let nodes = [];
  for (let i = 0; i < info.enrichedMoves.length; i++) {
    const currentMove = info.enrichedMoves[i];
    // Compute prefixed move number like original:
    let prefix = '';
    if (i === 0 && currentMove.side === 'b') {
      prefix = currentMove.moveNo + '... ';
    }
    if (currentMove.side === 'w') {
      prefix = currentMove.moveNo + '. ';
    }
    const txt = toFigurineSAN(currentMove.san, { color: currentMove.side, addPawn: false });

    //TODO manage NAGs
    let part = (
      <span>
        <span style={{ fontSize: '1.4em', lineHeight: 1 }}>{txt.fig1}</span>
        <span className={`${styles.moveText}`}>{txt.text}</span>
        <span style={{ fontSize: '1.4em', lineHeight: 1 }}>{txt.fig2}</span>
      </span>
    );

    let key = `${i}-${currentMove.san}-${currentMove.moveNo}`;
    nodes.push(
      <span key={key} className="ms-1 position-relative">
        {prefix ? prefix : ''} {part}
      </span>,
    );
  }
  // Render (debounced to avoid flicker)
  return nodes;
}
function pvUciToSan(pvTokens, startFEN) {
  const chess = new Chess(startFEN);
  const sanMoves = [];
  for (const uci of pvTokens || []) {
    if (uci === '0000') break; // null-move guard
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length >= 5 ? uci[4].toLowerCase() : undefined;
    const move = chess.move({ from, to, promotion });
    if (!move) break; // illegal relative to FEN; stop gracefully
    sanMoves.push(move.san);
  }
  return { sanMoves, finalFEN: chess.fen(), turn: chess.turn() };
}
function metaFromFEN(fen) {
  const parts = (fen || '').split(' ');
  // [0]=board, [1]=activeColor, [2]=castling, [3]=enPassant, [4]=halfmove, [5]=fullmove
  const side = parts[1] === 'w' ? 'w' : 'b';
  const moveNo = Number(parts[5] || 1) || 1;
  const halfmoveClock = Number(parts[4] || 0) || 0;
  return { side, moveNo, halfmoveClock };
}
