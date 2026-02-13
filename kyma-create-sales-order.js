const axios = require('axios');

module.exports = {
    main: async function (event, context) {

        const scv2 = 'https://my1000210.de1.demo.crm.cloud.sap/sap/c4c/api/v1/';
        const authSCV2 = 'Basic STU3NDYxMzpTdGFubGV5SGFubmEyMjA2IQ==';

        // GET Event Payload
        const payload = event.extensions.request.body;
        console.log(payload);

        const headerFields = payload.headerFields;
        const lineItems = payload.lineItems;

        // Prepare Payload for Sales Order Creation
        const itemPayload = lineItems.map(item => ({
            productDisplayId: item.senderMaterialNumber,
            quantity: {
                content: item.quantity,
                uomCode: item.unitOfMeasure
            }
        }));

        // CREATE Sales Order
        const salesOrderID = await createCase(scv2, authSCV2, headerFields, itemPayload);

        const output = JSON.stringify({
            salesOrderID: salesOrderID
        });

        return output;
    }
}

async function createCase(scv2, auth, headerFields, itemPayload) {
    const fullURL = scv2 + 'case-service/cases';

    let data = JSON.stringify({
        "documentType": "ZOR",
        "account": {
            "displayId": headerFields.senderId
        },
        "items": itemPayload
    });

    let createSalesOrderConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: fullURL,
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        const response = await axios(createSalesOrderConfig);
        console.log('Sales Order created successfully:', response.data.value.displayId);
        return response.data.value.displayId; // Return the sales order ID
    } catch (error) {
        console.error('Error creating case:', error);
        throw error; // Propagate the error to be handled by the caller
    }
}