import request from "supertest";
import server from "../src/index";
import { UserService } from "../src/services/userService";
import { iUser } from "../src/models/userModel";

const delay = (ms: number | undefined) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const USER_INFO: Pick<iUser, "name" | "email" | "password" | "role"> = {
  name: "user test",
  email: "test@email.com",
  password: "123456",
  role: "USER",
};
const ADMIN_INFO: Pick<iUser, "name" | "email" | "password" | "role"> = {
  name: "admin test",
  email: "admin@email.com",
  password: "123456",
  role: "ADMIN",
};

describe("Get User(s) Tests", () => {
  let user = new UserService();
  let TEST_USER: any;

  beforeAll(async () => {
    TEST_USER = await user.newUser(USER_INFO);
    console.log("Wait 3 sec to update elastic test data!");
    await delay(3000);
  });

  afterAll(async () => {
    await user.deleteUser(TEST_USER.id);
    server.close();
  });

  it("Get User Unauthorized errors 401 ", async () => {
    const res = await request(server).get(`/api/`).send({});
    expect(res.status).toEqual(401);
  });

  it("Get User Forbidden errors 403 ", async () => {
    const res = await request(server)
      .get(`/api/`)
      .set("Authorization", TEST_USER.access_token)
      .send({});
    expect(res.status).toEqual(403);
  });
});
