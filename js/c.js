const ENCRYPTION_KEY = "84578268387546481237648362847623875623"; // Ваш ключ шифрования
const IV_LENGTH = 16; // Длина вектора инициализации (IV)

// Функция преобразования строки в массив байтов (hex в строку)
function hexToString(hex) {
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
        result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return result;
}

// Функция расшифровки
async function decrypt(encryptedHex) {
    const key = ENCRYPTION_KEY.slice(0, IV_LENGTH); // Берем те же IV_LENGTH символов ключа
    const encrypted = hexToString(encryptedHex); // Преобразуем hex в строку
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return decrypted;
}