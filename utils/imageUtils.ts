/**
 * Converts a File object into a Base64 data URL.
 * @param file The file to convert.
 * @returns A promise that resolves with the data URL string.
 */
export const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

/**
 * Converts a File object into a raw Base64 string (without the data URL prefix).
 * @param file The file to convert.
 * @returns A promise that resolves with the raw Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

/**
 * Extracts the raw Base64 string from a data URL.
 * @param dataUrl The data URL string.
 * @returns The raw Base64 string.
 */
export const dataUrlToBase64 = (dataUrl: string): string => {
    return dataUrl.split(',')[1];
}

/**
 * Converts a data URL string back into a File object.
 * @param dataUrl The data URL to convert.
 * @param filename The desired filename for the new File object.
 * @returns A promise that resolves with the created File object.
 */
export const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
};