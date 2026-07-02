import AddressModel from "../models/AddressModel.js";

// Add address — POST /api/address/add
export const addAddress = async (req, res) => {
  try {
    const id = await AddressModel.create(req.userId, req.body);
    return res.json({ success: true, message: "Address added", id });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get user's addresses — GET /api/address/list
export const getAddresses = async (req, res) => {
  try {
    const addresses = await AddressModel.findByUser(req.userId);
    return res.json({ success: true, addresses });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Delete address — DELETE /api/address/:id
export const deleteAddress = async (req, res) => {
  try {
    await AddressModel.delete(req.params.id, req.userId);
    return res.json({ success: true, message: "Address removed" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
