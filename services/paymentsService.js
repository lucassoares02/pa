const pool = require("../db");

const readPaymentsAssociates = async (month, year) => {
  try {
    // const result = await pool.query("SELECT a.*, COUNT(DISTINCT capa.commercial_action_id) AS number_of_actions, SUM(capa.total_price) AS total, CASE WHEN COUNT(CASE WHEN capa.paid = true THEN 1 END) = 0 THEN 0 WHEN COUNT(CASE WHEN capa.paid = true THEN 1 END) = COUNT(capa.commercial_action_id) THEN 1 ELSE 2 END AS status_payment, SUM(CASE WHEN capa.paid = true THEN capa.total_price ELSE 0 END) AS paid_value FROM associates a JOIN commercial_action_product_associate capa ON capa.associate_id = a.id JOIN commercial_actions ca ON ca.id = capa.commercial_action_id GROUP BY a.id;");
    // const result = await pool.query("SELECT a.*, ai.invoice as invoice, ai.payment_type, ai.observation as observation, COUNT(DISTINCT capa.commercial_action_id) AS number_of_actions, SUM(capa.total_price) AS total, CASE WHEN COUNT(CASE WHEN capa.paid = true THEN 1 END) = 0 THEN 0 WHEN COUNT(CASE WHEN capa.paid = true THEN 1 END) = COUNT(capa.commercial_action_id) THEN 1 ELSE 3 END AS status_payment, SUM(CASE WHEN capa.paid = true THEN capa.total_price ELSE 0 END) AS paid_value FROM associates a JOIN commercial_action_product_associate capa ON capa.associate_id = a.id AND capa.month = $1 JOIN commercial_actions ca ON ca.id = capa.commercial_action_id LEFT JOIN additional_infos ai ON ai.associate_id = a.id and ai.commercial_action_id is null AND ai.month = $1 where ca.month = $1 GROUP BY a.id, ai.id;", [month, year]);
    const result = await pool.query("SELECT a.*, ai.invoice as invoice, ai.payment_type, ai.observation as observation, COUNT(DISTINCT capa.commercial_action_id) AS number_of_actions, SUM(capa.total_price) AS total, CASE WHEN COUNT(CASE WHEN capa.paid = true THEN 1 END) = 0 THEN 0 WHEN COUNT(CASE WHEN capa.paid = true THEN 1 END) = COUNT(capa.commercial_action_id) THEN 1 ELSE 3 END AS status_payment, SUM(CASE WHEN capa.paid = true THEN capa.total_price ELSE 0 END) AS paid_value FROM associates a JOIN commercial_action_product_associate capa ON capa.associate_id = a.id AND capa.month = $1 AND capa.year = $2 JOIN commercial_actions ca ON ca.id = capa.commercial_action_id LEFT JOIN additional_infos ai ON ai.associate_id = a.id and ai.commercial_action_id is null AND ai.month = $1 and ai.year = $2 where ca.month = $1 and ca.year = $2 GROUP BY a.id, ai.id;", [month, year]);

    return result.rows;
  } catch (err) {
    console.error("Error reading payments associates: ", err);
    return { error: err.message };
  }
}

const readPaymentsActions = async (associate, month, year) => {
  try {
    const result = await pool.query("SELECT ca.*, ai.invoice, SUM(capa.total_price) AS total, CASE WHEN COUNT(CASE WHEN capa.paid = true THEN 1 END) = 0 THEN 0 WHEN COUNT(CASE WHEN capa.paid = true THEN 1 END) = COUNT(capa.commercial_action_id) THEN 1 ELSE 2 END AS status_payment, SUM(CASE WHEN capa.paid = true THEN capa.total_price ELSE 0 END) AS paid_value FROM associates a JOIN commercial_action_product_associate capa ON capa.associate_id = a.id JOIN commercial_actions ca ON ca.id = capa.commercial_action_id LEFT JOIN additional_infos ai ON ai.commercial_action_id = ca.id and ai.associate_id = $1 WHERE a.id = $1 and ca.month = $2 and ca.year = $3 GROUP BY ca.id, ai.id, a.id;", [associate, month, year]);
    return result.rows;
  } catch (err) {
    console.error("Error reading payments actions: ", err);
    return { error: err.message };
  }
}

const readPaymentsActionsProducts = async (associate, action) => {
  try {
    const result = await pool.query("SELECT p.*, capa.total_price as total, CASE WHEN COUNT(CASE WHEN capa.paid = true THEN 1 END) = 0 THEN 0 WHEN COUNT(CASE WHEN capa.paid = true THEN 1 END) = COUNT(capa.id) THEN 1 ELSE 2 END AS status_payment FROM associates a JOIN commercial_action_product_associate capa ON capa.associate_id = a.id JOIN commercial_actions ca ON ca.id = capa.commercial_action_id JOIN products p ON p.id = capa.product_id WHERE a.id = $1 AND ca.id = $2 GROUP BY ca.id, a.id, p.id, capa.id;", [associate, action]);
    return result.rows;
  } catch (err) {
    console.error("Error reading payments actions products: ", err);
    return { error: err.message };
  }
}

const updatePaymentsAssociate = async (associate, invoice, action, month, year) => {
  let result;
  try {
    if (action == null || action == undefined) {
      result = await pool.query("update commercial_action_product_associate set paid = true, invoice_number = $1 where associate_id = $2 and paid = false and month = $3 and invoice_number is null or invoice_number = '';", [invoice, associate, month]);
    } else {
      result = await pool.query("update commercial_action_product_associate set paid = true, invoice_number = $1 where associate_id = $2 and commercial_action_id = $3 and month = $4 returning *;", [invoice, associate, action, month]);
    }
    if (result.rowCount === 0) {
      return { message: "No rows updated" };
    }
    return result.rows;
  } catch (err) {
    console.error("Error reading payments actions: ", err);
    return { error: err.message };
  }
}

const updatePaymentsInvoiceAssociate = async (associate, invoice, oldInvoice) => {
  try {
    const result = await pool.query("update commercial_action_product_associate set paid = true, invoice_number = $1 where associate_id = $2 and paid = false and invoice_number = $3 returning *;", [invoice, associate, oldInvoice]);
    if (result.rowCount === 0) {
      return { message: "No rows updated" };
    }
    return result.rows;
  } catch (err) {
    console.error("Error reading payments actions: ", err);
    return { error: err.message };
  }
}

const getFinancialSummary = async (req) => {
  console.log("Get Financial Summary");

  const { month, year, company } = req.params;
  const user = req.user;


  try {
    // const result = await pool.query("SELECT COALESCE(SUM(capa.total_price), 0) AS total, COALESCE(SUM(CASE WHEN capa.paid = TRUE THEN capa.total_price ELSE 0 END), 0) AS paid, COALESCE(SUM(CASE WHEN capa.paid = FALSE THEN capa.total_price ELSE 0 END), 0) AS pending FROM commercial_action_product_associate capa JOIN commercial_actions ca ON capa.commercial_action_id = ca.id WHERE ($1::integer IS NULL OR ca.month = $1::integer);", [month]);
    let result;
    if (user.type == 2) {
      if (month != "null" && year != "null" && month != 0 && year != 0) {
        result = await pool.query(`SELECT 'Total' AS label, COALESCE(SUM(capa.total_price), 0) AS value
          FROM commercial_action_product_associate capa
          JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
          join user_associate ua on ua.associate_id = capa.associate_id
          WHERE ($1::integer IS NULL OR ca.month = $1::integer) and ($2::integer IS NULL OR ca.year = $2::integer) and ua.user_id = $3` + (company != "0" ? ` and ua.associate_id = $4` : ``) + `
  
          UNION ALL
  
          SELECT 'Recebido' AS label, COALESCE(SUM(CASE WHEN capa.paid = TRUE THEN capa.total_price ELSE 0 END), 0) AS value
          FROM commercial_action_product_associate capa
          JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
          join user_associate ua on ua.associate_id = capa.associate_id
          WHERE ($1::integer IS NULL OR ca.month = $1::integer) and ($2::integer IS NULL OR ca.year = $2::integer) and ua.user_id = $3` + (company != "0" ? ` and ua.associate_id = $4` : ``) + `
  
          UNION ALL
  
          SELECT 'À receber' AS label, COALESCE(SUM(CASE WHEN capa.paid = FALSE THEN capa.total_price ELSE 0 END), 0) AS value
          FROM commercial_action_product_associate capa
          JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
          join user_associate ua on ua.associate_id = capa.associate_id
          WHERE ($1::integer IS NULL OR ca.month = $1::integer) and ($2::integer IS NULL OR ca.year = $2::integer) and ua.user_id = $3` + (company != "0" ? ` and ua.associate_id = $4` : ``) + `;`, company != "0" ? [month, year, user.id, company] : [month, year, user.id]);

      } else if (year != "null" && year != null && year != 0 && year != "0") {

        result = await pool.query(` SELECT 'Total' AS label, COALESCE(SUM(capa.total_price), 0) AS value
            FROM commercial_action_product_associate capa
            JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
            join user_associate ua on ua.associate_id = capa.associate_id
            WHERE ($1::integer IS NULL OR ca.year = $1::integer) and ua.user_id = $2` + (company != "0" ? ` and ua.associate_id = $3` : ``) + `

            UNION ALL

            SELECT 'Recebido' AS label, COALESCE(SUM(CASE WHEN capa.paid = TRUE THEN capa.total_price ELSE 0 END), 0) AS value
            FROM commercial_action_product_associate capa
            JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
            join user_associate ua on ua.associate_id = capa.associate_id
            WHERE ($1::integer IS NULL OR ca.year = $1::integer) and ua.user_id = $2` + (company != "0" ? ` and ua.associate_id = $3` : ``) + `

            UNION ALL

            SELECT 'À receber' AS label, COALESCE(SUM(CASE WHEN capa.paid = FALSE THEN capa.total_price ELSE 0 END), 0) AS value
            FROM commercial_action_product_associate capa
            JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
            join user_associate ua on ua.associate_id = capa.associate_id
            WHERE ($1::integer IS NULL OR ca.year = $1::integer) and ua.user_id = $2` + (company != "0" ? ` and ua.associate_id = $3` : `;`) + ``, company != "0" ? [year, user.id, company] : [year, user.id]);


      } else {

        result = await pool.query(`SELECT
            'Total' AS label,
            COALESCE(SUM(capa.total_price), 0) AS value
        FROM
            commercial_action_product_associate capa
            JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
            join user_associate ua on ua.associate_id = capa.associate_id
            and ua.user_id = $1` + (company != "0" ? ` and ua.associate_id = $2` : ``) + `
        UNION
        ALL
        SELECT
            'Recebido' AS label,
            COALESCE(
                SUM(
                    CASE
                        WHEN capa.paid = TRUE THEN capa.total_price
                        ELSE 0
                    END
                ),
                0
            ) AS value
        FROM
            commercial_action_product_associate capa
            JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
            join user_associate ua on ua.associate_id = capa.associate_id
            and ua.user_id = $1` + (company != "0" ? ` and ua.associate_id = $2` : ``) + `
        UNION
        ALL
        SELECT
            'À receber' AS label,
            COALESCE(
                SUM(
                    CASE
                        WHEN capa.paid = FALSE THEN capa.total_price
                        ELSE 0
                    END
                ),
                0
            ) AS value
        FROM
            commercial_action_product_associate capa
            JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
            join user_associate ua on ua.associate_id = capa.associate_id
            and ua.user_id = $1`  + (company != "0" ? ` and ua.associate_id = $2` : ``) + ` ;`, company != "0" ? [user.id, company] : [user.id]);

      }


    } else if (user.type == 0 || user.type == 1) {






      if (month != "null" && year != "null") {
        result = await pool.query(`SELECT 'Total' AS label, COALESCE(SUM(capa.total_price), 0) AS value
          FROM commercial_action_product_associate capa
          JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
          WHERE ($1::integer IS NULL OR ca.month = $1::integer) and ($2::integer IS NULL OR ca.year = $2::integer)

          UNION ALL

          SELECT 'Pago' AS label, COALESCE(SUM(CASE WHEN capa.paid = TRUE THEN capa.total_price ELSE 0 END), 0) AS value
          FROM commercial_action_product_associate capa
          JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
          WHERE ($1::integer IS NULL OR ca.month = $1::integer) and ($2::integer IS NULL OR ca.year = $2::integer)

          UNION ALL

          SELECT 'Pendente' AS label, COALESCE(SUM(CASE WHEN capa.paid = FALSE THEN capa.total_price ELSE 0 END), 0) AS value
          FROM commercial_action_product_associate capa
          JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
          WHERE ($1::integer IS NULL OR ca.month = $1::integer) and ($2::integer IS NULL OR ca.year = $2::integer);`, [month, year]);

      }
      else if (year != "null" && year != null && year != 0 && year != "0") {
        result = await pool.query(`SELECT 'Total' AS label, COALESCE(SUM(capa.total_price), 0) AS value
          FROM commercial_action_product_associate capa
          JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
          WHERE ($1::integer IS NULL OR ca.year = $1::integer)

          UNION ALL

          SELECT 'Pago' AS label, COALESCE(SUM(CASE WHEN capa.paid = TRUE THEN capa.total_price ELSE 0 END), 0) AS value
          FROM commercial_action_product_associate capa
          JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
          WHERE ($1::integer IS NULL OR ca.year = $1::integer)

          UNION ALL

          SELECT 'Pendente' AS label, COALESCE(SUM(CASE WHEN capa.paid = FALSE THEN capa.total_price ELSE 0 END), 0) AS value
          FROM commercial_action_product_associate capa
          JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
          WHERE ($1::integer IS NULL OR ca.year = $1::integer);`, [year]);

      } else {
        result = await pool.query(`SELECT 'Total' AS label, COALESCE(SUM(capa.total_price), 0) AS value
          FROM commercial_action_product_associate capa
          JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
          UNION ALL
          SELECT 'Pago' AS label, COALESCE(SUM(CASE WHEN capa.paid = TRUE THEN capa.total_price ELSE 0 END), 0) AS value
          FROM commercial_action_product_associate capa
          JOIN commercial_actions ca ON capa.commercial_action_id = ca.id
          UNION ALL
          SELECT 'Pendente' AS label, COALESCE(SUM(CASE WHEN capa.paid = FALSE THEN capa.total_price ELSE 0 END), 0) AS value
          FROM commercial_action_product_associate capa
          JOIN commercial_actions ca ON capa.commercial_action_id = ca.id; `);

      }
    }
    if (result.rowCount === 0) {
      return { message: "No rows updated" };
    }
    return result.rows;
  } catch (err) {
    console.error("Error reading payments actions: ", err);
    return { error: err.message };
  }
}

const updatePaymentsAdditionalInfo = async (observation, invoice, payment, month, year, associate, action) => {
  console.log("Update Payments Additional Info");
  let result;
  try {
    if (action == null || action == undefined) {
      result = await pool.query("update additional_infos set observation = $1, invoice = $2, payment_type = $3 where month = $4 and year = $5 and associate_id = $6 and commercial_action_id is null returning *;", [observation, invoice, payment, month, year, associate]);
    } else {
      result = await pool.query("update additional_infos set observation = $1, invoice = $2, payment_type = $3 where month = $4 and year = $5 and commercial_action_id = $6 returning *;", [observation, invoice, payment, month, year, action]);
    }
    if (result.rowCount === 0) {
      return { message: "No rows updated" };
    }
    return result.rows;
  } catch (err) {
    console.error("Error reading payments actions: ", err);
    return { error: err.message };
  }
}

const createPaymentsAdditionalInfo = async (observation, invoice, payment, month, year, associate, action) => {
  console.log("Create Payments Additional Info");
  try {
    const result = await pool.query("insert into additional_infos (observation, invoice, payment_type, month, year, associate_id, commercial_action_id, paid) values ($1, $2, $3, $4, $5, $6, $7, true) returning *;", [observation, invoice, payment, month, year, associate, action]);
    if (result.rowCount === 0) {
      return { message: "No rows updated" };
    }
    return result.rows;
  } catch (err) {
    console.error("Error reading payments actions: ", err);
    return { error: err.message };
  }
}


const readPaymentsAdditionalInfo = async (month, year, associate, action) => {

  let result;
  try {
    if (action == null || action == undefined) {
      result = await pool.query("select * from additional_infos where month = $1 and year = $2 and associate_id = $3 and commercial_action_id is null;", [month, year, associate]);
    } else {
      result = await pool.query("select * from additional_infos where month = $1 and year = $2 and associate_id = $3 AND commercial_action_id = $4;", [month, year, associate, action]);
    }
    return result.rows;
  } catch (err) {
    console.error("Error reading payments actions products: ", err);
    return { error: err.message };
  }
}

const getPaymentSummaryGraph = async (req) => {
  console.log("Get Payment Summary Graph");
  const { year, company } = req.params;
  const user = req.user;

  try {
    if (user.type == 2) {
      if (year != null && year != "null" && year != 0 && year != "0") {
        const result = await pool.query(`select ca.year, capa.month, SUM(capa.total_price) AS value FROM commercial_action_product_associate AS capa JOIN commercial_actions AS ca ON ca.id = capa.commercial_action_id join user_associate ua on ua.associate_id = capa.associate_id where ca."year" = $1 and ua.user_id = $2 ` + (company != "0" ? ` and ua.associate_id = $3` : ``) + ` GROUP BY ca.year, capa.month ORDER BY ca.year, capa.month; `, company != "0" ? [year, user.id, company] : [year, user.id]);
        return result.rows;
      } else {
        const result = await pool.query(`select ca.year, capa.month, SUM(capa.total_price) AS value FROM commercial_action_product_associate AS capa JOIN commercial_actions AS ca ON ca.id = capa.commercial_action_id join user_associate ua on ua.associate_id = capa.associate_id ` + (company != "0" ? `where ua.associate_id = $1` : `where ua.user_id = $1`) + ` GROUP BY ca.year, capa.month ORDER BY ca.year, capa.month; `, company != "0" ? [company] : [user.id]);
        return result.rows;
      }
    } else if (user.type == 0 || user.type == 1) {
      if (year != null && year != "null" && year != 0 && year != "0") {
        const result = await pool.query(`select ca.year, capa.month, SUM(capa.total_price) AS value FROM commercial_action_product_associate AS capa JOIN commercial_actions AS ca ON ca.id = capa.commercial_action_id  where ca."year" = $1 GROUP BY ca.year, capa.month ORDER BY ca.year, capa.month; `, [year]);
        return result.rows;
      } else {
        const result = await pool.query(`select ca.year, capa.month, SUM(capa.total_price) AS value FROM commercial_action_product_associate AS capa JOIN commercial_actions AS ca ON ca.id = capa.commercial_action_id GROUP BY ca.year, capa.month ORDER BY ca.year, capa.month; `);
        return result.rows;
      }
    }

  } catch (err) {
    console.error("Error reading payments actions products: ", err);
    return { error: err.message };
  }
}

module.exports = { readPaymentsAssociates, readPaymentsActions, readPaymentsActionsProducts, updatePaymentsAssociate, updatePaymentsAdditionalInfo, readPaymentsAdditionalInfo, updatePaymentsInvoiceAssociate, createPaymentsAdditionalInfo, getFinancialSummary, getPaymentSummaryGraph };

