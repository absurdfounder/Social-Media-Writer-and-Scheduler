// Utils/getApikey.js
const encryptKey = (text) => {
  return btoa(text.split('').map((char, i) =>
    String.fromCharCode(char.charCodeAt(0) + (i % 4) + 1)
  ).join(''));
};

const decryptKey = (encoded) => {
  try {
    const decoded = atob(encoded);
    return decoded.split('').map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) - (i % 4) - 1)
    ).join('');
  } catch {
    return '';
  }
};

export const getOpenAIKey = () => {
  if (typeof window !== 'undefined') {
    const encryptedKey = localStorage.getItem('openAIKey');
    if (encryptedKey) {
      const decryptedKey = decryptKey(encryptedKey);
      if (decryptedKey && decryptedKey.startsWith('sk-')) {
        return decryptedKey;
      }
    }
  }
  return '';
};

export const getAnthropicKey = () => {
  if (typeof window !== 'undefined') {
    const encryptedKey = localStorage.getItem('anthropicKey');
    if (encryptedKey) {
      const decryptedKey = decryptKey(encryptedKey);
      if (decryptedKey && decryptedKey.startsWith('sk-')) {
        return decryptedKey;
      }
    }
  }
  return '';
};

export { encryptKey, decryptKey };