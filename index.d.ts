declare module 'react-chess' {
  export interface ChessProps {
    allowMoves?: boolean;
    highlightTarget?: boolean;
    drawLabels?: boolean;
    lightSquareColor?: string;
    darkSquareColor?: string;
    pieces: string[];
    onMovePiece?: (piece: any, fromSquare: string, toSquare: string) => any;
    onDragStart?: (piece: any, fromSquare: string) => any;
  }
  let Chess: (props: ChessProps) => JSX.Element;
  export default Chess;
}
