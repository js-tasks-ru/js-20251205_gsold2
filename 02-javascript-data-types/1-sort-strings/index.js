/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    if (param === 'asc') {
        return sort(arr, 1);
    } else if (param === 'desc') {
        return sort(arr, -1);
    } else {
        throw new SyntaxError(`Invalide param '${param}'. It should be 'asc' or 'desc'`);
    }
}

function sort(arr, direction) {
    return [...arr].sort((a, b) => direction * (a.localeCompare(b, ['ru', 'en'], { caseFirst: 'upper' })));
}
