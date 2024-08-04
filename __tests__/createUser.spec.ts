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

describe("Create user tests", () => {
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

  it("Post User Validation errors 400 ", async () => {
    const res = await request(server).post("/api/").send({});
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({
      errors: [
        {
          type: "field",
          msg: "name must be at least 180 characters long",
          path: "name",
          location: "body",
        },
        {
          type: "field",
          msg: "Email must be valid",
          path: "email",
          location: "body",
        },
        {
          type: "field",
          msg: "Password must be at least 8 characters long",
          path: "password",
          location: "body",
        },
        {
          type: "field",
          msg: "Role must be Admin or User",
          path: "role",
          location: "body",
        },
      ],
    });
  });

  it("Post User: user exist 400 ", async () => {
    const res = await request(server).post("/api/").send({
      name: "duplicated",
      email: "test@email.com",
      password: "123456",
      role: "USER",
    });
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({
      message: "test@email.com already has account",
    });
  });

  it("Post User created successfully 201 ", async () => {
    const res = await request(server).post("/api/").send({
      name: "user test",
      email: "success@email.com",
      password: "123456",
      role: "USER",
    });
    await user.deleteUser(res.body.id);
    expect(res.status).toEqual(201);
    expect(typeof res.body).toEqual("object");
    expect(res.body.email).toEqual("success@email.com");
    expect(res.body.name).toEqual("user test");
    expect(res.body.role).toEqual("USER");
  });
});
