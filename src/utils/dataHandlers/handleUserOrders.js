import {amountToObject} from "./handleAssets";
import {getUserData} from "../../redux/actions/userData";

export const handleUserOrdersByPair = (pair) => (res) => handleUserOrders(res, pair);

export const handleUserOrders = (res, pair) => {
    const allTypes = ["limit_order_create", "fill_order", "limit_order_cancel", "limit_order_cancel_ex"];
    const createdOrders = [];
    const cancelledOrders = [];
    const filledOrders = {};

    res.forEach(item => {
        const timestamp = new Date(item[1].timestamp).getTime();
        const [type, operation] = item[1].op;

        if(!allTypes.includes(type)) return false;

        if (type === "limit_order_create") {
            createdOrders.push({timestamp, ...operation});
        } else if (type === "fill_order") {
            const {current_orderid, open_orderid, open_pays, current_pays, current_owner} = operation;

            const userIsBuyer = current_owner === getUserData().name;
            const id = userIsBuyer ? current_orderid : open_orderid;
            const bought = amountToObject(userIsBuyer ? open_pays : current_pays).amount;

            if (!filledOrders[id]) filledOrders[id] = 0;

            filledOrders[id] += bought;
        } else if (["limit_order_cancel", "limit_order_cancel_ex"].includes(type)){
            cancelledOrders.push(operation.orderid);
        }
    });

    return createdOrders.filter(el => {
        if(!el) return false;
        if(!pair) return true;

        const {amount_to_sell, min_to_receive} = el;

        const sellObj = amountToObject(amount_to_sell);
        const buyObj = amountToObject(min_to_receive);

        return pair.includes(sellObj.symbol) && pair.includes(buyObj.symbol);
    }).map(el => {
        let type = "buy";

        const defaultBase = pair ? pair[0] : "GOLOS";

        const {orderid: id, timestamp, amount_to_sell, min_to_receive} = el;

        const sellObj = amountToObject(amount_to_sell);
        const buyObj = amountToObject(min_to_receive);

        const isCancelled = cancelledOrders.includes(id);

        const filledSum = filledOrders[id];
        const percent = filledSum ? buyObj.amount / filledSum : 0;

        let base = buyObj;
        let quote = sellObj;

        if (quote.symbol === defaultBase) {
            type = "sell";

            base = sellObj;
            quote = buyObj;
        }

        const {amount: baseAmount, symbol: baseSymbol} = base;
        const {amount: quoteAmount, symbol: quoteSymbol} = quote;

        return {id, type, percent, timestamp, baseAmount, baseSymbol, quoteAmount, quoteSymbol, isCancelled};
    }).sort((prev, next) => {
        return prev.timestamp < next.timestamp ? 1 : -1;
    });
};