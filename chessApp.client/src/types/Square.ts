import { Coordinate } from './Coordinate';
import { Piece } from './Piece';

export type Square = {
    position: Coordinate,
    visibleNotation: boolean,
    piece: Piece | null,
}