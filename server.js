import express from "express";
import {join, parse} from "path";
import {promises} from "fs";
import {config} from "./config.js";
import chalk from "chalk";
import {langs} from "./langs.js";

const app = express();

app.use(express.static(config.path.public));
app.use(express.static(config.path.emails));

/**
 * JSON response schema:
 * {
 *     "pages": ['account-restored', 'did-you-know-1',...] array of compiled email file names,
 *     "langs": { ru: Russian, bn: Bengali,...} map of lang codes,
 *     "project": "PRIME" or "TURBO"
 * }
 */
app.get("/emails", async (req, res) => {
    promises
        /** scan compiled emails directory */
        .readdir(join(config.path.emails, "en"))
        /** removes subject files */
        .then((pages) => pages.filter((file) => !parse(file).name.includes("subject")))
        /** removes files extension */
        .then((pages) => pages.map((file) => parse(file).name))
        /** structure data to json */
        .then((pages) =>
            res.json({
                    pages,
                    langs,
                    project: pages.some((page) => page.includes("cov") || page.includes("did-you-know")) ? "PRIME" : "TURBO",
                }
            ))
        .catch(() => {
            console.log(chalk.bgRedBright.whiteBright(` ERROR `) + " " + config.cli.messages.error);
            res.sendStatus(500);
        });
});

app.listen(config.server.port, () => {
    console.log([
        chalk.bgBlueBright.whiteBright(` PORT:${config.server.port} `),
        `Emails server started... http://localhost:${config.server.port} ✔️`,
    ].join(" "));
});