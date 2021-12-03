import React, {useState} from "react";
import {connect} from "react-redux";
import {Card, BodyBold, Body, Box, Col, FlexBox, Row, HeadingBold, Heading} from "../helpers/global";
import {ViewChange} from "../helpers/pages/cabinet";
import {TabsWrapper} from "../helpers/tabs";
import {connectUserData} from "../../redux/actions/userData";
import {mixDataToBalance} from "../../utils/dataHandlers";
import {Table} from "../helpers/table";
import {useClassSetter} from "../../utils";

const WalletCardDisplay = ({ balances }) => {
    const [baseClass, setClass] = useClassSetter("balances-card");
    return(
        <Row>
            {balances.map((balance, id) => (
                <Col key={id} sm={6}>
                    <Card className={baseClass}>
                        <FlexBox>
                            {balance.img && (
                                <div className={setClass("image-wrapper")}>
                                    <img src={balance.img} alt={balance.fullName} />
                                </div>
                            )}
                            <div className={setClass("text-wrapper")}>
                                <Body text={balance.fullName} />
                                <Heading text={`${balance.amount} ${balance.symbol}`} />
                                <Body text={`${balance.amountInGolos} GOLOS`} color="font-secondary" />
                            </div>
                        </FlexBox>
                    </Card>
                </Col>
            ))}
        </Row>
    )
};

const WalletTableDisplay = ({ balances }) => {
    const [baseClass, setClass] = useClassSetter("balances-table");

    const tableHead = [
        {
            key: 'fullName',
            translateTag: 'currency',
            handleItem: (fullName, row) => (
                <FlexBox className={baseClass}>
                    {row.img && (
                        <div className={setClass("image-wrapper")}>
                            <img src={row.img} alt={row.fullName} />
                        </div>
                    )}
                    <Body text={fullName} />
                </FlexBox>
            ),
            className: 'fit-content'
        },
        {
            key: 'amount',
            translateTag: 'balance',
            handleItem: (item, row) => <BodyBold text={`${item} ${row.symbol}`} />,
            className: 'fit-content',
            isSortable: true
        },
        {
            key: 'amountInGolos',
            translateTag: 'balanceInGolos',
            handleItem: (item) => <Body text={item} color="font-secondary" />,
            className: 'align-right',
            isSortable: true
        }
    ];

    return(
        <Card>
            <Table tableHead={tableHead} rows={balances} />
        </Card>
    )
};


const Display = (props) => {
    const {totalBalance, balances: rawBalances} = props.userData;
    const balances = mixDataToBalance(rawBalances);

    const cardViewState = useState(false);
    const [isCardView] = cardViewState;

    const opsTabs = [{text: "Перевод"}, {text: "Пополнение"}, {text: "Вывод"}];

    return(
        <Row>
            <Col lg={7}>
                <Card pt={1.3} pr={1.5} pb={1} pl={2.4}>
                    <FlexBox justify="space-between">
                        <div>
                            <Body content="wallet.totalBalance" color="font-secondary" />
                            <HeadingBold text={`${totalBalance} GOLOS`} color="brand" />
                        </div>
                        <ViewChange cardViewState={cardViewState} />
                    </FlexBox>
                </Card>
                <Box mt={1.5}>
                    {isCardView ? <WalletCardDisplay balances={balances} /> : <WalletTableDisplay balances={balances} />}
                </Box>
            </Col>
            <Col lg={5}>
                <Card py={2.5} px={2}>
                    <TabsWrapper headingList={opsTabs}>
                        <BodyBold text="Перевод" />
                        <BodyBold text="Пополнение" />
                        <BodyBold text="Вывод" />
                    </TabsWrapper>
                </Card>
            </Col>
        </Row>
    )
};

export const Wallet = connect(connectUserData)(Display);