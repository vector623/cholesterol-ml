import * as fs from 'fs';
import * as path from 'path';
import pLimit from 'p-limit';
import {OcrResult} from "./data_repo";
import {Ollama} from "ollama";


export function encodeImage(imagePath: string): string {
    const imageFile = fs.readFileSync(imagePath);
    return Buffer.from(imageFile).toString('base64');
}

const prompt = `Please look at this image and extract all the text content. Structure the output as JSON with these guidelines:
    - Identify different sections or components
    - Use appropriate keys for different text elements
    - Maintain the hierarchical structure of the content
    - Include all visible text from the image
    Provide only the json without any additional comments.
    `;

export async function askOllama(filePath: string): Promise<string> {
    const model = 'minicpm-v';
    const base64Image = encodeImage(filePath);
    const ollama = new Ollama({ host: 'http://dgp5000:11434' })
    const response = await ollama.chat({
        model,
        options: {},
        messages: [
            {
                role: 'user',
                content: prompt,
                images: [base64Image],
            },
        ],
    });

    return response.message.content;
}

(async () => {
    const dataDir = "/home/davidg/gits/cholesterol-ml/node/data/cholesterol-data/";
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
    // let outcome = pipe(
    //     saveToJSON(results, 'data.json'),
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

    console.log(results);
})();
