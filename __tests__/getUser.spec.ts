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
describe("Get user info by id tests", () => {
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

  it("Get User by id Unauthorized 401 ", async () => {
    const res = await request(server).get("/api/FAKE-ID");
    expect(res.status).toEqual(401);
    expect(res.body).toEqual({ message: "Unauthorized" });
  });

  it("Get User by id Forbidden 403 ", async () => {
    const res = await request(server)
      .get("/api/FAKE-ID")
      .set("Authorization", "FaKE!");
    expect(res.status).toEqual(403);
    expect(res.body).toEqual({ message: "Forbidden" });
  });

  it("Get User by wrong id and correct Authorization 404", async () => {
    const res = await request(server)
      .get(`/api/FAKE-ID`)
      .set("Authorization", TEST_USER.access_token)
      .set("Accept", "application/json");

    expect(res.status).toEqual(404);
    expect(res.body).toEqual({
      message: "User is not exist!",
    });
  });

  it("Get User 200 Ok", async () => {
    const res = await request(server)
      .get(`/api/${TEST_USER.id}`)
      .set("Authorization", TEST_USER.access_token);
    expect(res.status).toEqual(200);
    expect(typeof(res.body)).toEqual("object");
  });

  it("Get User by Admin 200 Ok", async () => {
    const res = await request(server)
      .get(`/api/${TEST_USER.id}`)
      .set("Authorization", TEST_ADMIN.access_token);
    expect(res.status).toEqual(200);
    expect(typeof(res.body)).toEqual("object");
  });
});
