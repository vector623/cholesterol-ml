import {Ollama} from "ollama";
import {encodeImage} from "./imageUtils";
import {promptv2} from "./prompt";
import pLimit from "p-limit";
import * as TE from "fp-ts/TaskEither";

const ollamaHost = 'http://dgp5000:11434';
const model = 'minicpm-v';
const activePrompt = promptv2;

async function askOllama(filePath: string): Promise<string> {
    const base64Image = encodeImage(filePath);
    const ollama = new Ollama({host: ollamaHost})
    const response = await ollama.chat({
        model,
        options: {},
        messages: [
            {
                role: 'user',
                content: activePrompt,
                images: [base64Image],
            },
        ],
    });

    return response.message.content;
}

const ollamaLimit = pLimit(1);

export const askOllamaTE = (filePath: string): TE.TaskEither<Error, string> =>
    TE.tryCatch(
        () => ollamaLimit(() => askOllama(filePath)),
        error => {
            return new Error(String(error))
        }
    )
