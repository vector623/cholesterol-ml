import {TaskEither, tryCatch} from 'fp-ts/lib/TaskEither'
import {writeFile} from 'fs/promises';

export interface OcrResult {
    text: string;
    filename: string;
}

export const ocrResults: OcrResult[] = [];

export const addOcrResult = (result: OcrResult) => {
    return [...ocrResults, result];
}

export const saveToJSON = (items: OcrResult[], filename: string): TaskEither<Error, void> =>
    tryCatch(
        () => writeFile(filename, JSON.stringify(items, null, 2)),
        (reason) => new Error(String(reason))
    );