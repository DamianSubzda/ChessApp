import { Piece } from './Piece';

export type Square = {
    row: number,
    column: number,
    position: string,
    piece: Piece | null,
}