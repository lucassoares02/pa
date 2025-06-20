const { compare } = require("bcrypt");
const pool = require("../db");

/**
 * Cria uma ação comercial
 * @param {string} description - Descrição da ação
 * @param {string} month - Mês da ação (1 a 12)
 * @param {string} notes - Observações adicionais
 */
const createCommercial = async (description, month, year) => {


  const existingAction = await pool.query(
    "SELECT * FROM commercial_actions WHERE description = $1 AND month = $2 and year = $3",
    [description, month, year]
  );

  console.log("existingAction", existingAction.rows);
  if (existingAction.rows.length > 0) {
    return existingAction.rows[0];
  } else {
    const result = await pool.query("INSERT INTO commercial_actions (description, month, notes, year) VALUES ($1, $2, $3, $4) RETURNING *",
      [description, month, "", year]);
    return result.rows[0];
  }


};

const readCommercial = async (id, associate) => {
  try {
    // const result = await pool.query("SELECT * FROM commercial_actions where id = $1", [id]);
    const result = await pool.query(`SELECT ca.*, ai.invoice, ai.observation FROM commercial_actions ca left join additional_infos ai on ai."month" = ca."month" and ai."year" = ca."year" and ai.associate_id = $2 where ca.id = $1;`, [id, associate]);
    return result.rows;
  } catch (err) {
    console.error("Error reading commercial actions: ", err);
    return { error: err.message };
  }
}

const readCommercialAssociates = async (id) => {
  try {
    const result = await pool.query("SELECT a.id, a.name, a.cnpj, SUM(capa.total_price) AS totalvalue, COUNT(DISTINCT capa.product_id) AS numberofproducts FROM commercial_actions ca JOIN commercial_action_product_associate capa ON capa.commercial_action_id = ca.id JOIN associates a ON a.id = capa.associate_id WHERE ca.id = $1 GROUP BY  a.id, a.name, a.cnpj;", [id]);
    return result.rows;
  } catch (err) {
    console.error("Error reading commercial actions: ", err);
    return { error: err.message };
  }
}

const readCommercialProducts = async (action) => {
  try {
    const result = await pool.query("SELECT a.cnpj,  a.name AS associatename,  p.*, SUM(capa.total_price) AS total FROM commercial_actions ca JOIN commercial_action_product_associate capa ON capa.commercial_action_id = ca.id JOIN associates a ON a.id = capa.associate_id JOIN products p ON p.id = capa.product_id WHERE ca.id = $1 GROUP BY a.cnpj, a.name, p.id;", [action]);
    return result.rows;
  } catch (err) {
    console.error("Error reading commercial actions: ", err);
    return { error: err.message };
  }
}

const readCommercialAll = async () => {
  try {
    const result = await pool.query("SELECT * FROM commercial_actions");
    return result.rows;
  } catch (err) {
    console.error("Error reading commercial actions: ", err);
    return { error: err.message };
  }
}

const readAvailableMonhts = async (req) => {
  console.log("Get Available Months");

  const { year, company } = req.params;
  const user = req.user;

  try {

    if (user.type == 2) {
      const result = await pool.query(`select ca.month from commercial_actions ca join commercial_action_product_associate capa ON  capa.commercial_action_id = ca.id join user_associate ua on ua.associate_id = capa.associate_id where ca.year = $1 and ua.user_id = $2` + (company != "0" ? ` and ua.associate_id = $3 ` : ``) + `  group by ca.month order by month desc`, company != "0" ? [year, user.id, company] : [year, user.id]);
      return result.rows;
    } else if (user.type == 0 || user.type == 1) {
      const result = await pool.query("select month from commercial_actions ca where ca.year = $1 group by month order by month desc", [year]);
      return result.rows;
    }

  } catch (err) {
    console.error("Error reading commercial actions: ", err);
    return { error: err.message };
  }
}

const readTopAssociates = async (req) => {
  console.log("Get Read Top Associates");
  const { year } = req.params;
  const user = req.user;

  try {
    if (user.type == 0 || user.type == 1) {
      if (year != null && year != "null" && year != "0" && year != 0) {
        const result = await pool.query(`select a.id, a.name, SUM(capa.total_price) AS total FROM commercial_action_product_associate AS capa join commercial_actions ca on ca.id = capa.commercial_action_id join associates a on a.id = capa.associate_id where capa.year = $1 GROUP BY ca.year, capa.month, a.id ORDER BY total desc;`, [year]);
        return result.rows;
      } else {
        const result = await pool.query("select a.id, a.name, SUM(capa.total_price) AS total FROM commercial_action_product_associate AS capa join associates a on a.id = capa.associate_id GROUP BY a.id ORDER by total desc;");
        return result.rows;

      }
    } else if (user.type == 2) {
      return [];
    }
  } catch (err) {
    console.error("Error reading top associates: ", err);
    return { error: err.message };
  }
}

const readAvailableYear = async (req) => {
  console.log("Get Available Years");
  const { company } = req.params;
  const user = req.user;

  try {
    if (user.type == 0 || user.type == 1) {
      const result = await pool.query("select year from commercial_actions ca group by year order by year desc");
      return result.rows;

    } else if (user.type == 2) {
      const result = await pool.query(`select ca.year from commercial_actions ca join commercial_action_product_associate capa on capa.commercial_action_id = ca.id join user_associate ua on ua.associate_id = capa.associate_id where ua.user_id = $1` + (company != "0" ? ` and ua.associate_id = $2 ` : ``) + ` group by ca.year order by ca.year desc`, company != "0" ? [user.id, company] : [user.id]);
      return result.rows;
    }
  } catch (err) {
    console.error("Error reading commercial actions: ", err);
    return { error: err.message };
  }
}

const readCommercialWithJoin = async (req) => {
  console.log("Get Commercial With Join");

  const { month, year, company } = req.params;
  const user = req.user;

  try {
    if (user.type == 2) {
      console.log("STEP 1");
      if (month != null && month != "null" && year != null && year != "null" && month != "0" && year != "0" && month != 0 && year != 0) {
        console.log("STEP 2");
        const result = await pool.query(`SELECT ca.id,ca.description, ua.associate_id as "associate_id", a.name as "associate_name", ca.month,COUNT(DISTINCT a.id) AS numberOfAssociates,COUNT(DISTINCT p.id) AS numberOfProducts,SUM(capa.total_price) AS totalValue, capa.associate_id, CASE WHEN COUNT(CASE WHEN capa.paid = true THEN 1 END) = 0 THEN 0 WHEN COUNT(CASE WHEN capa.paid = true THEN 1 END) = COUNT(capa.id) THEN 1 ELSE 2 END AS status_payment FROM commercial_actions ca JOIN commercial_action_product_associate capa ON capa.commercial_action_id = ca.id join user_associate ua on ua.associate_id = capa.associate_id JOIN associates a ON a.id = capa.associate_id JOIN products p ON p.id = capa.product_id WHERE ca.month = $1 AND ca.year = $2 and ua.user_id = $3 ` + (company != "0" ? ` and ua.associate_id = $4` : ``) + ` GROUP BY ca.id,capa.associate_id, ca.description,ua.associate_id, ca.month, a.name ORDER BY ca.month DESC`, company != "0" ? [month, year, user.id, company] : [month, year, user.id]);
        return result.rows;

      } else {
        console.log("---------------------------------------------");
        console.log("STEP 3");
        console.log("month", month, "year", year, "company", company);
        console.log("---------------------------------------------");

        const result = await pool.query(`SELECT ca.id,ca.description, ua.associate_id as "associate_id", a.name as "associate_name", ca."month",COUNT(DISTINCT a.id) AS numberOfAssociates, ai.observation, ai.invoice, ai.payment_type as "paymentType", ai."month", COUNT(DISTINCT p.id) AS numberOfProducts,SUM(capa.total_price) AS totalValue,capa.associate_id, CASE WHEN COUNT(CASE WHEN capa.paid = true THEN 1 END) = 0 THEN 0 WHEN COUNT(CASE WHEN capa.paid = true THEN 1 END) = COUNT(capa.id) THEN 1 ELSE 2 END AS status_payment FROM commercial_actions ca JOIN commercial_action_product_associate capa ON capa.commercial_action_id = ca.id join user_associate ua on ua.associate_id = capa.associate_id left join additional_infos ai ON ai.associate_id = ua.associate_id and ai."month" = ca."month" JOIN associates a ON a.id = capa.associate_id JOIN products p ON p.id = capa.product_id where ua.user_id = $1 ` + (company != "0" ? ` and ua.associate_id = $2` : ``) + ` GROUP BY ca.id, ca.description,capa.associate_id, ua.associate_id, ca.month, a.name, ai.id ORDER BY ca.month DESC;`, company != "0" ? [user.id, company] : [user.id]);
        
        return result.rows;
      }

    } else if (user.type == 0 || user.type == 1) {
      console.log("STEP 4");
      if (month != null && month != "null" && year != null && year != "null" && month != "0" && year != "0" && month != 0 && year != 0) {
        console.log("STEP 5");
        const result = await pool.query("SELECT ca.id,ca.description,ca.month,COUNT(DISTINCT a.id) AS numberOfAssociates,COUNT(DISTINCT p.id) AS numberOfProducts,SUM(capa.total_price) AS totalValue FROM commercial_actions ca JOIN commercial_action_product_associate capa ON capa.commercial_action_id = ca.id JOIN associates a ON a.id = capa.associate_id JOIN products p ON p.id = capa.product_id WHERE ca.month = $1 AND ca.year = $2 GROUP BY ca.id, ca.description, ca.month ORDER BY ca.month DESC;", [month, year]);
        return result.rows;

      } else {
        console.log("STEP 6");
        const result = await pool.query("SELECT ca.id,ca.description,ca.month,COUNT(DISTINCT a.id) AS numberOfAssociates,COUNT(DISTINCT p.id) AS numberOfProducts,SUM(capa.total_price) AS totalValue FROM commercial_actions ca JOIN commercial_action_product_associate capa ON capa.commercial_action_id = ca.id JOIN associates a ON a.id = capa.associate_id JOIN products p ON p.id = capa.product_id GROUP BY ca.id, ca.description, ca.month ORDER BY ca.month DESC;");
        return result.rows;
      }

    }
  } catch (err) {
    console.error("Error reading commercial actions: ", err);
    return { error: err.message };
  }
}

module.exports = {
  createCommercial, readCommercial, readCommercialAll, readCommercialWithJoin, readCommercialAssociates
  , readCommercialProducts, readAvailableMonhts, readAvailableYear, readTopAssociates
};
