# YesterGit

YersterGit is a simple command line application that allows you to list your past
commits grouped by date and branch. This allows you to easily see what you did in
the past few days, which might be handy if you need to report it to your team.

![YesterGit's Output](https://i.imgur.com/s8YKqbk.png)

## Installation

Simply run

```shell
$ yarn global add yestergit
```

or

```shell
$ npm i -g yestergit
```

to install YesterGit. You can now run it using either `yestergit` or `ygit` if you
want to type less.

## Usage

By default, YesterGit will only display your own commits from the last branch. The
default repository is your current working directory. You can change these settings
using the flags documented below:

```
Usage: index ygit [options] (or yestergit [options])

Generate a timesheet of what you committed in the last days

Options:
  -a, --author <user>  Filter results by the given user (default: current user)
  -s, --since <since>  Filter by date range (default: 5 days ago)
  -r, --repo <repo>    The Git repo to analyze (default: cwd)
  -b, --base <base>    The base branch to compare commits against (default: master)
  -h, --help           display help for command
```