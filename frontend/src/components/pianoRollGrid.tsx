import * as React from "react";
import { FunctionComponent } from "react";
import "./pianoRoll.css";
import * as Tone from "tone";
import { PIANO_ROLL_LOWEST_NOTE } from "../constants";

interface PianoRollGridProps {
    noteGrid: boolean[][];
    onRightClick?: (ri: number, ci: number) => void;
    onMouseDown?: (ri: number, ci: number) => void;
    onMouseOver?: (
        e: React.MouseEvent<HTMLElement>,
        ri: number,
        ci: number
    ) => void;
    noteWidth: number;
    noteHeight: number;
}

// TODO: cleanup event handling
const PianoRollGrid: FunctionComponent<PianoRollGridProps> = ({
    noteGrid,
    onRightClick = (ri: number, ci: number) => {},
    onMouseDown = (ri: number, ci: number) => {},
    onMouseOver = (
        e: React.MouseEvent<HTMLElement>,
        ri: number,
        ci: number
    ) => {},
    noteWidth,
    noteHeight,
}: PianoRollGridProps) => {
    const renderNotes = () => {
        let rows = noteGrid.map((row, ri) => {
            const entry = row.map((i, ci) => (
                <td
                    className={i ? "active" : "inactive"}
                    onMouseDown={() => onMouseDown(ri, ci)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        onRightClick(ri, ci);
                    }}
                    onMouseOver={(e) => onMouseOver(e, ri, ci)}
                    key={ci}
                ></td>
            ));
            return (
                <tr
                    className={isBlackKey(ri) ? "blackkey" : "whitekey"}
                    key={ri}
                >
                    {entry}
                </tr>
            );
        });

        return rows;
    };

    const isBlackKey = (row: number) => {
        return Tone.Frequency(PIANO_ROLL_LOWEST_NOTE)
            .transpose(noteHeight - row - 1)
            .toNote()
            .includes("#");
    };

    return (
        <table>
            <tbody>{renderNotes()}</tbody>
        </table>
    );
};

export default PianoRollGrid;
