import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export const config = {
    path: {
        currentDir: dirname(fileURLToPath(import.meta.url)),
        get serverBaseUrl() {
            return process.env.BASE_URL || '/';
        },
        get emails() {
            return process.env.EMAILS_DIST_DIR
        },
        get public() {
            return join(this.currentDir, 'public');
        },
    },
    server: {
        port: process.env.SERVER_PORT || 8080,
    },
    cli: {
        messages: {
            error: 'Error while reading emails directory, make sure that you have compiled the emails and the directory structure corresponds specified in the config.js file',
        },
    },
};
