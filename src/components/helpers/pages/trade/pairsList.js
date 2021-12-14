import React, {Fragment, useEffect, useRef, useState} from "react";
import {useHistory} from "react-router";
import {Input} from "../../form/helpers";
import {Box, FlexBox, Metadata} from "../../global";
import {FavIcon, SearchIcon} from "../../../../svg";
import {TabsHeader} from "../../tabs";
import {getAssetsList} from "../../../../redux/actions/assets";
import {getStorage, LoadData, setStorage} from "../../../../utils";
import {getAllRates, getRate} from "../../../../utils/dataHandlers";
import {Table} from "../../table";
import ScrollContainer from "react-indiana-drag-scroll";

const PairListTable = ({rows, onFavsChange}) => {
    const history = useHistory();

    const handleFavStorage = (base, symbol, isActive) => {
        const pair = `${base}/${symbol}`;

        let favList = getStorage("favorites") || [];

        if(isActive){
            const reversePair = pair.split("/").reverse().join("/");
            favList = favList.filter(el => {
                return ![pair, reversePair].includes(el);
            });
        } else {
            favList.push(pair);
        }

        setStorage("favorites", favList);
    };

    const onFavsClick = (base, symbol, isActive) => (e) => {
        e.stopPropagation();
        handleFavStorage(base, symbol, isActive);
        if(onFavsChange) onFavsChange(base, symbol, isActive);
    };

    const isPairInFavs = (base, quote) => {
        const favList = getStorage("favorites") || [];

        const pair = `${base}/${quote}`;
        const reversePair = pair.split("/").reverse().join("/");

        return Boolean(favList.find(el => [pair, reversePair].includes(el)));
    };

    const changeTradePair = (row) => {
        history.push(`/trade/${row.base}_${row.symbol}`);
    };

    const tableHead = [
        {
            key: 'symbol',
            translateTag: '',
            handleItem: (symbol, row) => {
                const isActive = isPairInFavs(row.base, symbol);
                return (
                    <button onClick={onFavsClick(row.base, symbol, isActive)}>
                        <FavIcon fill={`var(--${isActive ? "brand" : "brand-bg"})`}/>
                    </button>
                )
            }
        },
        {
            key: 'symbol',
            translateTag: 'pair',
            handleItem: (item, row) => (
                <FlexBox>
                    <Metadata text={row.base} />
                    <Metadata text="/" />
                    <Metadata text={item} color="brand" />
                </FlexBox>
            )
        },
        {
            key: 'rate',
            translateTag: 'lastPrice'
        },
        {
            key: 'rateChange',
            translateTag: 'change',
            handleItem: (item) => (
                item
            ),
            className: 'align-right'
        }
    ];

    return (
        <Table
            tableHead={tableHead}
            rows={rows}
            onRowClick={changeTradePair}
        />
    )
};

const PairListContent = ({base, search}) => {
    const req = () => getAllRates(base);
    const [data, isLoading, reloadData, reloadPage] = LoadData(req);
    const [favs, setFavsList] = useState(getStorage("favorites") || []);

    useEffect(reloadPage, [base]);
    // useEffect(() => {
    //     const interval = setInterval(reloadData, 5000);
    //     return () => clearInterval(interval);
    // }, [base]);

    if(isLoading) return "Loading";

    const rows = data.filter(el => !search || el.symbol.includes(search) || el.symbol.includes(base));

    const onFavsChange = (base, symbol, isActive) => {
        const newFavs = {...favs};
        newFavs[symbol] = !isActive;

        setFavsList(newFavs);
    };

    return rows.length
        ? <PairListTable rows={rows} onFavsChange={onFavsChange} />
        : "Empty";
};

const FavListContent = ({search}) => {
    const req = async () => {
        const favList = getStorage("favorites");
        return Promise.all(favList.map(el => {
            const pair = el.split("/");
            return getRate(pair);
        }));
    };
    const [data, isLoading, reloadData, reloadPage] = LoadData(req);

    useEffect(reloadPage, []);
    // useEffect(() => {
    //     const interval = setInterval(reloadData, 5000);
    //     return () => clearInterval(interval);
    // }, []);

    if(isLoading) return "Loading";

    const rows = data.filter(el => !search || el.symbol.includes(search));

    return rows.length
        ? <PairListTable rows={rows} onFavsChange={reloadData} />
        : "Empty";
};

export const PairsList = ({base}) => {
    const list = getAssetsList();
    const initialIndex = list.findIndex(symbol => symbol === base);
    const [activeTab, setActiveTab] = useState(initialIndex + 1);
    const [search, setSearch] = useState();
    const tabsHeading = [
        { text: <FavIcon fill="var(--brand)" /> },
        ...list.map(text => ({ text }))
    ];
    return(
        <Fragment>
            <Box>
                <Input
                    name="currency"
                    value={search}
                    iconRight={SearchIcon}
                    onChange={e => setSearch(e.target.value.toUpperCase())}
                />
            </Box>
            <div className="pairs-list">
                <ScrollContainer className="pairs-list__header" vertical={false}>
                    <TabsHeader
                        list={tabsHeading}
                        defaultActiveId={activeTab}
                        handleClick={setActiveTab}
                    />
                </ScrollContainer>
                <div className="pairs-list__content">
                    {activeTab === 0
                        ? <FavListContent search={search} />
                        : <PairListContent base={list[activeTab - 1]} search={search} />
                    }
                </div>
            </div>
        </Fragment>
    )
};