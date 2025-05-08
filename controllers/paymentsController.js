const pool = require('../db');
const paymentsService = require('../services/paymentsService');
const userController = require('../controllers/userController');

const readPaymentsAssociatesId = async (req, res) => {
    console.log("Get Payments Associates Id");

    const { id } = req.params;

    try {
        const result = await commercialService.readCommercialProducts(id);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting commercial action: ", err);
        res.status(500).json({ error: err.message });
    }
};

const readPaymentsAssociates = async (req, res) => {
    console.log("Get Payments Associates");

    const { month, year } = req.params;

    try {
        const result = await paymentsService.readPaymentsAssociates(month, year);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting payments associates: ", err);
        res.status(500).json({ error: err.message });
    }
};

const readPaymentsActions = async (req, res) => {
    console.log("Get Payments Associates");

    const { associate, month, year } = req.params;

    try {
        const result = await paymentsService.readPaymentsActions(associate, month, year);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting payments associates: ", err);
        res.status(500).json({ error: err.message });
    }
};

const readPaymentsActionsProducts = async (req, res) => {
    console.log("Get Payments Associates");

    const { associate, action } = req.params;

    try {
        if (associate == "null" || associate == null) {
            const response = await userController.findAssociateByUser(req, res);
            if (response) {
                const result = await paymentsService.readPaymentsActionsProducts(response.id, action);
                res.status(200).json(result);
            }
        } else {
            const result = await paymentsService.readPaymentsActionsProducts(associate, action);
            res.status(200).json(result);
        }
    } catch (err) {
        console.error("Error getting payments associates: ", err);
        res.status(500).json({ error: err.message });
    }
};

const updatePaymentsAssociate = async (req, res) => {
    console.log("Put Payments Associates");

    const { associate, invoice, action } = req.params;

    try {
        const result = await paymentsService.updatePaymentsAssociate(associate, invoice, action);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting payments associates: ", err);
        res.status(500).json({ error: err.message });
    }
};

const updatePaymentsInvoiceAssociate = async (req, res) => {
    console.log("Put Payments Associates");

    const { associate, invoice, oldInvoice } = req.params;

    try {
        const result = await paymentsService.updatePaymentsInvoiceAssociate(associate, invoice, oldInvoice);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting payments associates: ", err);
        res.status(500).json({ error: err.message });
    }
};

const createPaymentsInvoiceAssociate = async (req, res) => {
    console.log("Create Payments Associates");


    const { observation, invoice, payment, month, year, associate, action } = req.body;

    try {
        const resultPayments = await paymentsService.readPaymentsAdditionalInfo(month, year, associate, action);
        console.log("Result Payments: ", resultPayments);
        console.log("---------------------------");

        if (resultPayments.length > 0) {
            console.log("IF");
            const result = await paymentsService.updatePaymentsAdditionalInfo(observation, invoice, payment, month, year, associate, action);
            await paymentsService.updatePaymentsAssociate(associate, invoice, action, month, year);

            return res.status(200).json(result);
        } else {
            console.log("ELSE");
            const result = await paymentsService.createPaymentsAdditionalInfo(observation, invoice, payment, month, year, associate, action);
            await paymentsService.updatePaymentsAssociate(associate, invoice, action, month, year);
            return res.status(200).json(result);
        }
    } catch (err) {
        console.error("Error getting payments associates: ", err);
        res.status(500).json({ error: err.message });
    }
};


const readFinancialSummary = async (req, res) => {
    console.log("Get Financial Summary");

    try {
        const result = await paymentsService.getFinancialSummary(req);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting financial summary: ", err);
        res.status(500).json({ error: err.message });
    }
};


const readFinancialSummaryGraph = async (req, res) => {
    console.log("Get Financial Summary Graph");
    const { year } = req.params;
    try {
        const result = await paymentsService.getPaymentSummaryGraph(req);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error getting financial summary graph: ", err);
        res.status(500).json({ error: err.message });
    }
};


module.exports = { readPaymentsAssociatesId, readPaymentsAssociates, readPaymentsActions, readPaymentsActionsProducts, updatePaymentsAssociate, updatePaymentsInvoiceAssociate, createPaymentsInvoiceAssociate, readFinancialSummary, readFinancialSummaryGraph };
