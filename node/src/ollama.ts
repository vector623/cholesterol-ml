import * as TE from 'fp-ts/TaskEither'
import {askOllama} from "./data_factory";

export const askOllamaTE = (filePath: string): TE.TaskEither<Error, string> =>
    TE.tryCatch(
        () => askOllama(filePath),
        error => {
            return new Error(String(error))
        }
    )
