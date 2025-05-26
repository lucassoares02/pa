const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const login = require('../controllers/loginController');
const commercial = require('../controllers/commercialController');
const payments = require('../controllers/paymentsController');
const mailer = require('../controllers/maillerController');
const authMiddleware = require('../src/middlewares/middleware');


router.get('/', (req, res) => {
  res.send('API is running 🚀');
});


router.post('/signin', login.signin);

// USER
router.get('/users', authMiddleware, user.getAllUsers);
router.get('/associates/:user_id', authMiddleware, user.getAssociateByUser);
router.post('/users', authMiddleware, user.createUser);

// COMMERCIAL ACTIONS
router.post('/commercial-action', authMiddleware, commercial.createCommercialAction);
router.get('/commercial-actions', authMiddleware, commercial.readCommercialActions);
router.get('/available-months/:year/:company', authMiddleware, commercial.readAvailableMonhts);
router.get('/available-years/:company', authMiddleware, commercial.readAvailableYear);
router.get('/commercial-actions/:id', authMiddleware, commercial.readCommercialActionDetails);
router.get('/commercial-actions-with-join/:month/:year/:company', authMiddleware, commercial.readCommercialActionsWithJoin);
router.get('/commercial-action-associates/:id', authMiddleware, commercial.readCommercialActionAssociates);
router.get('/commercial-action-products/:action', authMiddleware, commercial.readCommercialActionProducts);
router.get('/commercial-actions-top-associates/:year', authMiddleware, commercial.readTopAssociates);

// PAYMENTS 
router.get('/payments-associates/:month/:year', authMiddleware, payments.readPaymentsAssociates);
router.put('/payments-associate/:associate/:invoice', authMiddleware, payments.updatePaymentsAssociate);
router.post('/payments-associate-additional-info', authMiddleware, payments.createPaymentsInvoiceAssociate);
router.put('/payments-associate/:associate/:invoice/:oldInvoice', authMiddleware, payments.updatePaymentsInvoiceAssociate);
router.get('/payments-actions/:associate/:month/:year', authMiddleware, payments.readPaymentsActions);
router.get('/payments-action-products/:associate/:action', authMiddleware, payments.readPaymentsActionsProducts);
router.get('/payments-financial-summary/:month/:year/:company', authMiddleware, payments.readFinancialSummary);
router.get('/payments-financial-summary-graph/:year/:company', authMiddleware, payments.readFinancialSummaryGraph);

router.post('/send-email', mailer.sendEmail);


module.exports = router;
''