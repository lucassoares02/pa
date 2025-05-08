const pool = require("../db");

/**
 * Cria uma ação comercial
 * @param {string} sku - Sku do produto
 * @param {string} description - Descrição da ação
 */
const createProduct = async (sku, description) => {

  const existingProducts = await pool.query(
    "SELECT * FROM products WHERE sku = $1 AND name = $2",
    [sku, description]
  );
  if (existingProducts.rows.length > 0) {
    return existingProducts.rows[0];
  } else {
    const result = await pool.query("INSERT INTO products (sku, name) VALUES ($1, $2) RETURNING *",
      [sku, description]);
    return result.rows[0];
  }
};


/**
 * Cria múltiplos produtos
 * @param {Array<{sku: string, description: string}>} products
 */
const createMultiplesProducts = async (products) => {
  // console.log("Create Multiples Products");
  if (!products.length) return [];

  // Extrair skus e descriptions
  const values = products.map(p => [p.id, p.product]);

  // Montar placeholders: ($1, $2), ($3, $4), ...
  const placeholders = values
    .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
    .join(", ");

  const flatValues = values.flat();

  const query = `
    WITH new_products (sku, name) AS (
      VALUES ${placeholders}
    ),
    ins AS (
      INSERT INTO products (sku, name)
      SELECT sku, name FROM new_products
      WHERE NOT EXISTS (
        SELECT 1 FROM products p WHERE p.sku = new_products.sku AND p.name = new_products.name
      )
      RETURNING *
    )
    SELECT * FROM ins
    UNION
    SELECT p.* FROM products p
    JOIN new_products np ON p.sku = np.sku AND p.name = np.name;
  `;



  const result = await pool.query(query, flatValues);
  return result.rows;
};


module.exports = { createProduct, createMultiplesProducts };
