const axios = require('axios');

module.exports = {
    main: async function (event, context) {

        const scv2 = 'https://my1000210.de1.demo.crm.cloud.sap/sap/c4c/api/v1/';
        const authSCV2 = 'Basic STU3NDYxMzpTdGFubGV5SGFubmEyMjA2IQ==';

        // GET Event Payload
        const payload = event.extensions.request.body;

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
        const salesOrderID = await createSalesOrder(scv2, authSCV2, headerFields, itemPayload);

        const responsePayload = {
                salesOrderId: salesOrderID
        };

        return responsePayload;

    }
}

async function createSalesOrder(scv2, auth, headerFields, itemPayload) {
    const fullURL = scv2 + 'sales-order-service/salesOrders';

    let data = JSON.stringify({
        "documentType": "ZOR",
        "name": "Automatic Joule Sales Order",
        "account": {
            "displayId": headerFields.senderId
        },
        "currency": "EUR",
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
        console.error('Error creating sales order:', error);
        throw error; // Propagate the error to be handled by the caller
    }
}