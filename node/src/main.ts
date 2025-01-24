import {ollamaOCR, DEFAULT_OCR_SYSTEM_PROMPT} from "ollama-ocr";

async function runOCR() {
    const text = await ollamaOCR({
        model: "minicpm-v",
        filePath: "/home/davidg/gits/llm-sandbox/data/iCloud Photos/IMG_4520.JPEG",
        systemPrompt: DEFAULT_OCR_SYSTEM_PROMPT,
    });
    console.log(text);
}

runOCR();