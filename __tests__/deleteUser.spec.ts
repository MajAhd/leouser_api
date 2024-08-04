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

describe("Delete User Tests", () => {
  let user = new UserService();
  let TEST_USER: any;
  let TEST_ADMIN: any;

  beforeAll(async () => {
    TEST_USER = await user.newUser(USER_INFO);
    TEST_ADMIN = await user.newUser(ADMIN_INFO);
    console.log("Wait 3 sec to update elastic test data!");
    await delay(3000);
  });

  afterAll(async () => {
    await user.deleteUser(TEST_USER.id);
    await user.deleteUser(TEST_ADMIN.id);
    server.close();
  });

  it("DELETE User  Unauthorized errors 401 ", async () => {
    const res = await request(server).delete(`/api/${TEST_USER.id}`);
    expect(res.status).toEqual(401);
  });

  it("DELETE User  Forbidden errors 403 ", async () => {
    const res = await request(server)
      .delete(`/api/${TEST_USER.id}`)
      .set("Authorization", TEST_USER.access_token);
    expect(res.status).toEqual(403);
  });

  it("DELETE User  Wrong id errors 400 ", async () => {
    const res = await request(server)
      .delete("/api/FAKE-ID")
      .set("Authorization", TEST_ADMIN.access_token);
    expect(res.status).toEqual(404);
    expect(res.body).toEqual({
      message: "User is not exist!",
    });
  });
});
