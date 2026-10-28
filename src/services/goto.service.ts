import { createMessage } from "../modules/utils.module";
import { getEncodedValue } from "./firebase/db";

function decode(encodedString: string) {
    try {
      return atob(encodedString);
    } catch (error: any) {
      console.error('Error decoding string:', error);
      return '';
    }
}

function encode(decodedString: string) {
    try {
        return btoa(decodedString);
    } catch (error: any) {
      console.error('Error encoding string:', error);
      return '';
    }
}

export async function goToLink(key: string) {
    const encodedKey = encode(key);
    try {
        const encodedValue = await getEncodedValue(encodedKey);
        const decodedValue = decode(encodedValue.encodedValue);
        window.location.replace(decodedValue);
    } catch (error: any) {
        createMessage({messageBody: error, location: "main-message", type: "error", autoCloseSeconds: 5})
    }
}