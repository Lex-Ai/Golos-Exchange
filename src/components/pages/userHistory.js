import React from "react";
import {ApiRequest} from "../../utils/requests";
import {getUserData} from "../../redux/actions/userData";
import {handleUserHistory} from "../../utils/dataHandlers";
import {LoadData} from "../../utils";
import {Body, Card, Metadata} from "../helpers/global";
import {Table} from "../helpers/table";
import {PageLoader} from "../layout";

const tableHead = [
    {
        key: 'icon',
        translateTag: '',
        className: "align-center"
    },
    {
        key: 'timestamp',
        translateTag: 'dateAndTime',
        handleItem: (item) => new Date(item).toLocaleString(),
        className: "fit-content",
        isSortable: true
    },
    {
        key: 'type',
        translateTag: 'type',
        handleItem: (item) => <Body content={`historyTable.${item}.title`} />,
        className: "fit-content"
    },
    {
        key: 'summ',
        translateTag: 'summ',
        className: "fit-content"
    },
    {
        key: 'descData',
        translateTag: 'desc',
        handleItem: (item, row) => <Metadata content={`historyTable.${row.type}.description`} additionalData={item} />,
        className: "fit-content"
    }
];

export const UserHistory = () => {
    const fn = () => new ApiRequest().getUserHistoryByName(getUserData().name).then(handleUserHistory);
    const [data, isLoading] = LoadData(fn, 500);

    return isLoading
        ? <PageLoader />
        : (
            <Card>
                { data.length
                    ? <Table tableHead={tableHead} rows={data} />
                    : <Body content="history.emptyHistory" />
                }
            </Card>
        )
};