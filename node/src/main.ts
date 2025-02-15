import * as fs from 'fs';
import * as path from 'path';
import pLimit from 'p-limit';
import {loadFromJSON, OcrResult, saveToJSON} from "./data_repo";
import {pipe} from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import {askOllamaTE} from './ollama';
import {cons} from "fp-ts/Array";

interface PipeState {
    processedData: OcrResult[];
    processedFiles: string[];
    toBeProcessedFiles: string[];
    toBeProcessedFilesSubset: string[];
    newData: OcrResult[];
}

(async () => {
    const dataDir = "/home/davidg/gits/cholesterol-ml/node/data/cholesterol-data/";
    const ollamaLimit = pLimit(1);
    const incomingFiles = await pipe(
        TE.tryCatch(
            async () => fs.promises.readdir(dataDir),
            reason => new Error(String(reason)) as never,
        ),
        TE.chain(files =>
            TE.traverseArray((file: string) =>
                TE.of({
                    filename: file,
                    fullPath: path.join(dataDir, file)
                })
            )(files)
        ),
        TE.fold(
            error => async () => [] as { filename: string, fullPath: string }[],
            data => async () => data,
        ),
    )();

    const processFiles = pipe(
        loadFromJSON('./data/ollama_output.json'),
        TE.map(results => {
            return {
                processedData: results,
                processedFiles: results.map(result => result.filename)
            }
        }),
        TE.map(state => {
            return {
                ...state,
                toBeProcessedFiles: incomingFiles
                    .filter(file => !state.processedFiles.includes(file.filename)),
            };
        }),
        TE.map(state => {
            return {
                ...state,
                toBeProcessedFilesSubset: state.toBeProcessedFiles.slice(0, 1)
            };
        }),
        TE.chain(state =>
            pipe(
                state.toBeProcessedFilesSubset,
                TE.traverseArray(file =>
                    pipe(
                        askOllamaTE(file.fullPath),
                        TE.map(response => ({
                            filename: file.filename,
                            text: JSON.parse(response)
                        }))
                    ),
                ),
                TE.map(newData => ({...state, newData}))
            )
        ),
        TE.chain((state) => TE.tryCatch(
            async () => {
                const resolvedResults = await Promise.all(state.newData);
                const combinedResults = [...state.processedData, ...resolvedResults];
                return await saveToJSON(combinedResults, 'data/ollama_output.json')();
            },
            (err) => new Error(String(err))
        )),
    );

    try {
        const result = await processFiles();
        if (result._tag === 'Left') {
            console.error('Error:', result.left);
            process.exit(1);
        }
        console.log('Success:', result.right);
    } catch (error) {
        console.error('Caught error:', error);
        process.exit(1);
    }
})();
