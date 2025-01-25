import {OcrResult, ocrResults, saveToJSON} from './data_repo';
import {pipe} from 'fp-ts/lib/function';
import {fold} from "fp-ts/Either";
import * as TE from 'fp-ts/lib/TaskEither';


describe('Data repository operations', () => {
    it('should log "Operation completed" on successful resolution', async () => {
        let data: OcrResult[] = [];
        let outcome = pipe(
            saveToJSON(data, 'items.json'),
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

        const logSpy = jest.spyOn(console, 'log').mockImplementation();
        await expect(outcome).resolves.toBeUndefined(); // Ensure the Promise resolves
        expect(logSpy).toHaveBeenCalledWith('JSON file has been saved successfully.'); // Assert the logged output

        // Cleanup
        logSpy.mockRestore();
    });

    // outcome.then(() => {
    //     // This block will run after the TaskEither has completed
    //     console.log('Operation completed');
    // }).catch((error) => {
    //     console.error('Unexpected error:', error);
    // });
})

