import * as fs from 'fs';
import * as path from 'path';
import pLimit from 'p-limit';
import {loadFromJSON, OcrResult, saveToJSON} from "./data_repo";
import {askOllama} from "./data_factory";
import {pipe} from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import {chain, map, tryCatch} from 'fp-ts/TaskEither'

(async () => {
    const dataDir = "/home/davidg/gits/cholesterol-ml/node/data/cholesterol-data/";
    const ollamaLimit = pLimit(1);
    const files = fs.readdirSync(dataDir)
        .map(file => {
            return {
                filename: file,
                fullPath: path.join(dataDir, file)
            };
        });
    // const processedData = [] as OcrResult[];
    // const processedFiles: OcrResult[] = await loadFromJSON('./data/test_load_data.json')();
    // const processedFileNames = processedData.map(file => file.filename);
    // const toBeProcessedFiles = files
    //     .filter(file => {
    //         return !processedFileNames.includes(file.filename)
    //     })
    //     .splice(0, 1);
    // const results = toBeProcessedFiles.map(async file => {
    //     return await ollamaLimit(async () => {
    //         let response = await askOllama(file.fullPath);
    //         let result: { filename: string; text: any } = {
    //             filename: file.filename,
    //             text: JSON.parse(response),
    //         };
    //         return result;
    //     });
    // });
    // console.log('Current working directory:', process.cwd());

    const processFiles = pipe(
        loadFromJSON('./data/ollama_output.json'),
        TE.map(processedData => {
            return processedData.map(result => result.filename);
        }),
        TE.map(processedFiles => {
            return files.filter(file => !processedFiles.includes(file.filename));
        }),
        TE.map(files => {
            return files.splice(0, 1);
        }),
        TE.map(toBeProcessedFiles => {
            return toBeProcessedFiles.map(async file => {
                return await ollamaLimit(async () => {
                    let response = await askOllama(file.fullPath);
                    let result: { filename: string; text: any } = {
                        filename: file.filename,
                        text: JSON.parse(response),
                    };
                    return result;
                });
            });
        }),
        TE.chain((newData) => TE.tryCatch(
            async () => {
                const resolvedResults = await Promise.all(newData);
                //TODO: combine resolvedResults with processedData before saving
                return await saveToJSON(resolvedResults, 'data/ollama_output.json')();
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

    // const resultsPromises = toBeProcessedFiles
    //     .map(async file => {
    //         return await ollamaLimit(async () => {
    //             let response = await askOllama(file.fullPath);
    //             let result: { filename: string; text: any } = {
    //                 filename: file.filename,
    //                 text: JSON.parse(response),
    //             };
    //             return result;
    //         });
    //     });
    // const results = await Promise.all(resultsPromises);
    // let outcome = pipe(
    //     saveToJSON(results, 'data/ollama-output.json'),
    //     TE.fold(
    //         (err) => {
    //             console.error('Failed to save JSON:', err.message);
    //             return (): Promise<void> => Promise.resolve(); // or handle the error appropriately
    //         },
    //         () => {
    //             console.log('JSON file has been saved successfully.');
    //             return (): Promise<void> => Promise.resolve(); // or perform another action
    //         }
    //     )
    // )();

})();
