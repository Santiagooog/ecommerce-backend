import {db} from "../config/db.js";

export const createAddress = async (data) => {
  const query = `
    INSERT INTO direccion 
      (id_usuario, alias, nombre_destinatario, telefono, direccion_linea1, direccion_linea2, ciudad, departamento, codigo_postal, pais, es_predeterminada, fecha_creacion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW());
  `;

  const values = [
    data.id_usuario,
    data.alias,
    data.nombre_destinatario,
    data.telefono,
    data.direccion_linea1,
    data.direccion_linea2,
    data.ciudad,
    data.departamento,
    data.codigo_postal,
    data.pais,
    data.es_predeterminada || 0
  ];

  const [result] = await db.execute(query, values);
  return result;
};

export const getAddressesByUser = async (id_usuario) => {
  const [rows] = await db.execute(
    `SELECT * FROM direccion WHERE id_usuario = ? ORDER BY es_predeterminada DESC`,
    [id_usuario]
  );
  return rows;
};

export const deleteAddress = async (id_direccion, id_usuario) => {
  const [result] = await db.execute(
    `DELETE FROM direccion WHERE id_direccion = ? AND id_usuario = ?`,
    [id_direccion, id_usuario]
  );
  return result;
};

export const setDefaultAddress = async (id_direccion, id_usuario) => {
  // Primero quitar predeterminada a todas
  await db.execute(
    `UPDATE direccion SET es_predeterminada = 0 WHERE id_usuario = ?`,
    [id_usuario]
  );

  // Luego activar la seleccionada
  const [result] = await db.execute(
    `UPDATE direccion SET es_predeterminada = 1 WHERE id_direccion = ? AND id_usuario = ?`,
    [id_direccion, id_usuario]
  );

  return result;
};
