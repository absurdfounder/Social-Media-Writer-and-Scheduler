// Utils/getApikey.js

const encryptKey = (text) => {
  try {
    return btoa(text.split('').map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) + (i % 4) + 1)
    ).join(''));
  } catch {
    return '';
  }
};

const decryptKey = (encoded) => {
  try {
    // First try the normal decryption
    const decoded = atob(encoded);
    const decrypted = decoded.split('').map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) - (i % 4) - 1)
    ).join('');

    // If it starts with sk-, it's valid
    if (decrypted.startsWith('sk-')) {
      return decrypted;
    }

    // If normal decryption didn't work, try simple base64 decode
    const simpleDecoded = atob(encoded);
    if (simpleDecoded.startsWith('sk-')) {
      return simpleDecoded;
    }

    return '';
  } catch {
    // If both methods fail, return empty string
    return '';
  }
};

const showKeyAlert = (keyType) => {
  if (typeof window !== 'undefined') {
    const existingAlert = document.querySelector('.api-key-alert');
    if (existingAlert) {
      existingAlert.remove();
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = 'api-key-alert fixed top-4 right-4 flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
    alertDiv.innerHTML = `
      <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span>${keyType} API key not found or invalid. Please check your API key.</span>
    `;

    const closeButton = document.createElement('button');
    closeButton.className = 'ml-4 text-red-700 font-bold';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => alertDiv.remove();
    alertDiv.appendChild(closeButton);

    document.body.appendChild(alertDiv);

    setTimeout(() => {
      if (alertDiv.parentNode === document.body) {
        alertDiv.remove();
      }
    }, 5000);
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
    showKeyAlert('OpenAI');
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
    showKeyAlert('Anthropic');
  }
  return '';
};

export { encryptKey, decryptKey };