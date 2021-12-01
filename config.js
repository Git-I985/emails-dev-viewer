import {join, dirname} from "path";
import {fileURLToPath} from "url";

export const config = {
    path: {
        emails: join(dirname(fileURLToPath(import.meta.url)), "..", "prime-email-templates/dist"),
        public: join(dirname(fileURLToPath(import.meta.url)), "public"),
    },
    server: {
        port: 8080,
    },
    cli: {
        messages: {
            error: "Error while reading emails directory, make sure that you have compiled the emails and the directory structure corresponds specified in the config.js file",
        },
    },
};