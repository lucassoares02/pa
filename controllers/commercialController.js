const pool = require('../db');
const commercialService = require('../services/commercialService');
const productService = require('../services/productService');
const associateService = require('../services/associateService');
const commercialActionProductAssociateService = require('../services/commercialActionProductAssociateService');

const createCommercialAction = async (req, res) => {
    console.log("Create Commercial");

    const { list, month, year } = req.body;
    let result = [];
    try {
        for (const item of list.actions) {

            const { descriptionAction } = item;
            const response = await commercialService.createCommercial(descriptionAction, month, year);
            result.push(response);

            console.log("Step 1");

            for (const associate of item.client) {

                const { document, client, products } = associate;

                console.log("Step 2");
                console.log(document);
                console.log(client);


                const responseAssociate = await associateService.createAssociate(document, client);
                result.push(responseAssociate);

                console.log("Step 2.5");

                console.log("Products: ", products);

                const responseProducts = await productService.createMultiplesProducts(products);
                result.push(responseProducts);

                console.log("Step 3");


                let commercials = [];

                for (const prod of products) {

                    console.log("Step 4");


                    const productFound = responseProducts.find(p => p.sku === prod.id);

                    console.log(productFound);

                    commercials.push({
                        quantity: prod.quantity,
                        unitSellout: prod.unitSellout,
                        paid: item.paid,
                        paymentType: item.paymentType,
                        invoiceNumber: associate.numberNote,
                        month: month,
                        year: year,
                        product_id: productFound.id,
                        associate_id: responseAssociate.id,
                        commercial_action_id: response.id
                    });

                    console.log("Step 5");

                }

                console.log("Step 6");

                const responseActions = await commercialActionProductAssociateService.createMultiplesActions(commercials);
                console.log(responseActions);
                console.log("Step 7");
                result.push(responseActions);
            }
            console.log("Finished Action: ", descriptionAction);
        }
        res.status(201).json(result);
    } catch (err) {
        console.error("Error creating commercial action: ", err);
        res.status(500).json({ error: err.message });
    }


};

const readCommercialActionDetails = async (req, res) => {
    console.log("Get Commercial Action Details");

    const { id, associate } = req.params;

    try {
        const result = await commercialService.readCommercial(id, associate);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting commercial action: ", err);
        res.status(500).json({ error: err.message });
    }
}

const readCommercialActions = async (req, res) => {
    console.log("Get Commercial");
    try {
        const result = await commercialService.readCommercialAll();
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting commercial actions: ", err);
        res.status(500).json({ error: err.message });
    }
};

const readAvailableMonhts = async (req, res) => {
    console.log("Get Available Months");

    try {
        const result = await commercialService.readAvailableMonhts(req);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting available months: ", err);
        res.status(500).json({ error: err.message });
    }
};

const readAvailableYear = async (req, res) => {
    console.log("Get Available Years");
    try {
        const result = await commercialService.readAvailableYear(req);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting available years: ", err);
        res.status(500).json({ error: err.message });
    }
};

const readCommercialActionsWithJoin = async (req, res) => {
    console.log("Get Commercial With Join");

    try {
        const result = await commercialService.readCommercialWithJoin(req);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting commercial actions: ", err);
        res.status(500).json({ error: err.message });
    }
};

const readTopAssociates = async (req, res) => {
    console.log("Get Top Associates");

    try {
        const result = await commercialService.readTopAssociates(req);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting commercial actions: ", err);
        res.status(500).json({ error: err.message });
    }
};

const readCommercialActionAssociates = async (req, res) => {
    console.log("Get Commercial Action Associates");

    const { id } = req.params;

    try {
        const result = await commercialService.readCommercialAssociates(id);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting commercial action: ", err);
        res.status(500).json({ error: err.message });
    }
};

const readCommercialActionProducts = async (req, res) => {
    console.log("Get Commercial Action Products");

    const { action } = req.params;

    try {
        const result = await commercialService.readCommercialProducts(action);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting commercial action: ", err);
        res.status(500).json({ error: err.message });
    }
};


module.exports = {
    createCommercialAction, readCommercialActions, readCommercialActionsWithJoin, readCommercialActionAssociates
    , readCommercialActionProducts, readCommercialActionDetails, readAvailableMonhts, readAvailableYear, readTopAssociates

};
