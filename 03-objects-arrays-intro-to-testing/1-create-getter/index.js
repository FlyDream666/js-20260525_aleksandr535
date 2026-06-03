/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    // Разбиваем путь на массив ключей
    const pathArray = path.split('.');

    // Функция для получения значения по заданному пути используем замыкание
    return function (obj) {
        let result = obj;

        // Проходим по каждому ключу в пути
        for (const key of pathArray) {
            if (Object.hasOwn(result, key)) {
                result = result[key];
            } else {
                return undefined;
            }
        }

        // Возвращаем результат
        return result;
        };
}