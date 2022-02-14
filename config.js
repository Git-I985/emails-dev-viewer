import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export const config = {
    path: {
        currentDir: dirname(fileURLToPath(import.meta.url)),
        get emailsProject() {
            return join(this.currentDir, '..', 'prime-email-templates');
        },
        get emails() {
            // тут надо просто путь указать, можно абсолютный, можно относительный
            // как тут, тут например путь ../prime-email-templates/dist собирается
            // можно заменить на return './dist' и все
            return join(this.emailsProject, 'dist');
        },
        get public() {
            return join(this.currentDir, 'public');
        },
    },
    server: {
        port: 8080,
    },
    cli: {
        messages: {
            error: 'Error while reading emails directory, make sure that you have compiled the emails and the directory structure corresponds specified in the config.js file',
        },
    },
};
