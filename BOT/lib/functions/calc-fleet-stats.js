function ip(number) {
    return parseInt(number, 10);
}

/**
 * Calculates Base Stats
 * @param {Object} Fleet Fleet Object with cards type and count
 * @returns {Object} Returns a Stats Object or false if type coundn't be found
 */
function calcFleetStats(fleet) {

    //Creating Object to Return
    let stats = {
        base_stats: {
            speed: 0,
            fp: 0,
            hp: 0,
            cargo: 0,
            scan: 0,
            bombing: 0
        },
        calc_min_stats: {
            speed: 0,
            fp: 0,
            hp: 0,
            cargo: 0,
            scan: 0,
            bombing: 0
        },
        calc_max_stats: {
            speed: 0,
            fp: 0,
            hp: 0,
            cargo: 0,
            scan: 0,
            bombing: 0
        },
        costs: {
            labor_cost: 0,
            metal: 0,
            gas: 0,
            crystal: 0,
            minutes: 0
        },
        level_bonus: {
            speed: 0,
            fp: 0,
            hp: 0,
            cargo: 0,
            scan: 0,
            bombing: 0
        }
    }
    //Numbers Need for calc
    let calcNums = {
        b_speed: 0,
        bp_speed: 1,
        b_fp: 0,
        bp_fp: 1,
        b_hp: 0,
        bp_hp: 1,
        b_cargo: 0,
        bp_cargo: 1,
        b_scan: 0,
        bp_scan: 1,
        b_bombing: 0,
        bp_bombing: 1
    }
    let type = fleet.type;
    let count = parseInt(fleet.count, 10);

    //Getting Ship Data Returning if not found
    var id = -1;
    for (var i=0;i<data.shipData.length;i++) {
        if (type.includes(data.shipData[i].name)) {
            id = i;
        }
    }
    if (id === -1) return false;

    //Easier Refrence
    let ship = data.shipData[id];

    //Level Bonus Entry
    if (ship.level_bonus.speed != undefined) {
        stats.level_bonus.speed = ip(ship.level_bonus.speed);
    }
    if (ship.level_bonus.fp != undefined) {
        stats.level_bonus.fp = ip(ship.level_bonus.fp);
    }
    if (ship.level_bonus.hp != undefined) {
        stats.level_bonus.hp = ip(ship.level_bonus.hp);
    }
    if (ship.level_bonus.cargo != undefined) {
        stats.level_bonus.cargo = ip(ship.level_bonus.cargo);
    }
    if (ship.level_bonus.scan != undefined) {
        stats.level_bonus.scan = ip(ship.level_bonus.scan);
    }
    if (ship.level_bonus.bombing != undefined) {
        stats.level_bonus.bombing = ip(ship.level_bonus.bombing);
    }

    //Costs
    stats.costs.labor_cost = count * ip(ship.costs.labor_cost);
    stats.costs.metal = count * ip(ship.costs.metal);
    stats.costs.gas = count * ip(ship.costs.gas);
    stats.costs.crystal = count * ip(ship.costs.crystal);
    stats.costs.minutes = count * ip(ship.costs.minutes);

    //Raw Stats
    stats.base_stats.speed = count * ip(ship.base_stats.speed);
    stats.base_stats.fp = count * ip(ship.base_stats.fp);
    stats.base_stats.hp = count * ip(ship.base_stats.hp);
    stats.base_stats.cargo = count * ip(ship.base_stats.cargo);
    stats.base_stats.scan = count * ip(ship.base_stats.scan);
    stats.base_stats.bombing = count * ip(ship.base_stats.bombing);

    //Card Check
    if (fleet.cards != undefined) {
        for (var i=0; i<fleet.cards.length; i++) {
            if (fleet.cards[i].type != undefined) {
                let card = fleet.cards[i];
                switch (card.bonus_speed.type) {
                    case '+':
                        switch (ship.size) {
                            case 'Light':
                                calcNums.b_speed += card.bonus_speed.light;
                                break;
                            case 'Heavy':
                                calcNums.b_speed += card.bonus_speed.heavy;
                                break;
                            case 'Capital':
                                calcNums.b_speed += card.bonus_speed.capital;
                                break;
                        }
                        break;
                    case '%':
                        switch (ship.size) {
                            case 'Light':
                                calcNums.bp_speed += card.bonus_speed.light;
                                break;
                            case 'Heavy':
                                calcNums.bp_speed += card.bonus_speed.heavy;
                                break;
                            case 'Capital':
                                calcNums.bp_speed += card.bonus_speed.capital;
                                break;
                        }
                        break;
                }

                switch (card.bonus_fp.type) {
                    case '+':
                        switch (ship.size) {
                            case 'Light':
                                calcNums.b_fp += card.bonus_fp.light;
                                break;
                            case 'Heavy':
                                calcNums.b_fp += card.bonus_fp.heavy;
                                break;
                            case 'Capital':
                                calcNums.b_fp += card.bonus_fp.capital;
                                break;
                        }
                        break;
                    case '%':
                        switch (ship.size) {
                            case 'Light':
                                calcNums.bp_fp += card.bonus_fp.light;
                                break;
                            case 'Heavy':
                                calcNums.bp_fp += card.bonus_fp.heavy;
                                break;
                            case 'Capital':
                                calcNums.bp_fp += card.bonus_fp.capital;
                                break;
                        }
                        break;
                }

                switch (card.bonus_hp.type) {
                    case '+':
                        switch (ship.size) {
                            case 'Light':
                                calcNums.b_hp += card.bonus_hp.light;
                                break;
                            case 'Heavy':
                                calcNums.b_hp += card.bonus_hp.heavy;
                                break;
                            case 'Capital':
                                calcNums.b_hp += card.bonus_hp.capital;
                                break;
                        }
                        break;
                    case '%':
                        switch (ship.size) {
                            case 'Light':
                                calcNums.bp_hp += card.bonus_hp.light;
                                break;
                            case 'Heavy':
                                calcNums.bp_hp += card.bonus_hp.heavy;
                                break;
                            case 'Capital':
                                calcNums.bp_hp += card.bonus_hp.capital;
                                break;
                        }
                        break;
                }

                switch (card.bonus_cargo.type) {
                    case '+':
                        switch (ship.size) {
                            case 'Light':
                                calcNums.b_cargo += card.bonus_cargo.light;
                                break;
                            case 'Heavy':
                                calcNums.b_cargo += card.bonus_cargo.heavy;
                                break;
                            case 'Capital':
                                calcNums.b_cargo += card.bonus_cargo.capital;
                                break;
                        }
                        break;
                    case '%':
                        switch (ship.size) {
                            case 'Light':
                                calcNums.bp_cargo += card.bonus_cargo.light;
                                break;
                            case 'Heavy':
                                calcNums.bp_cargo += card.bonus_cargo.heavy;
                                break;
                            case 'Capital':
                                calcNums.bp_cargo += card.bonus_cargo.capital;
                                break;
                        }
                        break;
                }

                switch (card.bonus_bombing.type) {
                    case '+':
                        switch (ship.size) {
                            case 'Light':
                                calcNums.b_bombing += card.bonus_bombing.light;
                                break;
                            case 'Heavy':
                                calcNums.b_bombing += card.bonus_bombing.heavy;
                                break;
                            case 'Capital':
                                calcNums.b_bombing += card.bonus_bombing.capital;
                                break;
                        }
                        break;
                    case '%':
                        switch (ship.size) {
                            case 'Light':
                                calcNums.bp_bombing += card.bonus_bombing.light;
                                break;
                            case 'Heavy':
                                calcNums.bp_bombing += card.bonus_bombing.heavy;
                                break;
                            case 'Capital':
                                calcNums.bp_bombing += card.bonus_bombing.capital;
                                break;
                        }
                        break;
                }
            }
        }
    }

    //MIN STATS WITH CARDS
    stats.calc_min_stats.speed = (ip(ship.base_stats.speed) + calcNums.b_speed) * calcNums.bp_speed * count;
    stats.calc_min_stats.fp = (ip(ship.base_stats.fp) + calcNums.b_fp) * calcNums.bp_fp * count;
    stats.calc_min_stats.hp = (ip(ship.base_stats.hp) + calcNums.b_hp) * calcNums.bp_hp * count;
    stats.calc_min_stats.cargo = (ip(ship.base_stats.cargo) + calcNums.b_cargo) * calcNums.bp_cargo * count;
    stats.calc_min_stats.scan = (ip(ship.base_stats.scan) + calcNums.b_scan) * calcNums.bp_scan * count;
    stats.calc_min_stats.bombing = (ip(ship.base_stats.bombing) + calcNums.b_bombing) * calcNums.bp_bombing * count;

    //MAX STATS WITH CARDS AND LEVEL
    stats.calc_max_stats.speed = (ip(ship.base_stats.speed) + calcNums.b_speed + (stats.level_bonus.speed * 4)) * calcNums.bp_speed * count;
    stats.calc_max_stats.fp = (ip(ship.base_stats.fp) + calcNums.b_fp + (stats.level_bonus.fp * 4)) * calcNums.bp_fp * count;
    stats.calc_max_stats.hp = (ip(ship.base_stats.hp) + calcNums.b_hp + (stats.level_bonus.hp * 4)) * calcNums.bp_hp * count;
    stats.calc_max_stats.cargo = (ip(ship.base_stats.cargo) + calcNums.b_cargo + (stats.level_bonus.cargo * 4)) * calcNums.bp_cargo * count;
    stats.calc_max_stats.scan = (ip(ship.base_stats.scan) + calcNums.b_scan + (stats.level_bonus.scan * 4)) * calcNums.bp_scan * count;
    stats.calc_max_stats.bombing = (ip(ship.base_stats.bombing) + calcNums.b_bombing + (stats.level_bonus.bombing * 4)) * calcNums.bp_bombing * count;

    return stats;
}

module.exports = calcFleetStats;