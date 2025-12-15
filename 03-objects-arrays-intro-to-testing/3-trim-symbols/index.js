/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    if (size == undefined) {
        return string;
    }
    if (size == 0) {
        return '';
    }

    let chars = string.split('');
    let result = '';
    let count = 0;
    let currentChar = '';

    for (let i = 0; i < chars.length; i++) {
        let char = chars[i];

        if (currentChar !== char) {
            count = 1;
            currentChar = char;
            result = result + char;
            continue;
        }

        if (currentChar == char) {
            count++;
            if (count <= size) {
                result = result + char;
            }
            continue;
        }
    }

    return result;
}
