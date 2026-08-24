#!/usr/bin/env node

import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const skillName = "engineering-patterns";
const skillSource = "morgs32/llm-wiki";
const markerStart = "<!-- engineering-patterns configuration start-->";
const markerDescription =
  "<!-- Leave the start & end comments to automatically receive updates. -->";
const markerEnd = "<!-- engineering-patterns configuration end-->";
const nxMarkerStart = "<!-- nx configuration start-->";
const nxMarkerEnd = "<!-- nx configuration end-->";

const usage = `Usage: configure.mjs [--check] [repository ...]

Install or update the global $engineering-patterns skill and configure each
repository's root AGENTS.md. When no repository is given, use the current
working directory.

Options:
  --check  Report stale installation, casing, or managed guidance without writing
  --help   Show this help`;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const managedBlockRegex = new RegExp(
  `${escapeRegExp(markerStart)}[\\s\\S]*?${escapeRegExp(markerEnd)}`,
  "m",
);

const nxBlockRegex = new RegExp(
  `${escapeRegExp(nxMarkerStart)}[\\s\\S]*?${escapeRegExp(nxMarkerEnd)}`,
  "m",
);

const count = (content, value) =>
  content.match(new RegExp(escapeRegExp(value), "g"))?.length ?? 0;

const withoutWhitespace = (value) => value.replace(/\s/g, "");

const withoutAnsi = (value) =>
  value.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "").replace(/\r/g, "");

const renderManagedBlock = ({ content, newline }) => {
  const contentWithoutManagedBlock = content.replace(managedBlockRegex, "");
  const heading = /^# /m.test(contentWithoutManagedBlock) ? "##" : "#";

  return [
    markerStart,
    markerDescription,
    "",
    `${heading} Shared engineering patterns`,
    "",
    "For TypeScript, Effect, RPC, Next.js, Cloudflare, testing, naming, and",
    "code-shape work, invoke `$engineering-patterns` before editing or reviewing",
    "code. Start at `references/patterns/index.md`, read only the patterns relevant",
    "to the task, and treat this repository's `AGENTS.md` and any repository-local",
    "pattern index as higher-precedence guidance.",
    "",
    markerEnd,
  ].join(newline);
};

const addManagedBlock = ({ content, block, newline }) => {
  const nxBlock = content.match(nxBlockRegex);

  if (!nxBlock) {
    const separator =
      content.length === 0
        ? ""
        : content.endsWith(`${newline}${newline}`)
          ? ""
          : content.endsWith(newline)
            ? newline
            : `${newline}${newline}`;
    return `${content}${separator}${block}${newline}`;
  }

  const nxStartsFile = content.slice(0, nxBlock.index).trim().length === 0;
  if (nxStartsFile) {
    const insertionIndex = nxBlock.index + nxBlock[0].length;
    let followingContent = content.slice(insertionIndex);
    while (followingContent.startsWith(newline)) {
      followingContent = followingContent.slice(newline.length);
    }
    return `${content.slice(0, insertionIndex)}${newline}${newline}${block}${newline}${newline}${followingContent}`;
  }

  return `${content.slice(0, nxBlock.index).replace(/\s*$/, "")}${newline}${newline}${block}${newline}${newline}${content.slice(nxBlock.index)}`;
};

const expectedAgentsContent = (content) => {
  if (count(content, markerStart) !== count(content, markerEnd)) {
    throw new Error("managed engineering-patterns markers are unbalanced");
  }
  if (count(content, markerStart) > 1) {
    throw new Error("multiple managed engineering-patterns blocks found");
  }
  if (content.indexOf(markerStart) > content.indexOf(markerEnd)) {
    throw new Error("managed engineering-patterns markers are out of order");
  }
  if (count(content, nxMarkerStart) !== count(content, nxMarkerEnd)) {
    throw new Error("managed Nx markers are unbalanced");
  }
  if (count(content, nxMarkerStart) > 1) {
    throw new Error("multiple managed Nx blocks found");
  }
  if (content.indexOf(nxMarkerStart) > content.indexOf(nxMarkerEnd)) {
    throw new Error("managed Nx markers are out of order");
  }

  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const block = renderManagedBlock({ content, newline });
  const currentBlock = content.match(managedBlockRegex)?.[0];

  if (currentBlock) {
    if (withoutWhitespace(currentBlock) === withoutWhitespace(block)) {
      return content;
    }
    return content.replace(managedBlockRegex, block);
  }

  return addManagedBlock({ content, block, newline });
};

const findRootAgentsFile = (repository) => {
  const matches = readdirSync(repository).filter(
    (entry) => entry.toLowerCase() === "agents.md",
  );

  if (matches.length > 1) {
    throw new Error(
      `multiple root AGENTS.md casing variants found in ${repository}`,
    );
  }

  return {
    currentPath: join(repository, matches[0] ?? "AGENTS.md"),
    expectedPath: join(repository, "AGENTS.md"),
    casingChanged: matches.length === 1 && matches[0] !== "AGENTS.md",
  };
};

const normalizeAgentsCasing = ({ currentPath, expectedPath }) => {
  const temporaryPath = join(
    resolve(currentPath, ".."),
    `.AGENTS.md.case-${process.pid}-${Date.now()}`,
  );
  renameSync(currentPath, temporaryPath);
  try {
    renameSync(temporaryPath, expectedPath);
  } catch (error) {
    renameSync(temporaryPath, currentPath);
    throw error;
  }
};

export const configureRepository = ({ repository, check }) => {
  const root = resolve(repository);
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    throw new Error(`repository directory does not exist: ${root}`);
  }

  const agentsFile = findRootAgentsFile(root);
  const fileExists = existsSync(agentsFile.currentPath);
  if (fileExists && !lstatSync(agentsFile.currentPath).isFile()) {
    throw new Error(
      `root agent guidance is not a regular file: ${agentsFile.currentPath}`,
    );
  }
  const content = fileExists
    ? readFileSync(agentsFile.currentPath, "utf8")
    : "";
  const expectedContent = expectedAgentsContent(content);
  const contentChanged = expectedContent !== content;

  if (!check) {
    if (agentsFile.casingChanged) {
      normalizeAgentsCasing(agentsFile);
    }
    if (contentChanged || !fileExists) {
      writeFileSync(agentsFile.expectedPath, expectedContent);
    }
  }

  return {
    path: agentsFile.expectedPath,
    changed: agentsFile.casingChanged || contentChanged || !fileExists,
    reasons: [
      ...(agentsFile.casingChanged ? ["filename casing"] : []),
      ...(contentChanged || !fileExists ? ["managed guidance"] : []),
    ],
  };
};

const runSkills = (args, { capture = false } = {}) => {
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(command, ["skills", ...args], {
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const detail = capture ? result.stderr.trim() : "";
    throw new Error(
      `npx skills ${args.join(" ")} failed${detail ? `: ${detail}` : ""}`,
    );
  }

  return capture ? result.stdout : "";
};

const readInstalledSkill = () => {
  const output = runSkills(["list", "-g", "--json"], { capture: true });
  const installedSkills = JSON.parse(output);
  return installedSkills.find((skill) => skill.name === skillName);
};

const readInstalledSkillLock = (installedSkill) => {
  if (!installedSkill) {
    return undefined;
  }

  const lockPath = join(
    dirname(dirname(installedSkill.path)),
    ".skill-lock.json",
  );
  if (!existsSync(lockPath)) {
    throw new Error(`global skill lock does not exist: ${lockPath}`);
  }

  const lock = JSON.parse(readFileSync(lockPath, "utf8"));
  return lock.skills?.[skillName];
};

const verifyInstalledSkill = (installedSkill) => {
  if (!installedSkill) {
    return "global skill is not installed";
  }
  if (installedSkill.source !== skillSource) {
    return `global skill source is ${installedSkill.source ?? "unknown"}, expected ${skillSource}`;
  }
  if (installedSkill.sourceType !== "github") {
    return `global skill source type is ${installedSkill.sourceType ?? "unknown"}, expected github`;
  }

  for (const relativePath of [
    "SKILL.md",
    "references/patterns/index.md",
    "scripts/configure.mjs",
  ]) {
    if (!existsSync(join(installedSkill.path, relativePath))) {
      return `installed skill is missing ${relativePath}`;
    }
  }

  return undefined;
};

const verifySkillLock = (installedSkill) => {
  const entry = readInstalledSkillLock(installedSkill);
  if (!entry) {
    return "global skill lock entry is missing";
  }
  if (entry.source !== skillSource || entry.sourceType !== "github") {
    return "global skill lock source does not match morgs32/llm-wiki";
  }
  if (entry.skillPath !== "skills/engineering-patterns/SKILL.md") {
    return `global skill lock path is ${entry.skillPath ?? "missing"}`;
  }
  if (!entry.skillFolderHash) {
    return "global skill lock hash is missing";
  }
  if (entry.ref && entry.ref !== "main") {
    return `global skill lock ref is ${entry.ref}, expected main`;
  }

  return undefined;
};

const readRemoteSkillHash = async () => {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  const response = await fetch(
    "https://api.github.com/repos/morgs32/llm-wiki/git/trees/main?recursive=1",
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "engineering-patterns-configure",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!response.ok) {
    throw new Error(
      `could not read published engineering-patterns tree: GitHub returned ${response.status}`,
    );
  }

  const tree = await response.json();
  const entry = tree.tree?.find(
    (item) =>
      item.path === "skills/engineering-patterns" && item.type === "tree",
  );
  if (!entry?.sha) {
    throw new Error("published engineering-patterns tree was not found");
  }

  return entry.sha;
};

const validateInstalledSkill = (installedSkill) => {
  const codexRoot = process.env.CODEX_HOME
    ? resolve(process.env.CODEX_HOME)
    : join(homedir(), ".codex");
  const validator = join(
    codexRoot,
    "skills/.system/skill-creator/scripts/quick_validate.py",
  );
  if (!existsSync(validator)) {
    throw new Error(`skill validator does not exist: ${validator}`);
  }

  const result = spawnSync("python3", [validator, installedSkill.path], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      `installed skill validation failed: ${result.stderr.trim() || result.stdout.trim()}`,
    );
  }
};

const requireSuccessfulUpdate = (output) => {
  const plainOutput = withoutAnsi(output);
  const succeeded =
    plainOutput.includes("All global skills are up to date") ||
    plainOutput.includes(`Updated ${skillName}`) ||
    /Updated \d+ skill\(s\)/.test(plainOutput);

  if (plainOutput.includes("Failed to") || !succeeded) {
    throw new Error("Skills CLI did not confirm a successful global update");
  }
};

const configureGlobalSkill = async ({ check }) => {
  const installedBefore = readInstalledSkill();
  if (
    installedBefore &&
    (installedBefore.source !== skillSource ||
      installedBefore.sourceType !== "github")
  ) {
    throw new Error(
      `refusing to replace ${skillName} from ${installedBefore.source ?? "an unknown source"}`,
    );
  }

  const hashBefore = installedBefore
    ? readInstalledSkillLock(installedBefore)?.skillFolderHash
    : undefined;

  if (!check) {
    if (installedBefore) {
      const output = runSkills(["update", skillName, "-g", "-y"], {
        capture: true,
      });
      process.stdout.write(output);
      requireSuccessfulUpdate(output);
    } else {
      runSkills([
        "add",
        skillSource,
        "--skill",
        skillName,
        "-g",
        "-a",
        "codex",
        "-y",
      ]);
    }
  }

  const installedAfter = readInstalledSkill();
  const problem =
    verifyInstalledSkill(installedAfter) ?? verifySkillLock(installedAfter);
  if (problem && !check) {
    throw new Error(problem);
  }
  if (!problem) {
    validateInstalledSkill(installedAfter);
  }
  const hashAfter = installedAfter
    ? readInstalledSkillLock(installedAfter)?.skillFolderHash
    : undefined;
  if (!problem && hashAfter !== (await readRemoteSkillHash())) {
    const staleProblem = "global skill is not current with published main";
    if (!check) {
      throw new Error(staleProblem);
    }
    return { status: "outdated", problem: staleProblem };
  }

  return {
    status: !installedBefore
      ? check
        ? "missing"
        : "installed"
      : hashBefore === hashAfter
        ? "current"
        : "updated",
    problem,
  };
};

const parseArguments = (args) => {
  let check = false;
  const repositories = [];

  for (const argument of args) {
    if (argument === "--check") {
      check = true;
    } else if (argument === "--help" || argument === "-h") {
      console.log(usage);
      process.exit(0);
    } else if (argument.startsWith("-")) {
      throw new Error(`unknown option: ${argument}`);
    } else {
      repositories.push(argument);
    }
  }

  return {
    check,
    repositories: repositories.length > 0 ? repositories : [process.cwd()],
  };
};

const main = async () => {
  const options = parseArguments(process.argv.slice(2));
  const globalSkill = await configureGlobalSkill(options);
  let stale = false;

  if (globalSkill.problem) {
    stale = true;
    console.error(`OUTDATED global ${skillName}: ${globalSkill.problem}`);
  } else {
    console.log(`${globalSkill.status.toUpperCase()} global ${skillName}`);
  }

  for (const repository of options.repositories) {
    const result = configureRepository({ repository, check: options.check });
    if (result.changed) {
      stale = true;
      console.log(
        `${options.check ? "OUTDATED" : "UPDATED"} ${result.path}: ${result.reasons.join(", ")}`,
      );
    } else {
      console.log(`CURRENT ${result.path}`);
    }
  }

  if (options.check && stale) {
    process.exitCode = 1;
  }
};

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
