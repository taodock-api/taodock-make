import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { test, describe } from "node:test";
import assert from "node:assert/strict";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const loadJson = (relative) => JSON.parse(readFileSync(join(root, relative), "utf8"));

describe("app files", () => {
  test("base.json defines baseUrl and auth header", () => {
    const base = loadJson("base.json");
    assert.equal(base.baseUrl, "https://taodock.com/v1");
    assert.equal(base.headers.Authorization, "Bearer {{connection.apiKey}}");
    assert.ok(base.log.sanitize.includes("request.headers.Authorization"));
  });

  test("connection.json is an api key connection with a test request", () => {
    const connection = loadJson("connection.json");
    const apiKey = connection.parameters.find((p) => p.name === "apiKey");
    assert.ok(apiKey, "apiKey parameter missing");
    assert.equal(apiKey.type, "password");
    assert.equal(apiKey.required, true);
    assert.ok(connection.communication.url.includes("/models"));
    assert.ok(connection.communication.log.sanitize.includes("request.headers.Authorization"));
  });
});

describe("modules", () => {
  const modules = readdirSync(join(root, "modules")).filter((f) => f.endsWith(".json"));

  test("all expected modules exist", () => {
    const names = modules.map((f) => loadJson(`modules/${f}`).name).sort();
    assert.deepEqual(names, [
      "createVideo",
      "downloadVideo",
      "generateImage",
      "getVideoStatus",
      "listModels",
    ]);
  });

  for (const file of modules) {
    test(`${file} is structurally valid`, () => {
      const mod = loadJson(`modules/${file}`);
      for (const key of ["name", "label", "type", "communication", "parameters", "interface"]) {
        assert.ok(key in mod, `${file} missing ${key}`);
      }
      assert.ok(["action", "search"].includes(mod.type), `${file} bad type`);
      assert.ok(mod.communication.url, `${file} missing url`);
      assert.ok(mod.communication.method, `${file} missing method`);
      for (const param of mod.parameters) {
        assert.ok(param.name && param.type && param.label, `${file} bad parameter ${param.name}`);
      }
      for (const field of mod.interface) {
        assert.ok(field.name && field.type && field.label, `${file} bad interface field`);
      }
      if (mod.type === "search") {
        assert.ok(mod.communication.iterate, `${file} search module must iterate`);
      }
    });
  }

  test("every module references the apiKey connection", () => {
    for (const file of modules) {
      assert.equal(loadJson(`modules/${file}`).connection, "apiKey", `${file} connection mismatch`);
    }
  });

  test("no secrets or hardcoded keys anywhere", () => {
    const files = ["base.json", "connection.json", ...modules.map((f) => `modules/${f}`)];
    for (const file of files) {
      const raw = readFileSync(join(root, file), "utf8");
      assert.ok(!/sk-[a-zA-Z0-9]{10,}/.test(raw), `${file} contains a hardcoded key`);
    }
  });
});
