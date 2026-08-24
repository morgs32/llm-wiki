import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { configureRepository } from "./configure.mjs";

const nxBlock = `<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- Use Nx.

<!-- nx configuration end-->`;

const withRepository = (run) => {
  const repository = mkdtempSync(join(tmpdir(), "patterns-"));
  try {
    run(repository);
  } finally {
    rmSync(repository, { recursive: true, force: true });
  }
};

test("inserts before an Nx block at the end and preserves repository guidance", () => {
  withRepository((repository) => {
    const agentsPath = join(repository, "AGENTS.md");
    const repositoryGuidance = "# Repository guidance\n\nKeep this exact text.";
    writeFileSync(agentsPath, `${repositoryGuidance}\n\n${nxBlock}\n`);

    const first = configureRepository({ repository, check: false });
    const configured = readFileSync(agentsPath, "utf8");
    const second = configureRepository({ repository, check: false });

    assert.equal(first.changed, true);
    assert.equal(second.changed, false);
    assert.ok(configured.startsWith(repositoryGuidance));
    assert.ok(
      configured.indexOf("patterns configuration start") <
        configured.indexOf("nx configuration start"),
    );
    assert.equal(readFileSync(agentsPath, "utf8"), configured);
  });
});

test("inserts after an Nx block at the start", () => {
  withRepository((repository) => {
    const agentsPath = join(repository, "AGENTS.md");
    writeFileSync(
      agentsPath,
      `${nxBlock}\n\n## Docs lookup\n\n    preserved indentation\n`,
    );

    configureRepository({ repository, check: false });
    const configured = readFileSync(agentsPath, "utf8");

    assert.ok(
      configured.indexOf("nx configuration end") <
        configured.indexOf("patterns configuration start"),
    );
    assert.ok(
      configured.indexOf("patterns configuration end") <
        configured.indexOf("## Docs lookup"),
    );
    assert.ok(configured.includes("    preserved indentation"));
  });
});

test("check reports drift without writing", () => {
  withRepository((repository) => {
    const agentsPath = join(repository, "AGENTS.md");
    writeFileSync(agentsPath, "# Repository\n");

    const before = readFileSync(agentsPath, "utf8");
    const result = configureRepository({ repository, check: true });

    assert.equal(result.changed, true);
    assert.equal(readFileSync(agentsPath, "utf8"), before);
  });
});

test("migrates a legacy managed block in place", () => {
  withRepository((repository) => {
    const agentsPath = join(repository, "AGENTS.md");
    writeFileSync(
      agentsPath,
      `# Repository guidance

<!-- engineering-patterns configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## Shared engineering patterns

Use $engineering-patterns.

<!-- engineering-patterns configuration end-->
`,
    );

    const first = configureRepository({ repository, check: false });
    const configured = readFileSync(agentsPath, "utf8");
    const second = configureRepository({ repository, check: false });

    assert.equal(first.changed, true);
    assert.equal(second.changed, false);
    assert.ok(configured.includes("<!-- patterns configuration start-->"));
    assert.ok(configured.includes("invoke `$patterns`"));
    assert.ok(!configured.includes("engineering-patterns"));
    assert.equal(readFileSync(agentsPath, "utf8"), configured);
  });
});

test("rejects mixed legacy and current managed blocks", () => {
  withRepository((repository) => {
    writeFileSync(
      join(repository, "AGENTS.md"),
      `<!-- engineering-patterns configuration start-->
<!-- engineering-patterns configuration end-->
<!-- patterns configuration start-->
<!-- patterns configuration end-->
`,
    );

    assert.throws(
      () => configureRepository({ repository, check: false }),
      /multiple managed patterns blocks found/,
    );
  });
});

test("migrates only a same-source legacy global skill", () => {
  withRepository((repository) => {
    const binPath = join(repository, "bin");
    const globalRoot = join(repository, "global", ".agents");
    const skillsRoot = join(globalRoot, "skills");
    const legacySkillPath = join(skillsRoot, "engineering-patterns");
    const lockPath = join(globalRoot, ".skill-lock.json");
    const codexRoot = join(repository, "codex");
    const validatorPath = join(
      codexRoot,
      "skills/.system/skill-creator/scripts/quick_validate.py",
    );
    const validatorMarker = join(repository, "validator-called");
    const preloadPath = join(repository, "mock-fetch.mjs");
    const npxPath = join(binPath, "npx");

    mkdirSync(binPath, { recursive: true });
    mkdirSync(legacySkillPath, { recursive: true });
    mkdirSync(join(validatorPath, ".."), { recursive: true });
    writeFileSync(join(repository, "AGENTS.md"), "# Repository\n");
    writeFileSync(
      lockPath,
      JSON.stringify({
        skills: {
          "engineering-patterns": {
            source: "morgs32/llm-wiki",
            sourceType: "github",
            skillPath: "skills/engineering-patterns/SKILL.md",
            skillFolderHash: "legacy-hash",
            ref: "main",
          },
        },
      }),
    );
    writeFileSync(
      validatorPath,
      `import os
from pathlib import Path
Path(os.environ["VALIDATOR_MARKER"]).write_text("called")
`,
    );
    writeFileSync(
      preloadPath,
      `globalThis.fetch = async () => ({
  ok: true,
  status: 200,
  json: async () => ({
    tree: [{ path: "skills/patterns", type: "tree", sha: "published-hash" }],
  }),
});
`,
    );
    writeFileSync(
      npxPath,
      `#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const globalRoot = process.env.SKILLS_TEST_ROOT;
const skillsRoot = join(globalRoot, "skills");
const lockPath = join(globalRoot, ".skill-lock.json");
const lock = JSON.parse(readFileSync(lockPath, "utf8"));
const command = process.argv[3];

if (command === "list") {
  process.stdout.write(
    JSON.stringify(
      Object.entries(lock.skills).map(([name, entry]) => ({
        name,
        path: join(skillsRoot, name),
        source: entry.source,
        sourceType: entry.sourceType,
      })),
    ),
  );
} else if (command === "add") {
  const name = process.argv[process.argv.indexOf("--skill") + 1];
  const target = join(skillsRoot, name);
  mkdirSync(join(target, "references/patterns"), { recursive: true });
  mkdirSync(join(target, "scripts"), { recursive: true });
  writeFileSync(
    join(target, "SKILL.md"),
    "---\\nname: patterns\\ndescription: Apply shared patterns.\\n---\\n\\n# Patterns\\n",
  );
  writeFileSync(join(target, "references/patterns/index.md"), "# Patterns\\n");
  writeFileSync(join(target, "scripts/configure.mjs"), "");
  lock.skills[name] = {
    source: "morgs32/llm-wiki",
    sourceType: "github",
    skillPath: "skills/patterns/SKILL.md",
    skillFolderHash: "published-hash",
    ref: "main",
  };
  writeFileSync(lockPath, JSON.stringify(lock));
} else if (command === "remove") {
  const name = process.argv[4];
  if (!existsSync(process.env.VALIDATOR_MARKER)) {
    throw new Error("legacy skill removal preceded new-skill validation");
  }
  if (
    !readFileSync(
      join(process.env.SKILLS_TEST_REPOSITORY, "AGENTS.md"),
      "utf8",
    ).includes("<!-- patterns configuration start-->")
  ) {
    throw new Error("legacy skill removal preceded repository migration");
  }
  rmSync(join(skillsRoot, name), { recursive: true, force: true });
  delete lock.skills[name];
  writeFileSync(lockPath, JSON.stringify(lock));
} else {
  throw new Error("unexpected fake Skills CLI command: " + command);
}
`,
    );
    chmodSync(npxPath, 0o755);

    const environment = {
      ...process.env,
      CODEX_HOME: codexRoot,
      NODE_OPTIONS: [
        process.env.NODE_OPTIONS,
        `--import=${preloadPath}`,
      ]
        .filter(Boolean)
        .join(" "),
      PATH: `${binPath}${delimiter}${process.env.PATH ?? ""}`,
      SKILLS_TEST_ROOT: globalRoot,
      SKILLS_TEST_REPOSITORY: repository,
      VALIDATOR_MARKER: validatorMarker,
    };
    const configurePath = fileURLToPath(
      new URL("./configure.mjs", import.meta.url),
    );

    const checkResult = spawnSync(
      process.execPath,
      [configurePath, "--check", repository],
      { encoding: "utf8", env: environment },
    );
    assert.equal(checkResult.status, 1, checkResult.stderr);
    assert.match(checkResult.stderr, /legacy global engineering-patterns/);
    assert.ok(existsSync(legacySkillPath));

    const migrationResult = spawnSync(
      process.execPath,
      [configurePath, repository],
      { encoding: "utf8", env: environment },
    );
    assert.equal(migrationResult.status, 0, migrationResult.stderr);
    assert.match(migrationResult.stdout, /MIGRATED global patterns/);
    assert.equal(readFileSync(validatorMarker, "utf8"), "called");
    assert.ok(!existsSync(legacySkillPath));
    assert.deepEqual(
      Object.keys(JSON.parse(readFileSync(lockPath, "utf8")).skills),
      ["patterns"],
    );

    rmSync(join(skillsRoot, "patterns"), { recursive: true, force: true });
    mkdirSync(legacySkillPath, { recursive: true });
    writeFileSync(
      lockPath,
      JSON.stringify({
        skills: {
          "engineering-patterns": {
            source: "someone/else",
            sourceType: "github",
            skillPath: "skills/engineering-patterns/SKILL.md",
            skillFolderHash: "foreign-hash",
            ref: "main",
          },
        },
      }),
    );

    const refusalResult = spawnSync(
      process.execPath,
      [configurePath, repository],
      { encoding: "utf8", env: environment },
    );
    assert.equal(refusalResult.status, 1);
    assert.match(refusalResult.stderr, /refusing to remove engineering-patterns/);
    assert.ok(existsSync(legacySkillPath));
    assert.deepEqual(
      Object.keys(JSON.parse(readFileSync(lockPath, "utf8")).skills),
      ["engineering-patterns"],
    );
  });
});

test("normalizes lowercase root guidance and leaves nested guidance untouched", () => {
  withRepository((repository) => {
    const lowerPath = join(repository, "agents.md");
    const nestedPath = join(repository, "vendor-AGENTS.md");
    writeFileSync(lowerPath, "# Repository\n");
    writeFileSync(nestedPath, "vendored guidance");

    configureRepository({ repository, check: false });

    assert.deepEqual(
      readdirSync(repository).filter(
        (entry) => entry.toLowerCase() === "agents.md",
      ),
      ["AGENTS.md"],
    );
    assert.equal(readFileSync(nestedPath, "utf8"), "vendored guidance");
  });
});

test("refuses a root AGENTS.md symlink", () => {
  withRepository((repository) => {
    const targetPath = join(repository, "outside-guidance.md");
    writeFileSync(targetPath, "outside guidance");
    symlinkSync(targetPath, join(repository, "AGENTS.md"));

    assert.throws(
      () => configureRepository({ repository, check: false }),
      /not a regular file/,
    );
    assert.equal(readFileSync(targetPath, "utf8"), "outside guidance");
  });
});

test("rejects reversed managed markers", () => {
  withRepository((repository) => {
    writeFileSync(
      join(repository, "AGENTS.md"),
      "<!-- patterns configuration end-->\n<!-- patterns configuration start-->\n",
    );

    assert.throws(
      () => configureRepository({ repository, check: false }),
      /markers are out of order/,
    );
  });
});

test("runs when invoked through a symlinked path", () => {
  withRepository((repository) => {
    const invocationPath = join(repository, "configure.mjs");
    symlinkSync(
      fileURLToPath(new URL("./configure.mjs", import.meta.url)),
      invocationPath,
    );

    const result = spawnSync(process.execPath, [invocationPath, "--help"], {
      encoding: "utf8",
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /^Usage: configure\.mjs/m);
  });
});
