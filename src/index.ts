#!/usr/bin/env node

import { program } from "commander";
import git from "simple-git/promise";
import { flatten, groupBy } from "lodash";
import chalk from "chalk";

program
  .description("Generate a timesheet of what you committed in the last days")
  .usage("ygit [options] (or yestergit [options])")
  .option(
    "-a, --author <user>",
    "Filter results by the given user (default: current user)"
  )
  .option("-s, --since <since>", "Filter by date range (default: 5 days ago)")
  .option("-r, --repo <repo>", "The Git repo to analyze (default: cwd)")
  .option(
    "-b, --base <base>",
    "The base branch to compare commits against (default: master)"
  );

program.parse(process.argv);

(async () => {
  const gitCmd = git(program.repo ?? process.cwd());
  const baseBranch = program.base ?? "master";
  const author: string = (
    program.author ?? (await gitCmd.raw(["config", "user.email"]))
  ).trim();

  // Set filters for the author and the time range
  const defaultLogArgs = [
    "--author",
    author,
    "--since",
    program.since ?? "5 days ago",
  ];

  // First, get all commits with given filters extract relevant branches
  const branches = await gitCmd
    .log([...defaultLogArgs, "--all"])
    .then((l) =>
      l.all
        .map((c) => c.refs.replace("HEAD -> ", "").split(", ").pop()!)
        .filter((r) => r && !r.startsWith("tag: ") && r !== "refs/stash")
    );

  // For each branch, get all commits in the given time
  const allCommits = flatten(
    await Promise.all(
      branches.map(async (b) => {
        const commits = await gitCmd.log([
          ...defaultLogArgs,
          "--no-merges",
          "--first-parent",
          `${baseBranch}..${b}`,
        ]);
        return commits.all.map((c) => ({ ...c, branch: b }));
      })
    )
  );

  // Group commits by date and branch
  const commitsByDate = groupBy(allCommits, (c) => c.date.slice(0, 10));
  const commitsByDateAndBranch: Record<string, typeof commitsByDate> = {};
  for (const date of Object.keys(commitsByDate)) {
    commitsByDateAndBranch[date] = groupBy(
      commitsByDate[date],
      (c) => c.branch
    );
  }

  // Log the results
  for (const date of Object.keys(commitsByDateAndBranch).sort().reverse()) {
    console.log();
    console.log(chalk.green(date));
    console.log(chalk.green("=========="));

    for (const branch of Object.keys(commitsByDateAndBranch[date]).sort()) {
      console.log("  " + chalk.redBright(branch));

      for (const commit of commitsByDateAndBranch[date][branch]) {
        console.log(
          "    -",
          `${commit.date.slice(11, 16)}:`,
          commit.message,
          chalk.gray(`(${commit.hash.slice(0, 7)})`)
        );
      }
    }
  }
})();
