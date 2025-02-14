import * as fs from 'fs';
import * as path from 'path';
import pLimit from 'p-limit';
import {loadFromJSON, OcrResult, saveToJSON} from "./data_repo";
import {askOllama} from "./data_factory";
import {pipe} from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { askOllamaTE } from './ollama';

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
    //TODO: add this to pipe
    const files = fs.readdirSync(dataDir)
        .map(file => {
            return {
                filename: file,
                fullPath: path.join(dataDir, file)
            };
        });

    const processFiles = pipe(
        //TODO: setup an object to carry state
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
                toBeProcessedFiles: files.filter(file => !state.processedFiles.includes(file.filename)),
            };
        }),
        TE.map(state => {
            //return files.slice(0, 1);
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
                TE.map(newData => ({ ...state, newData }))
            )
        ),
        TE.chain((state) => TE.tryCatch(
            async () => {
                const resolvedResults = await Promise.all(state.newData);
                const combinedResults = [...state.processedData, ...resolvedResults];
                //TODO: combine resolvedResults with processedData before saving
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
