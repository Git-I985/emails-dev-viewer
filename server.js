import express from 'express';
import {join, parse} from 'path';
import {readdir, lstat} from 'fs/promises';
import {config} from './config.js';
import chalk from 'chalk';
import {langs} from './langs.js';

const app = express();

const headers = (res) => {
    // res.set('Content-Security-Policy', `default-src *`)
}


const readDirRecursive = async (dirPath) => await Promise.all(
    (await readdir(dirPath)).map(async (entity) => {
        const path = join(dirPath, entity)
        return (await lstat(path)).isDirectory() ? await readDirRecursive(path) : path
    })
)

app.use(config.path.baseUrl, express.static(join(config.path.currentDir, 'public'), {
    setHeaders: headers
}));
app.use(express.static(config.path.emails, {
    setHeaders: headers
}));

/**
 * JSON response schema:
 * {
 *     "pages": ['account-restored', 'did-you-know-1',...] array of compiled email file names,
 *     "langs": { ru: Russian, bn: Bengali,...} map of lang codes,
 *     "project": "PRIME" or "TURBO"
 * }
 */
app.get(join(config.path.baseUrl, 'emails'), async (req, res) => {
    /** scan compiled emails directory */
    readdir(join(config.path.emails, 'es'))
        /** removes subject files */
        .then((pages) => pages.filter((file) => !parse(file).name.includes('subject')))
        /** removes files extension */
        .then((pages) => pages.map((file) => parse(file).name))
        /** structure data to json */
        .then((pages) =>
            res.json({
                pages,
                langs,
                project: pages.some((page) => page.includes('cov') || page.includes('did-you-know'))
                         ? 'PRIME'
                         : 'TURBO',
            })
        )
        .catch((e) => {
            console.log(chalk.bgRedBright.whiteBright(` ERROR `) + ' ' + config.cli.messages.error);
            res.status(500).send(e);
        });
});


app.get(join(config.path.baseUrl, 'ls'), async (req, res) => {
    readDirRecursive('/usr/src/app')
        .then(dirs => dirs.flat(Number.POSITIVE_INFINITY))
        .then(dirs => {
            res.json(dirs)
        }).catch(e => {
        res.status(500).send(e)
    })
})

// app.get('/execute/:command', (req, res) => {
//     exec(req.params.command, { cwd: config.path.emailsProject }, (error, stdout, stderr) => {
//         if (stderr || error) {
//             let errorText;
//             stdout && (errorText += stdout);
//             error && (errorText += error);
//
//             console.log('[ERROR]: exectuting command via /execute/command ❌ ');
//             console.log('[COMMAND]: ' + req.params.command);
//             console.log('[ERROR DETAILS]:');
//             console.group();
//             console.group();
//             console.log(errorText);
//             console.groupEnd();
//             console.groupEnd();
//
//             res.status(500).send(errorText);
//         } else {
//             console.log('[LOG]: Executing command success ' + req.params.command);
//             res.status(200).send(stdout);
//         }
//     });
// });

app.listen(config.server.port, () => {
    console.log(`[PORT:${config.server.port}]: Emails server started... http://localhost:${config.server.port} ✅`);
});
