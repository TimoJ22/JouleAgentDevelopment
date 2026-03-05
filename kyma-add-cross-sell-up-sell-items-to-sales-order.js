const axios = require('axios');

module.exports = {
    main: async function (event, context) {

        const scv2 = 'https://my1000210.de1.demo.crm.cloud.sap/sap/c4c/api/v1/';
        const authSCV2 = 'Basic STU3NDYxMzpTdGFubGV5SGFubmEyMjA2IQ==';

        // GET Event Payload
        const payload = event.extensions.request.body;

        const sourceInput = payload.sourceInput;
        const lineItems = sourceInput.lineItems;
        const crossSellUpSellItems = payload.crossSellUpSellItems;

        if (!Array.isArray(lineItems)) {
            throw new Error("lineItems must be an array");
        }

        // Get highest existing itemNumber (convert to number first)
        const highestItemNumber = lineItems.reduce((max, item) => {
            return Math.max(max, Number(item.itemNumber));
        }, 0);

        const newItemNumber = highestItemNumber + 10;

        const newLineItem = {
            customerMaterialNumber: crossSellUpSellItems.productId,
            description: crossSellUpSellItems.description,
            itemNumber: String(newItemNumber),
            netAmount: crossSellUpSellItems.price,
            quantity: 1,
            senderMaterialNumber: crossSellUpSellItems.productId,
            unitOfMeasure: "EA",
            unitPrice: crossSellUpSellItems.price
        };

        sourceInput.lineItems.push(newLineItem);

        console.log(sourceInput);

        return sourceInput;
    }

}