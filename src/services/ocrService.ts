import Tesseract from 'tesseract.js';

export async function performOCR(file: File): Promise<string> {
  const result = await Tesseract.recognize(
    file,
    'eng+hin', // Support English and Hindi
    { logger: m => console.log(m) }
  );
  return result.data.text;
}

export async function extractTextFromImage(base64: string): Promise<string> {
  const result = await Tesseract.recognize(
    base64,
    'eng+hin',
    { logger: m => console.log(m) }
  );
  return result.data.text;
}
