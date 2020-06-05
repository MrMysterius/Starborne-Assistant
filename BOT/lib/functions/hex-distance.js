/**
 * 
 * @param {Integer} xa StartingHex X
 * @param {Integer} xb StartingHex Y
 * @param {Integer} ya EndingHex X
 * @param {Integer} yb EndingHex Y
 */
function hexDistance(xa, xb, ya, yb) {
    return (Math.abs(xa - ya) + Math.abs(xa + xb - ya - yb) + Math.abs(xb - yb))/2;
}

module.exports = hexDistance;