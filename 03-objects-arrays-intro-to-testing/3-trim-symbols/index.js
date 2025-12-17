/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    if (size === undefined) {
        return string;
    }
    if (size === 0) {
        return '';
    }

    let result = '';
    result = string.split('').reduce(
        (accumulator, char) => {
            let repeatedChars = char.repeat(size + 1);
            let tmpAccumulator = accumulator + char;
            if (!tmpAccumulator.includes(repeatedChars)) accumulator = accumulator + char;

            return accumulator;
        },
        "")

    return result;
}
