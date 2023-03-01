import { useMediaQuery } from "react-responsive";

const useIsXlScreen = () => useMediaQuery({ minWidth: 1280 });

export default useIsXlScreen;
