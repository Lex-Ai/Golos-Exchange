import Request from "./Request";
import {amountToObject} from "../dataHandlers";

export class ApiRequest extends Request{
    type = "api";

    getConfig = () => {
        return this.asyncRequest("getConfig");
    };

    getDGP = () => {
        return this.asyncRequest("getDynamicGlobalProperties");
    };

    getAssets = () => {
        return this.asyncRequest("getAssets", "",[],"0","20","0");
    };

    checkUserExistence = (name) => {
        return this.asyncRequest("lookupAccountNames", [name]).then(res => Boolean(res[0]));
    };

    getAccByName = (name) => {
        return this.asyncRequest("getAccounts", [name]).then(res => res && res[0]);
    };

    getAccMetadata = (name) => {
        return this.getAccByName(name).then(res => {
            let metadata = {};

            if(!res.json_metadata) return metadata;

            try{
                metadata = JSON.parse(res.json_metadata).profile;
            } catch(err) {}

            return metadata;
        });
    };

    getBalanceByName = (name) => {
        return this.asyncRequest("getAccountsBalances", [name]).then(res => res && res[0]);
    };

    getUserOrdersByName = name => {
        return this.asyncRequest("getAccountHistory", name, -1, 10000, {select_ops: [ 'limit_order_create', 'fill_order', "limit_order_cancel", "limit_order_cancel_ex" ]}).catch(err => console.error(err));
    };

    getUserHistoryByName = name => {
        return this.asyncRequest("getAccountHistory", name, -1, 10000).catch(err => console.error(err));
    };

    getTicker = ticker => {
        return this.asyncRequest("getTicker", ticker);
    };

    getTickerToGolos = base => {
        return this.getTicker([base, "GOLOS"]);
    };

    getLastTrade = ticker => {
        return this.asyncRequest("getRecentTrades", 1, ticker);
    };

    getLastTradeToGolos = base => {
        return this.getLastTrade([base, "GOLOS"]);
    };

    getPriceHistory = (pair, resolution, startDate, endDate) => {
        return this.asyncRequest("getTradeHistory", startDate, endDate, resolution, pair);
    }
};