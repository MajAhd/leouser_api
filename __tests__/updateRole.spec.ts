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


describe("Update UserRole Tests", () => {
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
  
    it("POST Update UserRole  Unauthorized errors 401 ", async () => {
      const res = await request(server)
        .post(`/api/${TEST_USER.id}/role`)
        .send({});
      expect(res.status).toEqual(401);
    });
  
    it("POST Update UserRole  Forbidden errors 403 ", async () => {
      const res = await request(server)
        .post(`/api/${TEST_USER.id}/role`)
        .set("Authorization", TEST_USER.access_token)
        .send({});
      expect(res.status).toEqual(403);
    });
  
    it("POST Update UserRole  Validation errors 400 ", async () => {
      const res = await request(server)
        .post(`/api/${TEST_USER.id}/role`)
        .set("Authorization", TEST_ADMIN.access_token)
        .send({});
      expect(res.status).toEqual(400);
      expect(res.body).toEqual({
        errors: [
          {
            type: "field",
            msg: "Role must be Admin or User",
            path: "role",
            location: "body",
          },
        ],
      });
    });
  
    it("POST Update UserRole  Wrong id errors 400 ", async () => {
      const res = await request(server)
        .post("/api/FAKE-ID/role")
        .set("Authorization", TEST_ADMIN.access_token)
        .send({
          role: "USER"
        });
      expect(res.status).toEqual(404);
      expect(res.body).toEqual({
        message: "User is not exist!",
      });
    });
  });
  