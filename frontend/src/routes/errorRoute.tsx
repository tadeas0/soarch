import { FunctionComponent } from "react";
import { useRouteError } from "react-router-dom";
import { BiError } from "react-icons/bi";

const ErrorRoute: FunctionComponent = () => {
    const error = useRouteError();
    console.error(error);

    return (
        <div className="align-center mt-32 flex flex-col items-center justify-center text-black">
            <div className="text-warn">
                <BiError size={128} />
            </div>
            <h1 className="text-4xl">Oops!</h1>
            <p className="text-lg">Sorry, an unexpected error has occurred.</p>
        </div>
    );
};

export default ErrorRoute;
