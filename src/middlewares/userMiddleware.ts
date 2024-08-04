import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";

export const userAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers["authorization"];
  if (!accessToken) {
    return res.status(401).send({message: "Unauthorized"});
  }
  const userToken = await new UserService().getUserByAccessToken(accessToken);
  if (userToken && ["USER", "ADMIN"].includes(userToken.role )) {
    return next();
  }
  return res.status(403).send({message: "Forbidden"});
};

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers["authorization"];
  if (!accessToken) {
    return res.status(401).send({message: "Unauthorized"});
  }
  const userToken = await new UserService().getUserByAccessToken(accessToken);
  if (userToken && userToken.role == "ADMIN") {
    return next();
  }
  return res.status(403).send({message: "Forbidden"});
};
