export const prompt = `Please look at this image and extract all the text content. Structure the output as JSON with these guidelines:
    - Identify different sections or components
    - Use appropriate keys for different text elements
    - Maintain the hierarchical structure of the content
    - Include all visible text from the image
    Provide only the json without any additional comments. Downcase all json fieldnames.
    `;
export const promptv2 = `Please look at this image and extract all the text content. Provide the output as plain text, maintaining the original layout and line breaks where appropriate. Include all visible text from the image.`;
