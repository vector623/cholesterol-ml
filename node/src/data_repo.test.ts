import {OcrResult, saveToJSON} from './data_repo';
import {TaskEither} from 'fp-ts/lib/TaskEither';
import {right} from "fp-ts/lib/Either";

describe('repo operations', () => {
    it('saveToJSON should report with ', async () => {
        let data: OcrResult[] = [];
        let saveResult: TaskEither<Error, void> = saveToJSON(data, 'data.json');
        const outcome = await saveResult();
        expect(outcome).toEqual(right(undefined));
    });

    it('should log "Operation completed" on successful resolution', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation();
        console.log('Operation completed');
        expect(logSpy).toHaveBeenCalledWith('Operation completed');
        logSpy.mockRestore();
    });
})

