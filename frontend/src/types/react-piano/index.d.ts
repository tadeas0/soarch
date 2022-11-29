declare module "react-piano" {
    export interface PianoProps {
        noteRange: NoteRange;
        playNote: NoteFn;
        stopNote: NoteFn;
        width?: number;
        activeNotes?: number[];
        keyWidthToHeight?: number;
        renderNoteLabel?: (label: {
            keyboardShortcut: KeyboardShortcut;
            midiNumber: number;
            isActive: boolean;
            isAccidental: boolean;
        }) => any;
        className?: string;
        disabled?: boolean;
        keyboardShortcuts?: ParsedShortcut[];
        onPlayNoteInput?: (
            midiNumber: number,
            prevActiveNotes: number[]
        ) => void;
        onStopNoteInput?: (
            midiNumber: number,
            prevActiveNotes: number[]
        ) => void;
    }

    interface NoteRange {
        first: number;
        last: number;
    }

    interface KeyboardShortcut {
        natural: string;
        flat: string;
        sharp: string;
    }

    interface ParsedShortcut {
        key: string;
        midiNumber: number;
    }

    type NoteFn = (midiNote: number) => void;

    // eslint-disable-next-line react/prefer-stateless-function
    export class Piano extends React.Component<PianoProps, any> {}

    export const KeyboardShortcuts: {
        BOTTOM_ROW: KeyboardShortcut[];
        HOME_ROW: KeyboardShortcut[];
        QWWERTY_ROW: KeyboardShortcut[];
        create: (params: {
            firstNote: number;
            lastNote: number;
            keyboardConfig: KeyboardShortcut[];
        }) => ParsedShortcut[];
    };
}
