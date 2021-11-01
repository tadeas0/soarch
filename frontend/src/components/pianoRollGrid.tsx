import * as React from "react";
import { FunctionComponent, useState, useEffect } from "react";
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
}: PianoRollGridProps) => {
    const [currentBeat, setCurrentBeat] = useState(0);

    useEffect(() => {
        setInterval(() => {
            const bbs = Tone.Transport.position.toString().split(":");
            const beat =
                parseInt(bbs[0]) * 16 +
                parseInt(bbs[1]) * 4 +
                parseInt(bbs[2]) * 1;
            setCurrentBeat(beat);
        }, 100);
    }, []);

    const renderNotes = () => {
        let rows = noteGrid.map((row, ri) => {
            const entry = row.map((i, ci) => (
                <td
                    className={
                        (i ? "active" : "inactive") +
                        (ci === currentBeat ? " beat" : "")
                    }
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
            .transpose(noteGrid.length - row - 1)
            .toNote()
            .includes("#");
    };

    return (
        <div className="table-container">
            <table>
                <tbody>{renderNotes()}</tbody>
            </table>
        </div>
    );
};

export default PianoRollGrid;
