import { createAddress, getAddressesByUser, deleteAddress, setDefaultAddress } from "../models/address.model.js";

export const addAddress = async (req, res) => {
  try {
    const data = req.body;

    if (!data.id_usuario || !data.direccion_linea1 || !data.ciudad || !data.pais) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const result = await createAddress(data);

    res.status(201).json({
      message: "Dirección creada correctamente",
      id_direccion: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la dirección" });
  }
};

export const getUserAddresses = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const addresses = await getAddressesByUser(id_usuario);

    res.json(addresses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener direcciones" });
  }
};

export const removeAddress = async (req, res) => {
  try {
    const { id_direccion, id_usuario } = req.params;

    await deleteAddress(id_direccion, id_usuario);

    res.json({ message: "Dirección eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la dirección" });
  }
};

export const makeDefaultAddress = async (req, res) => {
  try {
    const { id_direccion, id_usuario } = req.params;

    await setDefaultAddress(id_direccion, id_usuario);

    res.json({ message: "Dirección marcada como predeterminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar dirección predeterminada" });
  }
};
