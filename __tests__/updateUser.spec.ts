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
describe("Update User by id Tests", () => {
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
  
    it("PUT User Unauthorized errors 401 ", async () => {
      const res = await request(server).put(`/api/${TEST_USER.id}`).send({});
      expect(res.status).toEqual(401);
    });
  
    it("PUT User Forbidden errors 403 ", async () => {
      const res = await request(server)
        .put(`/api/${TEST_USER.id}`)
        .set("Authorization", "FaKE!")
        .send({});
      expect(res.status).toEqual(403);
    });
  
    it("PUT User Validation errors 400 ", async () => {
      const res = await request(server)
        .put(`/api/${TEST_USER.id}`)
        .set("Authorization", TEST_USER.access_token)
        .send({});
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
        ],
      });
    });
  
    it("PUT User: user email exist 400 ", async () => {
      const res = await request(server).post("/api/").send({
        name: "duplicated",
        email: TEST_ADMIN.email,
        password: "123456",
        role: "USER",
      });
      expect(res.status).toEqual(400);
      expect(res.body).toEqual({
        message: `${TEST_ADMIN.email} already has account`,
      });
    });
  });
  