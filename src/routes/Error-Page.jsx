import { useRouteError } from "react-router-dom";
import { Link } from "react-router-dom";


export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <br />
        <i>{error.statusText || error.message}</i>
      </p>
      <br />
      <Link to="/">
        <h4>Return to Homepage</h4>
    </Link>
    </div>
  );
}
