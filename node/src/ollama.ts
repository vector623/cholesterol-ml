import * as TE from 'fp-ts/TaskEither'
import {askOllama} from "./data_factory";
import pLimit from "p-limit";

const ollamaLimit = pLimit(1);

export const askOllamaTE = (filePath: string): TE.TaskEither<Error, string> =>
    TE.tryCatch(
        () => ollamaLimit(() => askOllama(filePath)) ,
        error => {
            return new Error(String(error))
        }
    )
