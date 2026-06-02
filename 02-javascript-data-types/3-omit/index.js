/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
    // Выбираем поля, которые не входят в список исключаемых и создаем новый объект
    const omitObj = Object.fromEntries(
        Object.entries(obj).filter(([key]) => !fields.includes(key))
            );
            // Возвращаем новый объект
            return omitObj;
};