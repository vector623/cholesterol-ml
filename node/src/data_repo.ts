import * as fs from "node:fs";
import * as path from "node:path";

export interface OcrResult {
    text: string;
    filename: string;
}

export class ResultsRepository {
    private storage: OcrResult[] = [];

    // Method to add a new data object
    add(data: OcrResult): void {
        this.storage.push(data);
    }

    addMore(data: OcrResult[]): void {
        this.storage.push(...data);
    }

    // Method to get all data objects
    getAll(): OcrResult[] {
        return this.storage;
    }

    // TODO: refactor to use TaskEither
    // https://x.com/i/grok/share/D7dwqzRPM7ULE5IfTD9PYZnT7
    persist(): void {
        const jsonData = JSON.stringify(this.storage, null, 2);
        fs.writeFile('data.json', jsonData, (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('Data successfully saved to data.json');
            }
        });
    }
}