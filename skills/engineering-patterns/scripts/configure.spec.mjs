import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
  const repository = mkdtempSync(join(tmpdir(), "engineering-patterns-"));
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
      configured.indexOf("engineering-patterns configuration start") <
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
        configured.indexOf("engineering-patterns configuration start"),
    );
    assert.ok(
      configured.indexOf("engineering-patterns configuration end") <
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
      "<!-- engineering-patterns configuration end-->\n<!-- engineering-patterns configuration start-->\n",
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
