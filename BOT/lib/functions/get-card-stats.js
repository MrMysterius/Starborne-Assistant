/**
 * Returns Calculations for Cards of a Fleet
 * @param {String} cardName Card Name
 * @param 
 */
function getCardStats(cardName) {
    if (cardName == null || cardName == undefined) return -1;

    var id = -1;
    for (var k=0; k<data.cardData.length; k++) {
        if (data.cardData[k].name === cardName) {
            id = k;
        }
    }

    if (id === -1) {
        return -1;
    } else {
        return data.cardData[id];
    }
}

module.exports = getCardStats;