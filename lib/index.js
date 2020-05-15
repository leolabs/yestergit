"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var promise_1 = __importDefault(require("simple-git/promise"));
var lodash_1 = require("lodash");
var chalk_1 = __importDefault(require("chalk"));
commander_1.program
    .option("-a, --author <user>", "Filter results by the given user (default: current user)")
    .option("-s, --since <since>", "Filter by date range (default: 5 days ago)")
    .option("-r, --repo <repo>", "The Git repo to analyze (default: cwd)")
    .option("-b, --base <base>", "The base branch to compare commits against (default: master)");
commander_1.program.parse(process.argv);
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var gitCmd, baseBranch, author, _a, defaultLogArgs, branches, allCommits, _b, commitsByDate, commitsByDateAndBranch, _i, _c, date, _d, _e, date, _f, _g, branch, _h, _j, commit;
    var _k, _l, _m, _o;
    return __generator(this, function (_p) {
        switch (_p.label) {
            case 0:
                gitCmd = promise_1.default((_k = commander_1.program.repo) !== null && _k !== void 0 ? _k : process.cwd());
                baseBranch = (_l = commander_1.program.base) !== null && _l !== void 0 ? _l : "master";
                if (!((_m = commander_1.program.author) !== null && _m !== void 0)) return [3 /*break*/, 1];
                _a = _m;
                return [3 /*break*/, 3];
            case 1: return [4 /*yield*/, gitCmd.raw(["config", "user.email"])];
            case 2:
                _a = (_p.sent());
                _p.label = 3;
            case 3:
                author = (_a).trim();
                defaultLogArgs = [
                    "--author",
                    author,
                    "--since",
                    (_o = commander_1.program.since) !== null && _o !== void 0 ? _o : "5 days ago",
                ];
                return [4 /*yield*/, gitCmd
                        .log(__spreadArrays(defaultLogArgs, ["--all"]))
                        .then(function (l) {
                        return l.all
                            .map(function (c) { return c.refs.replace("HEAD -> ", "").split(", ").pop(); })
                            .filter(function (r) { return r && !r.startsWith("tag: ") && r !== "refs/stash"; });
                    })];
            case 4:
                branches = _p.sent();
                _b = lodash_1.flatten;
                return [4 /*yield*/, Promise.all(branches.map(function (b) { return __awaiter(void 0, void 0, void 0, function () {
                        var commits;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, gitCmd.log(__spreadArrays(defaultLogArgs, [
                                        "--no-merges",
                                        "--first-parent",
                                        baseBranch + ".." + b,
                                    ]))];
                                case 1:
                                    commits = _a.sent();
                                    return [2 /*return*/, commits.all.map(function (c) { return (__assign(__assign({}, c), { branch: b })); })];
                            }
                        });
                    }); }))];
            case 5:
                allCommits = _b.apply(void 0, [_p.sent()]);
                commitsByDate = lodash_1.groupBy(allCommits, function (c) { return c.date.slice(0, 10); });
                commitsByDateAndBranch = {};
                for (_i = 0, _c = Object.keys(commitsByDate); _i < _c.length; _i++) {
                    date = _c[_i];
                    commitsByDateAndBranch[date] = lodash_1.groupBy(commitsByDate[date], function (c) { return c.branch; });
                }
                // Log the results
                for (_d = 0, _e = Object.keys(commitsByDateAndBranch).sort().reverse(); _d < _e.length; _d++) {
                    date = _e[_d];
                    console.log();
                    console.log(chalk_1.default.green(date));
                    console.log(chalk_1.default.green("=========="));
                    for (_f = 0, _g = Object.keys(commitsByDateAndBranch[date]).sort(); _f < _g.length; _f++) {
                        branch = _g[_f];
                        console.log("  " + chalk_1.default.redBright(branch));
                        for (_h = 0, _j = commitsByDateAndBranch[date][branch]; _h < _j.length; _h++) {
                            commit = _j[_h];
                            console.log("    -", commit.date.slice(11, 16) + ":", commit.message, chalk_1.default.gray("(" + commit.hash.slice(0, 7) + ")"));
                        }
                    }
                }
                return [2 /*return*/];
        }
    });
}); })();
