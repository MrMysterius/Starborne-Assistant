/**
 * Calculates Base Stats
 * @param {String} Type Tpye of the Ships
 * @param {Integer} Count Count of the Ships
 * @returns {Object} Returns a Stats Object or false if type coundn't be found
 */
function calcShipInfo(type, count) {
    var id = 'undefined';
    count = parseInt(count, 10);
    for (var i=0;i<data.shipData.length;i++) {
        if (type.includes(data.shipData[i].name)) {
            id = i;
        }
    }
    if (id === 'undefined') return false;
    let stats = {base_stats: {speed: "", fp: "", hp: "", cargo: "", scan: "", bombing: ""}, costs: {labor_cost: "", metal: "", gas: "", crystal: "", minutes: ""}, level_bonus: data.shipData[id].level_bonus}
    
    stats.base_stats.speed = parseInt(data.shipData[id].base_stats.speed) * count;
    stats.base_stats.fp = parseInt(data.shipData[id].base_stats.fp, 10) * count;
    stats.base_stats.hp = parseInt(data.shipData[id].base_stats.hp, 10) * count;
    stats.base_stats.cargo = parseInt(data.shipData[id].base_stats.cargo, 10) * count;
    stats.base_stats.scan = parseInt(data.shipData[id].base_stats.scan, 10) * count;
    stats.base_stats.bombing = parseInt(data.shipData[id].base_stats.bombing, 10) * count;

    stats.costs.labor_cost = parseInt(data.shipData[id].costs.labor_cost, 10) * count;
    stats.costs.metal = parseInt(data.shipData[id].costs.metal, 10) * count;
    stats.costs.gas = parseInt(data.shipData[id].costs.gas, 10) * count;
    stats.costs.crystal = parseInt(data.shipData[id].costs.crystal, 10) * count;
    stats.costs.minutes = parseInt(data.shipData[id].costs.minutes, 10) * count;

    return stats;
}

module.exports = calcShipInfo;