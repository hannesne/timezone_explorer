import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const trusted = dirname(fileURLToPath(import.meta.url));
const digest = bytes => "sha256:" + createHash("sha256").update(bytes).digest("hex");
const gitBlob = bytes => createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
const requiredScripts = ["dev", "typecheck", "test:unit", "build", "test:e2e"];

export async function validateCandidate(directory) {
  const candidate = resolve(directory);
  const sourceFiles = [];
  let sourceBytes = 0;
  const walk = async (path, relative = "") => {
    for (const name of await readdir(path)) {
      if ([".git", ".github", "node_modules", "dist"].includes(name)) continue;
      const relativePath = relative ? `${relative}/${name}` : name;
      const entry = await lstat(join(path, name));
      if (entry.isSymbolicLink()) throw new Error("Candidate symlinks are not permitted at this isolation boundary.");
      if (/(^|\/)(\.env(?:\..*)?|.*\.(pem|key)|id_rsa)$/.test(relativePath)
        && !/\.env\.(sample|example)$/.test(relativePath)) throw new Error("Forbidden credential-bearing candidate path.");
      if (entry.isDirectory()) await walk(join(path, name), relativePath);
      else if (entry.isFile()) {
        sourceBytes += entry.size;
        if (sourceBytes > 20 * 1024 * 1024) throw new Error("Candidate source exceeds the bounded initial-app acceptance contract.");
        const content = (await readFile(join(path, name))).toString("utf8");
        if (/(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|https?:\/\/[^/\s]+:[^/\s]+@)/i.test(content)) {
          throw new Error("Credential-shaped candidate content is forbidden; no content is logged.");
        }
        sourceFiles.push(relativePath);
      }
      else throw new Error("Unsupported candidate filesystem object.");
    }
  };
  await walk(candidate);
  for (const file of ["package.json", "package-lock.json", "index.html", "tsconfig.json"]) {
    if (!sourceFiles.includes(file)) throw new Error(`Missing required application file: ${file}. Setup cannot pass app acceptance.`);
  }
  if (!sourceFiles.some(file => /^src\/.+\.tsx?$/.test(file))) throw new Error("Missing actual TypeScript application source.");
  const manifest = JSON.parse(await readFile(join(candidate, "package.json"), "utf8"));
  const lock = JSON.parse(await readFile(join(candidate, "package-lock.json"), "utf8"));
  if (!manifest || typeof manifest !== "object" || !manifest.dependencies?.react || !manifest.dependencies?.["react-dom"]) {
    throw new Error("The candidate must contain the selected React application dependencies.");
  }
  if (requiredScripts.some(name => typeof manifest.scripts?.[name] !== "string" || !manifest.scripts[name].trim())) {
    throw new Error("Required application command interfaces are missing; no script success fallback is permitted.");
  }
  if (lock.lockfileVersion !== 3 || !lock.packages?.[""]) throw new Error("An npm-generated v3 application lockfile is required.");
  return { manifest, sourceFiles };
}

export function countTests(kind, result) {
  if (kind === "UnitTests") {
    if (!Number.isSafeInteger(result.numTotalTests) || result.numTotalTests !== 7
      || result.numPassedTests !== 7 || result.numFailedTests !== 0 || result.numPendingTests !== 0) {
      throw new Error("Required trusted Vitest tests were missing, skipped, zero, or failed.");
    }
    return result.numTotalTests;
  }
  const tests = [];
  const visit = suites => {
    if (!Array.isArray(suites)) throw new Error("Incomplete Playwright suites.");
    for (const suite of suites) {
      for (const spec of suite.specs ?? []) for (const test of spec.tests ?? []) tests.push(test);
      visit(suite.suites ?? []);
    }
  };
  visit(result.suites);
  if (tests.length !== 4 || tests.some(test => test.expectedStatus !== "passed"
    || test.results?.length !== 1 || test.results[0].status !== "passed") || result.errors?.length) {
    throw new Error("Required trusted Playwright cases were missing, skipped, zero, retried, or failed.");
  }
  return tests.length;
}

function command(program, args, options = {}) {
  return new Promise((resolveCommand, reject) => {
    const output = [];
    const errors = [];
    let bytes = 0;
    let limit = false;
    const child = spawn(program, args, { cwd: options.cwd, env: options.env ?? process.env, stdio: ["ignore", "pipe", "pipe"] });
    let hardTimer;
    const terminate = () => {
      child.kill("SIGTERM");
      hardTimer ??= setTimeout(() => child.kill("SIGKILL"), 1000);
      hardTimer.unref();
    };
    const timer = setTimeout(terminate, options.timeout ?? 300_000);
    const collect = destination => chunk => {
      bytes += chunk.length;
      if (bytes > 8 * 1024 * 1024) { limit = true; terminate(); }
      else destination.push(chunk);
    };
    child.stdout.on("data", collect(output));
    child.stderr.on("data", collect(errors));
    child.on("error", () => { clearTimeout(timer); clearTimeout(hardTimer); reject(new Error("Trusted runner command could not start.")); });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      clearTimeout(hardTimer);
      if (limit || signal) reject(new Error("Trusted runner command exceeded bounded output/time."));
      else resolveCommand({ code, stdout: Buffer.concat(output).toString(), stderr: Buffer.concat(errors).toString() });
    });
  });
}

export async function runAcceptance({ candidate, criterion, output }) {
  // Validate the actual app before loading tools or allocating containers.
  await validateCandidate(candidate);
  const policy = JSON.parse(await readFile(join(trusted, "policy.json"), "utf8"));
  const check = policy.checks.find(item => item.criterionId === criterion);
  if (!check || policy.version !== 1 || process.versions.node !== policy.runtime.nodeVersion
    || !/^docker\.io\/library\/node@sha256:[0-9a-f]{64}$/.test(policy.sandboxImage)) {
    throw new Error("Unrecognized acceptance criterion, immutable sandbox image, or pinned runtime.");
  }
  const metadata = {
    version: 1, criterionId: criterion, checkName: check.checkName,
    runId: process.env.GITHUB_RUN_ID, runAttempt: Number(process.env.GITHUB_RUN_ATTEMPT),
    candidateHeadSha: process.env.CANDIDATE_HEAD_SHA,
    testedRevisionKind: process.env.TESTED_REVISION_KIND, mergeBaseSha: process.env.MERGE_BASE_SHA || null,
  };
  if (!/^\d+$/.test(metadata.runId ?? "") || !Number.isSafeInteger(metadata.runAttempt) || metadata.runAttempt < 1
    || !/^[0-9a-f]{40}$/.test(metadata.candidateHeadSha ?? "")
    || !["Head", "Merge"].includes(metadata.testedRevisionKind)) throw new Error("Missing authoritative run/source metadata.");
  const source = await command("git", ["-C", candidate, "rev-parse", "HEAD"]);
  if (source.code !== 0 || !/^[0-9a-f]{40}$/.test(source.stdout.trim())) throw new Error("Immutable candidate checkout is unavailable.");
  metadata.testedSha = source.stdout.trim();
  if (metadata.testedSha !== process.env.GITHUB_SHA
    || (metadata.testedRevisionKind === "Head" && metadata.testedSha !== metadata.candidateHeadSha)
    || (metadata.testedRevisionKind === "Merge" && !/^[0-9a-f]{40}$/.test(metadata.mergeBaseSha ?? ""))) {
    throw new Error("Workflow checkout/source kind does not match the actual provider context.");
  }
  const workflow = await readFile(join(candidate, ".github/workflows/timezone-acceptance.yml"));
  const npmVersion = await command("node", [join(trusted, "node_modules/npm/bin/npm-cli.js"), "--version"]);
  if (npmVersion.code !== 0 || npmVersion.stdout.trim() !== policy.runtime.npmVersion) throw new Error("Trusted npm differs from its pin.");
  const reportDirectory = resolve(output);
  const sourceDirectory = resolve(candidate);
  if (reportDirectory === sourceDirectory || reportDirectory.startsWith(sourceDirectory + "/")
    || reportDirectory === trusted || reportDirectory.startsWith(trusted + "/")) {
    throw new Error("Trusted reports must be outside every generated-code writable/exposed mount.");
  }
  await mkdir(reportDirectory, { recursive: true, mode: 0o700 });
  const scratch = await mkdtemp(join(tmpdir(), "timezone-untrusted-"));
  const work = join(scratch, "work");
  await mkdir(work);
  const name = `timezone-v1-${randomUUID()}`;
  const network = `${name}-network`;
  const uid = String(process.getuid());
  const gid = String(process.getgid());
  const base = ["--read-only", "--cap-drop=ALL", "--security-opt=no-new-privileges", "--pids-limit=128",
    "--memory=2g", "--cpus=2", "--user", `${uid}:${gid}`, "--tmpfs", "/tmp:rw,nosuid,nodev,size=512m",
    "--mount", `type=bind,source=${work},target=/work`,
    "--mount", `type=bind,source=${trusted},target=/trusted,readonly`,
    "--env", "HOME=/tmp", "--env", "CI=true"];
  const logs = [];
  let networkCreated = false;
  let serverStarted = false;
  const checked = async (program, args, options) => {
    const result = await command(program, args, options);
    logs.push({ program, operation: program === "docker" ? args[0] : "trusted-tool", code: result.code, stdout: result.stdout, stderr: result.stderr });
    if (result.code !== 0) throw new Error("A fixed trusted acceptance command failed.");
    return result;
  };
  let executedTests = null;
  let failure = null;
  try {
    await checked("docker", ["pull", policy.sandboxImage]);
    await checked("docker", ["run", "--rm", ...base, "--network=bridge",
      "--mount", `type=bind,source=${sourceDirectory},target=/input,readonly`,
      policy.sandboxImage, "node", "/trusted/sandbox.mjs", "install"]);
    if (criterion !== "clean-install") {
      await checked("docker", ["run", "--rm", ...base, "--network=none", policy.sandboxImage, "node", "/trusted/sandbox.mjs", "typecheck"]);
    }
    if (["build", "timezone-tests", "browser"].includes(criterion)) {
      await checked("docker", ["run", "--rm", ...base, "--network=none", policy.sandboxImage, "node", "/trusted/sandbox.mjs", "build"]);
    }
    if (["timezone-tests", "browser"].includes(criterion)) {
      await checked("docker", ["network", "create", "--internal", network]);
      networkCreated = true;
      await checked("docker", ["run", "--detach", "--name", name, ...base, "--network", network,
        "--publish", "127.0.0.1::4173", policy.sandboxImage, "node", "/trusted/sandbox.mjs", "serve"]);
      serverStarted = true;
      const port = (await checked("docker", ["port", name, "4173/tcp"])).stdout.trim();
      if (!/^127\.0\.0\.1:\d+$/.test(port)) throw new Error("Sandbox server is not bound only to loopback.");
      const url = `http://${port}`;
      let responsive = false;
      for (let attempt = 0; attempt < 30; attempt++) {
        try { responsive = (await fetch(url, { signal: AbortSignal.timeout(1000), redirect: "error" })).ok; }
        catch (error) {
          if (!(error instanceof TypeError) && error?.name !== "TimeoutError") throw error;
        }
        if (responsive) break;
        await new Promise(resolveWait => setTimeout(resolveWait, 500));
      }
      if (!responsive) throw new Error("The real application did not become responsive in its sandbox.");
      const env = { ...process.env, ACCEPTANCE_URL: url, PROOF_DIRECTORY: reportDirectory };
      if (criterion === "timezone-tests") {
        await checked("node", [join(trusted, "node_modules/vitest/vitest.mjs"), "run", "--config", join(trusted, "vitest.config.mjs"),
          "--reporter=json", "--outputFile", join(reportDirectory, "vitest.json")], { cwd: trusted, env });
        executedTests = countTests("UnitTests", JSON.parse(await readFile(join(reportDirectory, "vitest.json"), "utf8")));
      } else {
        const result = await checked("node", [join(trusted, "node_modules/@playwright/test/cli.js"), "test", "--config",
          join(trusted, "playwright.config.mjs"), "--reporter=json"], { cwd: trusted, env });
        await writeFile(join(reportDirectory, "playwright.json"), result.stdout);
        executedTests = countTests("BrowserTests", JSON.parse(result.stdout));
        const screenshot = await readFile(join(reportDirectory, "candidate.png"));
        if (screenshot.length < 8 || screenshot.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error("Candidate screenshot evidence is missing.");
      }
    }
  } catch (error) {
    failure = error;
  } finally {
    if (serverStarted) {
      const stopped = await command("docker", ["rm", "--force", name]);
      if (stopped.code !== 0) failure ??= new Error("Named sandbox cleanup failed.");
    }
    if (networkCreated) {
      const removed = await command("docker", ["network", "rm", network]);
      if (removed.code !== 0) failure ??= new Error("Named sandbox network cleanup failed.");
    }
    await rm(scratch, { recursive: true, force: true });
  }
  await writeFile(join(reportDirectory, "commands.json"), JSON.stringify(logs));
  const entries = [];
  for (const path of ["commands.json", ...(criterion === "timezone-tests" ? ["vitest.json"] : []),
    ...(criterion === "browser" ? ["playwright.json", "candidate.png"] : [])]) {
    try {
      const bytes = await readFile(join(reportDirectory, path));
      entries.push({ path, digest: digest(bytes), byteLength: bytes.length });
    } catch (error) {
      if (!failure || error?.code !== "ENOENT") throw error;
    }
  }
  const report = {
    ...metadata, status: failure ? "Failed" : "Passed",
    workflowRevision: gitBlob(workflow), acceptanceDigest: policy.acceptanceDigest,
    runtime: { ...policy.runtime, sandboxImage: policy.sandboxImage, runner: "ubuntu-24.04" },
    executedTests, files: entries,
  };
  await writeFile(join(reportDirectory, "report.json"), JSON.stringify(report));
  if (failure) throw failure;
  return report;
}

function argumentsFor(args) {
  const values = {};
  for (let index = 0; index < args.length; index += 2) {
    if (!["--candidate", "--criterion", "--output"].includes(args[index]) || !args[index + 1] || values[args[index]]) {
      throw new Error("Explicit candidate, frozen criterion and trusted output directory are required.");
    }
    values[args[index]] = args[index + 1];
  }
  if (!values["--candidate"] || !values["--criterion"] || !values["--output"]) throw new Error("Missing trusted acceptance arguments.");
  return { candidate: values["--candidate"], criterion: values["--criterion"], output: values["--output"] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await runAcceptance(argumentsFor(process.argv.slice(2))); }
  catch (error) {
    console.error(JSON.stringify({ event: "trusted_acceptance_failed", message: error instanceof Error ? error.message : "Acceptance failed." }));
    process.exitCode = 1;
  }
}
