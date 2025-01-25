import * as fs from 'fs';
import * as path from 'path';
import {ollamaOCR, DEFAULT_OCR_SYSTEM_PROMPT, LlamaOCRConfig} from "ollama-ocr";
import pLimit from 'p-limit';

async function runOCR(filePath: string): Promise<string> {
    const config: LlamaOCRConfig = {
        model: "minicpm-v",
        filePath: filePath,
        systemPrompt: DEFAULT_OCR_SYSTEM_PROMPT,
    };
    const text = await ollamaOCR(config);
    return text;
}

console.log(process.cwd());


(async () => {
    const dataDir = "/home/davidg/gits/cholesterol-ml/data/iCloud Photos/";
    const files = fs.readdirSync(dataDir)
        .slice(0, 2)
        .map(file => path.join(dataDir, file));

    const limit = pLimit(1);
    const resultsPromises = files
        .map(async file => {
            return await limit(async () => {
                let result: any = {
                    image: file,
                    text: await runOCR(file)
                };
                return result;
            });
        });
    const results = await Promise.all(resultsPromises);

    console.log(results);
})();