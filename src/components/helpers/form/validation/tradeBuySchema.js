import {
    balanceOnAmountChange,
    precisionOnAmountChange,
    schema,
    yupNum,
    yupString
} from "./helpers";

export const tradeBuySchema = schema({
    price: yupString().required(),
    amount: yupString()
        .test(precisionOnAmountChange("baseAssetId"))
        .required(),
    range: yupNum(),
    result: yupString()
        .test(balanceOnAmountChange("quoteAssetId"))
        .test(precisionOnAmountChange("quoteAssetId"))
        .required()
});