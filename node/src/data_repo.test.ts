import {loadFromJSON, OcrResult, saveToJSON} from './data_repo';
import {TaskEither} from 'fp-ts/lib/TaskEither';
import {right} from "fp-ts/lib/Either";
import * as fs from "node:fs";

describe('repo operations', () => {
    it('saveToJSON should succeed with empty set', async () => {
        const testDataFile = './data/test_save_data.json';
        const data: OcrResult[] = [];
        const saveResult = await saveToJSON(data, testDataFile)();

        expect(saveResult).toEqual(right(undefined)); // void is represented as undefined

        fs.unlinkSync(testDataFile);
    });

    it('saveToJSON should succeed with empty set', async () => {
        const loadResult = await loadFromJSON('./data/test_load_data.json')();
        expect(loadResult).toEqual(right([] as OcrResult[])); // void is represented as undefined
    });

    // it('should log "Operation completed" on successful resolution', async () => {
    //     const logSpy = jest.spyOn(console, 'log').mockImplementation();
    //     console.log('Operation completed');
    //     expect(logSpy).toHaveBeenCalledWith('Operation completed');
    //     logSpy.mockRestore();
    // });
})

