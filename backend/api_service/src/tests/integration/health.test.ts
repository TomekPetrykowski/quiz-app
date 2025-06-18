import { createServer } from "../../server";
import supertest from "supertest";

describe("Health Check Endpoint", () => {
  let server: ReturnType<typeof createServer>;

  beforeAll(async () => {
    server = createServer();
  });

  it("should return a 200 status and a message", async () => {
    await supertest(server)
      .get("/health")
      .expect(200)
      .then((res) => {
        expect(res.body.ok).toBe(true);
      });
  });
});
