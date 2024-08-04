import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config({ path: ".env.test" });

// drop any proxy configuration
delete process.env["http_proxy"];
delete process.env["https_proxy"];
