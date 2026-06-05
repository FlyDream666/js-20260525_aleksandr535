/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    // Если size не указан или отрицательный, возвращаем исходную строку
    if (size === undefined || size < 0) {
        return string;
    }
    
    // Если size = 0, возвращаем пустую строку
    if (size === 0) {
        return '';
    }
    
    let result = '';
    let currentChar = '';
    let currentCount = 0;
    
    for (let i = 0; i < string.length; i++) {
        const char = string[i];
        
        if (char === currentChar) {
            // Если символ повторяется
            currentCount++;
            if (currentCount <= size) {
                result += char;
            }
        } else {
            // Новый символ
            currentChar = char;
            currentCount = 1;
            result += char;
        }
    }
    
    return result;
}