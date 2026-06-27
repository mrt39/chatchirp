//CORS configuration

//define the allowed origin for CORS, using environment variable if available or fallback to production URL
const ALLOWED_ORIGIN = process.env.CLIENT_URL || "https://www.chatchirp.online";

//custom CORS middleware function for manual CORS handling
const corsMiddleware = (req, res, next) => {
  //set basic CORS headers to allow cross-origin requests from our client
  res.header("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  //enable credentials (cookies, authorization headers, etc)
  res.header("Access-Control-Allow-Credentials", "true");
  //allowed HTTP methods
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH");
  //allowed request headers
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-User-Id");
  
  //handle preflight OPTIONS requests by responding with 204 status (no content)
  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }
  
  //continue to next middleware for non-OPTIONS requests
  next();
};

//configuration object for the cors package
const corsOptions = {
  //allow requests only from our client domain
  origin: ALLOWED_ORIGIN,
  //allow cookies and auth headers
  credentials: true,
  //allowed HTTP methods
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  //allowed request headers
  allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization,X-CSRF-Token,Accept-Version,Content-Length,Content-MD5,Date,X-Api-Version,X-User-Id"
};

module.exports = { corsMiddleware, ALLOWED_ORIGIN, corsOptions };