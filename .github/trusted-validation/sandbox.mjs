import { spawnSync, spawn } from "node:child_process";
import { cp, mkdir, readdir, writeFile } from "node:fs/promises";

const mode = process.argv[2];
const run = (program, args) => {
  const result = spawnSync(program, args, { cwd: "/work", stdio: "inherit", timeout: 300_000 });
  if (result.error || result.status !== 0) throw new Error("Sandbox command failed; no successful fallback.");
};
if (process.versions.node !== "24.21.0") throw new Error("Sandbox Node differs from the pinned runtime.");
if (mode === "install") {
  for (const name of await readdir("/input")) {
    if (name !== ".git" && name !== "node_modules" && name !== ".github") {
      await cp(`/input/${name}`, `/work/${name}`, { recursive: true, dereference: false, errorOnExist: true, force: false });
    }
  }
  run("node", ["/trusted/node_modules/npm/bin/npm-cli.js", "ci", "--ignore-scripts", "--no-audit", "--no-fund"]);
} else if (mode === "typecheck") {
  await writeFile("/work/.trusted-tsconfig.json", JSON.stringify({
    compilerOptions: {
      target: "ES2023", lib: ["ES2023", "DOM", "DOM.Iterable"], module: "ESNext",
      moduleResolution: "Bundler", jsx: "react-jsx", strict: true, noEmit: true,
      skipLibCheck: false, types: [], allowImportingTsExtensions: true,
    },
    include: ["src/**/*.ts", "src/**/*.tsx"],
  }));
  run("node", ["/trusted/node_modules/typescript/bin/tsc", "--project", "/work/.trusted-tsconfig.json"]);
} else if (mode === "build") {
  run("node", ["/trusted/node_modules/vite/bin/vite.js", "build", "/work"]);
} else if (mode === "serve") {
  await mkdir("/work/.tmp", { recursive: true });
  const child = spawn("node", ["/trusted/node_modules/vite/bin/vite.js", "preview", "/work", "--host", "0.0.0.0", "--port", "4173", "--strictPort"], {
    cwd: "/work", stdio: "inherit",
  });
  child.on("error", () => { process.exitCode = 1; });
  child.on("exit", code => { process.exitCode = code ?? 1; });
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
} else throw new Error("Unknown fixed sandbox operation.");
