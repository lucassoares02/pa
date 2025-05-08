const pool = require("../db");

/**
 * Cria uma ação comercial
 * @param {string} quantity - Quantidade do produto
 * @param {string} unitPrice - Preço unitário do produto
 * @param {bool} paid - Pago
 * @param {int} paymentType - Tipo de pagamento
 * @param {string} invoiceNumber - Número da fatura
 * @param {int} product - ID do produto
 * @param {int} associate - ID do associado
 * @param {int} commercialAction - ID da ação comercial
 */
const createAction = async (quantity, unitPrice, paid, paymentType, invoiceNumber, product, associate, commercialAction) => {

  // const existingCommercialActionProductsAssociate = await pool.query(
  //   "SELECT * FROM commercial_action_product_associate WHERE product_id = $1 AND associate_id = $2 aND commercial_action_id = $3",
  //   [product, associate, commercialAction]
  // );
  // if (existingCommercialActionProductsAssociate.rows.length > 0) {
  //   return existingCommercialActionProductsAssociate.rows[0];
  // } else {
  // }

  const result = await pool.query("INSERT INTO commercial_action_product_associate (quantity, unit_price, paid, payment_type, invoice_number, product_id, associate_id, commercial_action_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
    [quantity, unitPrice, paid, paymentType, invoiceNumber, product, associate, commercialAction]);
  return result.rows[0];


};

const createMultiplesActions = async (commercials) => {
  if (!commercials.length) return [];

  const values = [];
  const placeholders = commercials.map((item, index) => {
    const baseIndex = index * 10;
    values.push(
      item.quantity,
      item.unitSellout,
      item.paid,
      item.paymentType,
      item.invoiceNumber,
      item.product_id,
      item.associate_id,
      item.commercial_action_id,      
      item.month,
      item.year
    );
    return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10} )`;
  }).join(", ");

  const query = `
    INSERT INTO commercial_action_product_associate 
      (quantity, unit_price, paid, payment_type, invoice_number, product_id, associate_id, commercial_action_id, month, year)
    VALUES ${placeholders}
    RETURNING *;
  `;

  const result = await pool.query(query, values);
  return result.rows;
};

module.exports = { createAction, createMultiplesActions };
