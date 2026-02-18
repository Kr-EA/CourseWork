import {TProduct, TSell} from '../../../main/src/db/schema'

export function loadEntries(amount: number, hint: 'product' | 'sell') {

    var arr;

    switch (hint){
        case 'product':
            arr = loadProducts(amount)
            break
        case 'sell':
            arr = loadSells(amount)
            break
    }

    return arr;
}

function loadSells(amount: number){
    var arr: Array<TSell> = []
    for (var i: number = 0; i < amount; i += 1){
        arr.push({id: 1, sell_date: new Date(), sell_price: 900, product: 1})
    }
    return arr
}

function loadProducts(amount: number){
    var arr: Array<TProduct> = []
    for (var i: number = 0; i < amount; i += 1){
        arr.push({id: 1, name: 'ПИВО', bought_date: new Date(), bought_price: 400, expiration_date: new Date('2026-02-02'), unit_capacity: 5, units_amount: 2})
    }
    return arr
}