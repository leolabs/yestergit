#!/usr/bin/env node

import { program } from "commander";
import git from "simple-git/promise";
import { flatten, groupBy, uniq } from "lodash";
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
  .option("-g, --github-links", "Show links to GitHub if available")
  .option(
    "-b, --base <base>",
    "The base branch to compare commits against (default: master)"
  );

program.parse(process.argv);

const buildCommitUrl = (repo: string, hash: string) =>
  ` ${repo}/commit/${hash} `;

(async () => {
  const gitCmd = git(program.repo ?? process.cwd());
  const baseBranch = program.base ?? "master";
  const author: string = (
    program.author ?? (await gitCmd.raw(["config", "user.email"]))
  ).trim();
  const githubLink = program.githubLinks
    ? ((await gitCmd.remote(["show", "origin"])) as string).match(
        /(https:\/\/github.com\/.+?\/.+?)\.git/
      )?.[1] ?? null
    : null;

  // Set filters for the author and the time range
  const defaultLogArgs = [
    "--no-merges",
    "--author",
    author,
    "--since",
    program.since ?? "5 days ago",
  ];

  // First, get all commits with given filters
  const globalCommits = (await gitCmd.log([...defaultLogArgs, "--all"])).all;

  // Extract the used branches
  const branches = globalCommits
    .map((c) => c.refs.replace("HEAD -> ", "").split(", ").pop()!)
    .filter((r) => r && !r.startsWith("tag: ") && r !== "refs/stash");

  // For each branch, get all commits in the given time
  const allCommits = flatten(
    await Promise.all(
      branches.map(async (b) => {
        const commits = await gitCmd.log([
          ...defaultLogArgs,
          "--first-parent",
          `${baseBranch}..${b}`,
        ]);
        return commits.all.map((c) => ({ ...c, branch: b }));
      })
    )
  );

  // Find commits that don't belong to any branch
  const usedHashes = new Set(allCommits.map((c) => c.hash));
  const unusedCommits = globalCommits.filter((c) => !usedHashes.has(c.hash));
  const groupedUnusedCommits = groupBy(unusedCommits, (c) =>
    c.date.slice(0, 10)
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

  const dates = uniq([
    ...Object.keys(groupedUnusedCommits),
    ...Object.keys(commitsByDate),
  ]);

  // Log the results
  for (const date of dates.sort()) {
    console.log();
    console.log(chalk.green(date));
    console.log(chalk.green("=========="));

    if (commitsByDateAndBranch[date]) {
      for (const branch of Object.keys(commitsByDateAndBranch[date]).sort()) {
        console.log("  " + chalk.redBright(branch));

        for (const commit of commitsByDateAndBranch[date][branch]) {
          console.log(
            "    -",
            `${commit.date.slice(11, 16)}:`,
            commit.message,
            chalk.gray(
              githubLink
                ? "\n     " + buildCommitUrl(githubLink, commit.hash)
                : `(${commit.hash.slice(0, 7)})`
            )
          );
        }
      }
    }

    if (groupedUnusedCommits[date]) {
      console.log("  " + chalk.red("unassociated commits"));

      for (const commit of groupedUnusedCommits[date]) {
        console.log(
          "    -",
          `${commit.date.slice(11, 16)}:`,
          commit.message,
          chalk.gray(
            githubLink
              ? "\n     " + buildCommitUrl(githubLink, commit.hash)
              : `(${commit.hash.slice(0, 7)})`
          )
        );
      }
    }
  }
})();
