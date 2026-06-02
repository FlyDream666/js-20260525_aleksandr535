/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
    // Выбираем поля, которые есть в объекте и создаем новый объект
    const pickObj = Object.fromEntries(
        fields.filter(field => field in obj).map(field => [field, obj[field]])
        );
        // Возвращаем новый объект
        return pickObj;
};