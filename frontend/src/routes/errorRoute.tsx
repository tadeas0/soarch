import { FunctionComponent } from "react";
import { useRouteError } from "react-router-dom";
import { BiError } from "react-icons/bi";
import "./errorRoute.css";

const ErrorRoute: FunctionComponent = () => {
    const error = useRouteError();
    console.error(error);

    return (
        <div className="error-route">
            <div className="error-icon">
                <BiError />
            </div>
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
        </div>
    );
};

export default ErrorRoute;
