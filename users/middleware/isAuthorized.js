const jwt = require("jsonwebtoken");
const secretToken = require("../config/secret");

const isAuthorized = async (req, res, next) => {
  try {
    const token = extractToken(req);
    console.log(token);
    let secret = secretToken();

    const tokenData = await jwt.decode(token, secret);
    if (tokenData) {
      req.userData = tokenData;
      return next();
    } else {
      return res.json({
        status: "error",
        message: "unthorized",
      });
    }
    console.log("tokenData :>> ", tokenData);
  } catch (error) {
    console.log("error :>> ", error);
    return res.json({
      status: "error",
      message: "unthorized",
    });
  }
};

function extractToken(req) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}

module.exports = isAuthorized;
