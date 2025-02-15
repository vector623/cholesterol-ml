import * as fs from 'fs';
import * as path from 'path';
import * as TE from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/function'
import {loadFromJSON, OcrResult, saveToJSON} from "./data_repo";
import {askOllamaTE} from './data_factory';

interface PipeState {
    processedData: OcrResult[];
    processedFiles: string[];
    toBeProcessedFiles: string[];
    toBeProcessedFilesSubset: string[];
    newData: OcrResult[];
}

(async () => {
    const dataDir = "/home/davidg/gits/cholesterol-ml/node/data/cholesterol-data/";

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
            () => async () => [],
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
                            //text: JSON.parse(response)
                            text: response
                        }))
                    ),
                ),
                TE.map(newData => ({...state, newData}))
            )
        ),
        TE.map(state => {
            return {
                ...state,
                combinedFiles: [...state.processedData, ...state.newData]
            };
        }),

        TE.chain((state) =>
            saveToJSON(state.combinedFiles, 'data/ollama_output.json')
        ),
        TE.fold(
            () => async () => {
                console.error('Failed to save JSON');
            },
            (state) => async () => {
                console.log('JSON file has been saved successfully.');
                // TODO: refactor to make state variable available here
                // console.log(state);
            },
        ),
    )();
})();
