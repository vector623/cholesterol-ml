import * as fs from 'fs';
import * as path from 'path';
import pLimit from 'p-limit';
import {OcrResult, saveToJSON} from "./data_repo";
import {prompts} from "./prompts";
import {pipe} from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import {askOllama} from './data_factory';


console.log(prompts.jsonv2);

(async () => {
    const dataDir = "/home/davidg/gits/cholesterol-ml/data/iCloud Photos/";
    const files = fs.readdirSync(dataDir)
        .slice(0, 1)
        .map(file => path.join(dataDir, file));

    const limit = pLimit(1);
    const resultsPromises = files
        .map(async file => {
            return await limit(async () => {
                let result: OcrResult = {
                    filename: file,
                    text: await askOllama(file)
                };
                return result;
            });
        });
    const results = await Promise.all(resultsPromises);
    let outcome = pipe(
        saveToJSON(results, 'data.json'),
        TE.fold(
            (err) => {
                console.error('Failed to save JSON:', err.message);
                return (): Promise<void> => Promise.resolve(); // or handle the error appropriately
            },
            () => {
                console.log('JSON file has been saved successfully.');
                return (): Promise<void> => Promise.resolve(); // or perform another action
            }
        )
    )();

    console.log(results);
})();