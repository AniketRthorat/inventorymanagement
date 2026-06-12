const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Encodes a device ID into a unique string tag.
 * @param {number} id - The database ID of the device.
 * @returns {string} - The encoded tag (e.g., SGI-1a2b).
 */
export const encodeDeviceId = (id) => {
    if (!id) return '';
    let num = parseInt(id) + 10000;
    let res = "";
    while (num > 0) {
        res = BASE62[num % 62] + res;
        num = Math.floor(num / 62);
    }
    return `SGI-${res}`;
};

/**
 * Decodes an Asset Tag back into a device ID.
 * @param {string} code - The encoded tag.
 * @returns {number} - The original database ID.
 */
export const decodeDeviceId = (code) => {
    if (!code) return null;
    let str = code.startsWith('SGI-') ? code.substring(4) : code;
    let num = 0;
    for (let i = 0; i < str.length; i++) {
        const index = BASE62.indexOf(str[i]);
        if (index === -1) return null; // Invalid character
        num = num * 62 + index;
    }
    return num - 10000;
};
