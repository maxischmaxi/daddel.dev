# Local Stockfish assets

These files are vendored from the npm package `stockfish@18.0.7` by Nathan Rugg / Chess.com.

Included runtime files:

- `stockfish-18-lite-single.js`
- `stockfish-18-lite-single.wasm`
- `Copying.txt` (GPLv3 license text)

The app loads these files from `/stockfish/` so the chess engine never depends on an external CDN at runtime.
