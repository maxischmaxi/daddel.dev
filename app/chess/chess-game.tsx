"use client";

import { Chess, type Color, type Move, type PieceSymbol, type Square } from "chess.js";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useDict } from "@/lib/i18n/use-t";
import { cn } from "@/lib/utils";

import { type ChessSoundEvent, useChessSounds } from "./chess-sounds";

type Difficulty = "easy" | "medium" | "hard";

type LastMove = {
  from: Square;
  to: Square;
};

type DragState = {
  pointerId: number;
  from: Square;
  piece: {
    color: Color;
    type: PieceSymbol;
  };
  x: number;
  y: number;
  originX: number;
  originY: number;
  moved: boolean;
  wasSelected: boolean;
};

type CanvasPointer = {
  square: Square;
  x: number;
  y: number;
};

type DifficultyConfig = {
  labelKey: "easyLabel" | "mediumLabel" | "hardLabel";
  skill: number;
  moveTimeMs: number;
};

const STOCKFISH_SCRIPT = "/stockfish/stockfish-18-lite-single.js";

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { labelKey: "easyLabel", skill: 1, moveTimeMs: 180 },
  medium: { labelKey: "mediumLabel", skill: 8, moveTimeMs: 550 },
  hard: { labelKey: "hardLabel", skill: 20, moveTimeMs: 1300 },
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

const PIECE_GLYPHS: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};

function isSquare(value: string): value is Square {
  return /^[a-h][1-8]$/.test(value);
}

function toSquare(fileIndex: number, rankFromTop: number): Square {
  return `${FILES[fileIndex]}${8 - rankFromTop}` as Square;
}

function squareToPoint(square: Square, squareSize: number) {
  const fileIndex = square.charCodeAt(0) - 97;
  const rankFromTop = 8 - Number(square[1]);
  return {
    x: fileIndex * squareSize,
    y: rankFromTop * squareSize,
  };
}

function pointerOnCanvas(
  canvas: HTMLCanvasElement,
  event: React.PointerEvent<HTMLCanvasElement>,
): CanvasPointer | null {
  const rect = canvas.getBoundingClientRect();
  const rawX = event.clientX - rect.left;
  const rawY = event.clientY - rect.top;
  if (rawX < 0 || rawY < 0 || rawX > rect.width || rawY > rect.height) {
    return null;
  }

  const x = Math.min(rect.width, Math.max(0, rawX));
  const y = Math.min(rect.height, Math.max(0, rawY));
  const fileIndex = Math.min(7, Math.max(0, Math.floor((x / rect.width) * 8)));
  const rankFromTop = Math.min(
    7,
    Math.max(0, Math.floor((y / rect.height) * 8)),
  );

  return {
    square: toSquare(fileIndex, rankFromTop),
    x,
    y,
  };
}

function promotionForMove(
  game: Chess,
  from: Square,
  to: Square,
): PieceSymbol | undefined {
  const piece = game.get(from);
  if (!piece || piece.type !== "p") return undefined;
  const targetRank = to[1];
  if (piece.color === "w" && targetRank === "8") return "q";
  if (piece.color === "b" && targetRank === "1") return "q";
  return undefined;
}

function sendEngineOptions(worker: Worker, difficulty: Difficulty) {
  const config = DIFFICULTIES[difficulty];
  worker.postMessage("setoption name Hash value 16");
  worker.postMessage(`setoption name Skill Level value ${config.skill}`);
}

function soundForMove(
  move: Move,
  game: Chess,
  actor: "self" | "opponent",
): ChessSoundEvent {
  if (game.isCheckmate()) return actor === "self" ? "game-win" : "game-loss";
  if (game.isStalemate() || game.isDraw()) return "draw";
  if (game.isCheck()) return "check";
  if (move.isCapture()) return "capture";
  if (move.isKingsideCastle() || move.isQueensideCastle()) return "castle";
  if (move.isPromotion()) return "promote";
  return actor === "self" ? "move-self" : "move-opponent";
}

function drawChessBoard({
  canvas,
  game,
  selected,
  legalMoves,
  lastMove,
  drag,
}: {
  canvas: HTMLCanvasElement;
  game: Chess;
  selected: Square | null;
  legalMoves: Move[];
  lastMove: LastMove | null;
  drag: DragState | null;
}) {
  const rect = canvas.getBoundingClientRect();
  const size = Math.max(1, Math.floor(rect.width));
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.floor(size * dpr);
  canvas.height = Math.floor(size * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const squareSize = size / 8;
  const board = game.board();
  const checkedKing = game.isCheck()
    ? game.findPiece({ type: "k", color: game.turn() })[0]
    : null;

  const drawPiece = (
    piece: { color: Color; type: PieceSymbol },
    x: number,
    y: number,
    scale = 0.72,
  ) => {
    const glyph = PIECE_GLYPHS[piece.color][piece.type];
    ctx.font = `${Math.floor(squareSize * scale)}px Georgia, "Times New Roman", serif`;
    ctx.lineWidth = Math.max(2, squareSize * 0.035);
    ctx.strokeStyle =
      piece.color === "w"
        ? "rgba(15, 23, 42, 0.72)"
        : "rgba(248, 250, 252, 0.48)";
    ctx.fillStyle = piece.color === "w" ? "#ffffff" : "#111827";
    ctx.strokeText(glyph, x, y);
    ctx.fillText(glyph, x, y);
  };

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const square = toSquare(col, row);
      const x = col * squareSize;
      const y = row * squareSize;
      const light = (row + col) % 2 === 0;

      ctx.fillStyle = light ? "#ede3cf" : "#7d6041";
      ctx.fillRect(x, y, squareSize, squareSize);

      if (lastMove && (lastMove.from === square || lastMove.to === square)) {
        ctx.fillStyle = "rgba(96, 165, 250, 0.34)";
        ctx.fillRect(x, y, squareSize, squareSize);
      }

      if (checkedKing === square) {
        const gradient = ctx.createRadialGradient(
          x + squareSize / 2,
          y + squareSize / 2,
          squareSize * 0.08,
          x + squareSize / 2,
          y + squareSize / 2,
          squareSize * 0.62,
        );
        gradient.addColorStop(0, "rgba(248, 113, 113, 0.72)");
        gradient.addColorStop(1, "rgba(127, 29, 29, 0.08)");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, squareSize, squareSize);
      }

      if (selected === square) {
        ctx.fillStyle = "rgba(250, 204, 21, 0.45)";
        ctx.fillRect(x, y, squareSize, squareSize);
      }
    }
  }

  for (const move of legalMoves) {
    const { x, y } = squareToPoint(move.to, squareSize);
    const centerX = x + squareSize / 2;
    const centerY = y + squareSize / 2;

    ctx.beginPath();
    if (move.isCapture()) {
      ctx.lineWidth = Math.max(2, squareSize * 0.055);
      ctx.strokeStyle = "rgba(17, 24, 39, 0.34)";
      ctx.arc(centerX, centerY, squareSize * 0.38, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(17, 24, 39, 0.28)";
      ctx.arc(centerX, centerY, squareSize * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const square = toSquare(col, row);
      const piece = board[row]?.[col];
      if (!piece || drag?.from === square) continue;

      const x = col * squareSize + squareSize / 2;
      const y = row * squareSize + squareSize * 0.52;
      drawPiece(piece, x, y);
    }
  }

  if (drag) {
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = squareSize * 0.16;
    ctx.shadowOffsetY = squareSize * 0.06;
    drawPiece(drag.piece, drag.x, drag.y + squareSize * 0.02, 0.82);
    ctx.restore();
  }

  ctx.font = `${Math.max(10, Math.floor(squareSize * 0.16))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const light = (row + col) % 2 === 0;
      ctx.fillStyle = light
        ? "rgba(28, 25, 23, 0.44)"
        : "rgba(255, 247, 237, 0.6)";
      if (col === 0) {
        ctx.fillText(
          String(8 - row),
          squareSize * 0.14,
          row * squareSize + squareSize * 0.2,
        );
      }
      if (row === 7) {
        ctx.fillText(
          FILES[col],
          col * squareSize + squareSize * 0.84,
          size - squareSize * 0.12,
        );
      }
    }
  }
}

export default function ChessGame() {
  const dict = useDict();
  const chessDict = dict.game.chess;
  const playChessSound = useChessSounds();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const gameRef = useRef(new Chess());
  const difficultyRef = useRef<Difficulty>("medium");
  const engineReadyRef = useRef(false);
  const engineThinkingRef = useRef(false);
  const searchFenRef = useRef<string | null>(null);

  const [fen, setFen] = useState(() => gameRef.current.fen());
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [engineReady, setEngineReady] = useState(false);
  const [engineThinking, setEngineThinkingState] = useState(false);
  const [engineFailed, setEngineFailed] = useState(false);
  const [canvasSizeTick, setCanvasSizeTick] = useState(0);

  const setEngineThinking = useCallback((next: boolean) => {
    engineThinkingRef.current = next;
    setEngineThinkingState(next);
  }, []);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(() => {
      setCanvasSizeTick((tick) => tick + 1);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawChessBoard({
      canvas,
      game: gameRef.current,
      selected,
      legalMoves,
      lastMove,
      drag,
    });
  }, [fen, selected, legalMoves, lastMove, drag, canvasSizeTick]);

  useEffect(() => {
    const worker = new Worker(STOCKFISH_SCRIPT);
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<string>) => {
      const line = String(event.data).trim();

      if (line === "uciok") {
        sendEngineOptions(worker, difficultyRef.current);
        worker.postMessage("isready");
        return;
      }

      if (line === "readyok") {
        engineReadyRef.current = true;
        setEngineReady(true);
        setEngineFailed(false);
        return;
      }

      if (!line.startsWith("bestmove ")) return;

      setEngineThinking(false);
      const bestMove = line.split(/\s+/)[1];
      const game = gameRef.current;
      const searchFen = searchFenRef.current;
      searchFenRef.current = null;

      if (!bestMove || bestMove === "(none)") return;
      if (game.fen() !== searchFen || game.turn() !== "b" || game.isGameOver()) return;

      const from = bestMove.slice(0, 2);
      const to = bestMove.slice(2, 4);
      const promotion = bestMove.slice(4, 5) || undefined;

      if (!isSquare(from) || !isSquare(to)) return;

      try {
        const move = game.move({ from, to, promotion });
        playChessSound(soundForMove(move, game, "opponent"));
        setLastMove({ from: move.from, to: move.to });
        setSelected(null);
        setLegalMoves([]);
        setFen(game.fen());
      } catch {
        setEngineFailed(true);
      }
    };

    worker.onerror = () => {
      engineReadyRef.current = false;
      setEngineReady(false);
      setEngineFailed(true);
      setEngineThinking(false);
    };

    worker.postMessage("uci");

    return () => {
      worker.postMessage("quit");
      worker.terminate();
      workerRef.current = null;
      engineReadyRef.current = false;
    };
  }, [playChessSound, setEngineThinking]);

  const requestComputerMove = useCallback(() => {
    const worker = workerRef.current;
    const game = gameRef.current;
    if (!worker || !engineReadyRef.current || engineThinkingRef.current) return;
    if (game.turn() !== "b" || game.isGameOver()) return;

    const currentFen = game.fen();
    const config = DIFFICULTIES[difficultyRef.current];
    searchFenRef.current = currentFen;
    setEngineThinking(true);
    sendEngineOptions(worker, difficultyRef.current);
    worker.postMessage(`position fen ${currentFen}`);
    worker.postMessage(`go movetime ${config.moveTimeMs}`);
  }, [setEngineThinking]);

  useEffect(() => {
    requestComputerMove();
  }, [fen, engineReady, requestComputerMove]);

  const selectSquare = useCallback((square: Square) => {
    const game = gameRef.current;
    const piece = game.get(square);
    if (!piece || piece.color !== "w") {
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    setSelected(square);
    setLegalMoves(game.moves({ square, verbose: true }));
  }, []);

  const makeUserMove = useCallback((from: Square, to: Square) => {
    const game = gameRef.current;
    const canMove = game
      .moves({ square: from, verbose: true })
      .some((move) => move.to === to);

    if (!canMove) {
      playChessSound("invalid");
      return false;
    }

    try {
      const move = game.move({
        from,
        to,
        promotion: promotionForMove(game, from, to),
      });
      playChessSound(soundForMove(move, game, "self"));
      setLastMove({ from: move.from, to: move.to });
      setSelected(null);
      setLegalMoves([]);
      setFen(game.fen());
      return true;
    } catch {
      playChessSound("invalid");
      setSelected(null);
      setLegalMoves([]);
      return false;
    }
  }, [playChessSound]);

  const handleSquareClick = useCallback(
    (square: Square) => {
      const game = gameRef.current;
      if (game.turn() !== "w" || game.isGameOver() || engineThinkingRef.current) return;

      if (!selected) {
        selectSquare(square);
        return;
      }

      if (selected === square) {
        setSelected(null);
        setLegalMoves([]);
        return;
      }

      if (!makeUserMove(selected, square)) {
        selectSquare(square);
      }
    },
    [makeUserMove, selected, selectSquare],
  );

  const handleCanvasPointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const pointer = pointerOnCanvas(canvas, event);
      if (!pointer) return;

      const game = gameRef.current;
      if (game.turn() !== "w" || game.isGameOver() || engineThinkingRef.current) return;

      const piece = game.get(pointer.square);
      if (!piece || piece.color !== "w") {
        handleSquareClick(pointer.square);
        return;
      }

      canvas.setPointerCapture(event.pointerId);
      setSelected(pointer.square);
      setLegalMoves(game.moves({ square: pointer.square, verbose: true }));
      setDrag({
        pointerId: event.pointerId,
        from: pointer.square,
        piece,
        x: pointer.x,
        y: pointer.y,
        originX: pointer.x,
        originY: pointer.y,
        moved: false,
        wasSelected: selected === pointer.square,
      });
    },
    [handleSquareClick, selected],
  );

  const handleCanvasPointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !drag || drag.pointerId !== event.pointerId) return;

      const pointer = pointerOnCanvas(canvas, event);
      if (!pointer) return;

      setDrag((current) => {
        if (!current || current.pointerId !== event.pointerId) return current;
        const distance = Math.hypot(
          pointer.x - current.originX,
          pointer.y - current.originY,
        );
        return {
          ...current,
          x: pointer.x,
          y: pointer.y,
          moved: current.moved || distance > 3,
        };
      });
    },
    [drag],
  );

  const handleCanvasPointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !drag || drag.pointerId !== event.pointerId) return;

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      const pointer = pointerOnCanvas(canvas, event);
      setDrag(null);

      if (!pointer) {
        selectSquare(drag.from);
        return;
      }

      if (drag.moved || pointer.square !== drag.from) {
        if (!makeUserMove(drag.from, pointer.square)) {
          selectSquare(drag.from);
        }
        return;
      }

      if (drag.wasSelected) {
        setSelected(null);
        setLegalMoves([]);
      }
    },
    [drag, makeUserMove, selectSquare],
  );

  const handleCanvasPointerCancel = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (canvas?.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      setDrag(null);
    },
    [],
  );

  const startNewGame = useCallback(() => {
    const worker = workerRef.current;
    if (worker) {
      worker.postMessage("stop");
      worker.postMessage("ucinewgame");
      sendEngineOptions(worker, difficultyRef.current);
      worker.postMessage("isready");
    }

    searchFenRef.current = null;
    setEngineThinking(false);
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setSelected(null);
    setLegalMoves([]);
    setLastMove(null);
    setDrag(null);
    playChessSound("start");
  }, [playChessSound, setEngineThinking]);

  const status = useMemo(() => {
    const game = gameRef.current;

    if (engineFailed) return chessDict.engineError;
    if (!engineReady) return chessDict.loadingEngine;
    if (game.isCheckmate()) {
      return game.turn() === "w" ? chessDict.stockfishWon : chessDict.youWon;
    }
    if (game.isStalemate() || game.isDraw()) return chessDict.draw;
    if (engineThinking) return chessDict.stockfishThinking;
    if (game.isCheck()) return chessDict.check;
    return chessDict.yourTurn;
  }, [chessDict, engineFailed, engineReady, engineThinking, fen]);

  const lastSan = gameRef.current.history({ verbose: true }).at(-1)?.san;
  const currentDifficultyLabel = chessDict[DIFFICULTIES[difficulty].labelKey];

  return (
    <section className="game-shell-chess flex flex-col items-center gap-3">
      <div className="text-center">
        <h1 className="font-mono text-3xl lowercase tracking-tight text-foreground">
          {chessDict.idleTitle}
        </h1>
        <p className="mt-1 max-w-lg text-xs text-muted-foreground">
          {chessDict.intro}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
        <span className="text-muted-foreground">{chessDict.difficultyLabel}</span>
        {(Object.keys(DIFFICULTIES) as Difficulty[]).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setDifficulty(level)}
            disabled={engineThinking}
            className={cn(
              "rounded-full border px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              difficulty === level
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {chessDict[DIFFICULTIES[level].labelKey]}
          </button>
        ))}
      </div>

      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <canvas
          ref={canvasRef}
          role="application"
          aria-label={chessDict.boardAria}
          tabIndex={0}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerCancel={handleCanvasPointerCancel}
          className={cn(
            "block size-full touch-none rounded-xl",
            engineThinking || gameRef.current.isGameOver()
              ? "cursor-default"
              : drag
                ? "cursor-grabbing"
                : "cursor-grab",
          )}
        />
        {engineThinking ? (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-2xl border border-white/15 bg-zinc-950/80 p-3 text-white shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                <span className="absolute size-6 animate-ping rounded-full bg-emerald-300/30" />
                <span className="size-2 rounded-full bg-emerald-200 shadow-lg" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 font-mono text-xs">
                  <span className="truncate font-semibold tracking-wide">
                    {chessDict.stockfishThinking}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/75">
                    {currentDifficultyLabel}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-8 gap-1">
                  {Array.from({ length: 8 }, (_, i) => (
                    <span
                      key={i}
                      className="h-1.5 animate-pulse rounded-full bg-white/40"
                      style={{ animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="w-full rounded-xl border border-border bg-card/80 p-3 shadow-sm backdrop-blur-sm">
        <p className="text-center font-mono text-sm text-foreground" aria-live="polite">
          {status}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
          <span>
            {lastSan
              ? chessDict.lastMoveTemplate.replace("{move}", lastSan)
              : chessDict.localEngineLabel}
          </span>
          <button
            type="button"
            onClick={startNewGame}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw className="size-3.5" />
            {chessDict.newGame}
          </button>
        </div>
      </div>
    </section>
  );
}
