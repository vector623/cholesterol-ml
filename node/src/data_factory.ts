import {Ollama} from "ollama";
import {encodeImage} from "./imageUtils";
import {prompt} from "./prompt";

export async function askOllama(filePath: string): Promise<string> {
    const model = 'minicpm-v';
    const base64Image = encodeImage(filePath);
    const ollama = new Ollama({host: 'http://dgp5000:11434'})
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