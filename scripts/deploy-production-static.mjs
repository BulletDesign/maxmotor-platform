import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = join(root, "dist-production");
const wrangler = join(root, "node_modules", "wrangler", "bin", "wrangler.js");

execFileSync(process.execPath, [join(root, "scripts", "build-production-static.mjs")], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, [wrangler, "pages", "deploy", ".", "--project-name=maxmotor4x4", "--branch=main", "--commit-dirty=true"], { cwd: output, stdio: "inherit" });
