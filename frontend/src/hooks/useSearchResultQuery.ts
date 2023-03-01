import { useQueryClient } from "react-query";
import { SEARCH_RESULT_KEY } from "../constants";
import { usePianoRollStore } from "../stores/pianoRollStore";

const useSearchResultQuery = () => {
    const qc = useQueryClient();
    const selectedIndex = usePianoRollStore((state) => state.selectedIndex);

    const invalidate = () => {
        if (!qc.isFetching([SEARCH_RESULT_KEY, selectedIndex])) {
            qc.invalidateQueries([SEARCH_RESULT_KEY, selectedIndex]);
        }
    };

    return invalidate;
};

export default useSearchResultQuery;
