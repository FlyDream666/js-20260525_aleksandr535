/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    // Функция сортировка с опциями
    const compareFn = (a, b) => {
        return a.localeCompare(b, ['ru', 'en'], {
            sensitivity: 'case',
            caseFirst: 'upper'
        });
    };
    
    // Сортировка нового массива
    const sorted = [...arr].sort(compareFn);
    
    // Если параметр равен "desc", то возвращаем массив в обратном порядке
    if (param === 'desc') {
        return sorted.reverse();
    }
    return sorted;
}