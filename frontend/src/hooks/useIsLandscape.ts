import { useMediaQuery } from "react-responsive";

const useIsLandscape = () => useMediaQuery({ orientation: "landscape" });

export default useIsLandscape;
