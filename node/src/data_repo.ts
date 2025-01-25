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

export const saveToJSON: (items: OcrResult[], filename: string) => TaskEither<Error, void> = (items: OcrResult[], filename: string): TaskEither<Error, void> =>
    tryCatch(
        (): Promise<void> => writeFile(filename, JSON.stringify(items, null, 2)),
        (reason: unknown) => new Error(String(reason))
    );

export const loadFromJSON: (filename: string) => TaskEither<Error, OcrResult[]> = (filename: string): TaskEither<Error, OcrResult[]> => {
    if (!fs.existsSync(filename)) {
        return tryCatch(
            async () => {
                throw new Error(`File "${filename}" does not exist`);
            },
            (reason: unknown) => new Error(String(reason))
        );
    }
    return tryCatch(
        async (): Promise<OcrResult[]> => {
            const contents = fs.readFileSync(filename, 'utf8');
            const ocrResults: OcrResult[] = JSON.parse(contents);

            return JSON.parse(String(require('fs').readFileSync(filename)));
        },
        (reason: unknown) => new Error(String(reason))
    )
}

export const fileExists = (filePath: string): TaskEither<Error, boolean> =>
    tryCatch(
        async () => {
            await require('fs').access(filePath);
            return true;
        },
        (reason) => new Error(String(reason)) // Wrap the error in an Error object
    );

export const outcomes: Record<string, string> = {
    jsonSavedSuccess: "json saved successfully",
    jsonSavedFailure: "json save failed",
}
