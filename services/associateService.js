const pool = require("../db");

/**
 * Cria uma associado caso ele não exista
 * @param {string} cnpj - CNPJ do associado
 * @param {string} name - Nome do associado
 */
const createAssociate = async (cnpj, name) => {

  const existingAssociate = await pool.query(
    "SELECT * FROM associates WHERE cnpj = $1 AND name = $2",
    [cnpj, name]
  );
  if (existingAssociate.rows.length > 0) {
    return existingAssociate.rows[0];
  } else {
    const result = await pool.query("INSERT INTO associates (cnpj, name) VALUES ($1, $2) RETURNING *",
      [cnpj, name]);
    return result.rows[0];
  }

};

module.exports = { createAssociate };
