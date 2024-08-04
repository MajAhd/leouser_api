import { Request, Response } from "express";
import { client, initElastic } from "../configs/elasticsearchConfig";
import { validationResult } from "express-validator";
import { UserService } from "../services/userService";

/**
 * Create User with basic info by user
 * @param req
 * @param res
 * @returns
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password, role } = req.body;
    const user = await new UserService();

    const userExisted = await user.getUserByEmail(email);
    if (userExisted) {
      return res.status(400).json({
        message: `${email} already has account`,
      });
    }
    const newUser = await user.newUser({
      name,
      email,
      password,
      role,
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get User info with user id
 * @param req
 * @param res
 */
export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userInfo = await new UserService().getUserById(id, [
      "id",
      "name",
      "email",
      "role",
    ]);
    if (userInfo) {
      return res.status(200).json(userInfo);
    }
    return res.status(404).json({ message: "User is not exist" });
  } catch (error: any) {
    console.error(error);
    if (error["meta"]["body"]["found"] === false) {
      return res.status(404).json({ message: "User is not exist!" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update User info by user role is not included
 * @param req
 * @param res
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { name, email, password } = req.body;
    const user = new UserService();

    const userExisted = await user.getUserById(id);
    if (!userExisted) {
      return res.status(400).json({ message: "User is not exist" });
    }
    if (userExisted.email !== email) {
      const isDuplicatedEmail = await user.getUserByEmail(email);
      if (isDuplicatedEmail) {
        return res
          .status(400)
          .json({ message: `${email} already has account` });
      }
    }

    const updatedUser = await user.updateInfo(id, { name, email, password });
    return res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error(error);
    if (error["meta"]["statusCode"] === 404) {
      return res.status(404).json({ message: "User is not exist!" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

//  Admin Only Scope

/**
 * Get All Users Admin only
 * @param req
 * @param res
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await client.search({
      index: "users",
      query: { match_all: {} },
    });
    res.status(200).json(result.hits.hits.map((hit) => hit._source));
  } catch (error) {
    console.error(error);
  }
};

/**
 * Update User Role Admin Only
 * @param req
 * @param res
 * @returns
 */
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { role } = req.body;
    const user = new UserService();
    const userExisted = await user.getUserById(id);
    if (!userExisted) {
      return res.status(400).json({ message: "User is not exist" });
    }
    const updatedUserRole = await user.updateRole(id, { role });
    return res.status(200).json(updatedUserRole);
  } catch (error: any) {
    console.error(error);
    if (error["meta"]["body"]["found"] === false) {
      return res.status(404).json({ message: "User is not exist!" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete User Admin only
 * @param req
 * @param res
 * @returns
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await new UserService().deleteUser(id);
    res.status(204).send({});
  } catch (error: any) {
    console.error(error);
    if (error["meta"]["statusCode"] === 404) {
      return res.status(404).json({ message: "User is not exist!" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
