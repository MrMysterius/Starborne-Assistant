/**
 * Checks if the Returned Match Object found something
 * @name mc -> Match Check
 * @param {Object} match Returned Object of a .match()
 * @returns {boolean} True | False - If Match Object found something
 */
function mc(match) {
    if (match != null && match[0] != undefined) return true;
    return false;
}

module.exports = mc;