/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns the new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
    // Если obj не передан, возвращаем undefined
    if (!obj) {
        return;
        }
    
    // Создаем новый объект для хранения инвертированной пары ключ-значение
    const result = {};

    // Перебираем свойства объекта и добавляем их в новый объект с инвертированной парой ключ-значение
    for (const [key, value] of Object.entries(obj)) {
        result[value] = key;
    }

    // Возвращаем новый объект с инвертированной парой ключ-значение
    return result;
}
