import {ollamaOCR, DEFAULT_OCR_SYSTEM_PROMPT, LlamaOCRConfig} from "ollama-ocr";

async function runOCR() {
    const config: LlamaOCRConfig = {
        model: "minicpm-v",
        filePath: "/home/davidg/gits/llm-sandbox/data/iCloud Photos/IMG_4520.JPEG",
        systemPrompt: DEFAULT_OCR_SYSTEM_PROMPT,
    };
    const text = await ollamaOCR(config);
    console.log(text);
}

runOCR();