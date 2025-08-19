import CryptoJS from 'crypto-js';
import { machineIdSync } from "node-machine-id"

// for secret key
export function encryptAES(data: string) {
    const osid = machineIdSync()
    const encrypted = CryptoJS.AES.encrypt(data, osid);
    return encrypted.toString();
}

// for secret key
export function decryptAES(encryptedData: string) {
    const osid = machineIdSync()
    const decrypted = CryptoJS.AES.decrypt(encryptedData, osid);
    return decrypted.toString(CryptoJS.enc.Utf8);
}