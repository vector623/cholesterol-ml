import {TaskEither, tryCatch} from 'fp-ts/lib/TaskEither'
import {writeFile} from 'fs/promises';
import * as fs from "node:fs";

export interface OcrResult {
    text: string;
    filename: string;
}

export const ocrResults: OcrResult[] = [];

export const addOcrResult: (result: OcrResult) => OcrResult[] = (result: OcrResult) => {
    return [...ocrResults, result];
}

export const saveToJSON: (
    items: OcrResult[],
    filename: string) =>
    TaskEither<Error, void> = (items: OcrResult[], filename: string): TaskEither<Error, void> =>
    tryCatch(
        (): Promise<void> => writeFile(filename, JSON.stringify(items, null, 2)),
        (reason: unknown) => new Error(String(reason))
    );

export const loadFromJSON: (filename: string) => TaskEither<Error, OcrResult[]> = (filename: string): TaskEither<Error, OcrResult[]> => {
    return tryCatch(
        async (): Promise<OcrResult[]> => {
            const contents = await fs.promises.readFile(filename, 'utf8');
            const ocrResults: OcrResult[] = JSON.parse(contents);

            return ocrResults;
        },
        (reason: unknown) => new Error(String(reason))
    )
}
