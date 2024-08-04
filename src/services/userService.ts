import bcrypt from "bcryptjs";
import crypto from "crypto";
import { iUser, iUserInfo, UserAbstract } from "../models/userModel";
import { v4 as uuidv4 } from "uuid";

/**
 * UserService class to handle business logic
 */
export class UserService extends UserAbstract {
  constructor() {
    super();
  }

  async getUserByAccessToken(
    access_token: string
  ): Promise<iUserInfo | undefined> {
    const result = await this.searchUserField({ access_token }, [
      "id",
      "access_token",
      "role",
    ]);

    if (!result) {
      return undefined;
    }
    return result[0] as iUserInfo;
  }

  async getUserByEmail(email: string): Promise<iUserInfo | undefined> {
    const result = await this.searchUserField({ email }, [
      "id",
      "email",
      "role",
    ]);

    if (!result) {
      return undefined;
    }
    return result[0] as iUserInfo;
  }

  async updateInfo(
    id: string,
    userData: Pick<iUser, "name" | "email" | "password">
  ): Promise<Object> {
    await this.updateUser(id, userData);
    const result = await this.getUserById(id, ["id", "name", "email", "role"]);
    return result as iUserInfo;
  }
  async updateRole(id: string, userData: Pick<iUser, "role">): Promise<Object> {
    await this.updateUser(id, userData);
    const result = await this.getUserById(id, ["id", "name", "email", "role"]);
    return result as iUserInfo;
  }

  async newUser(user: Pick<iUser, "name" | "email" | "password" | "role">) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const accessToken = crypto.randomBytes(16).toString("hex");
    const newUser: iUser = {
      id: uuidv4(),
      name: user.name,
      email: user.email,
      password: hashedPassword,
      role: user.role,
      access_token: accessToken,
    };
    await this.createUser(newUser);
    return newUser;
  }

  async getAllUsers(): Promise<iUserInfo[]> {
    const result = await this.searchUser({ match_all: {} }, [
      "name",
      "email",
      "role",
    ]);
    return result;
  }
}
