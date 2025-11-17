import { Request, Response } from 'express';
import { Supplier } from '../entities/Supplier';

export const addSupplier = async (req: Request, res: Response): Promise<any> => {
  try {
    const { number, name, contactPerson, email, phone, address, country } = req.body;
    const supplier = Supplier.create({
      number,
      name,
      contactPerson,
      email,
      phone,
      address,
      country,
    });
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSupplier = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { number, name, contactPerson, email, phone, address, country } = req.body;
    const supplier = await Supplier.findOneBy({ id: parseInt(id) });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    supplier.number = number || supplier.number;
    supplier.name = name || supplier.name;
    supplier.contactPerson = contactPerson || supplier.contactPerson;
    supplier.email = email || supplier.email;
    supplier.phone = phone || supplier.phone;
    supplier.address = address || supplier.address;
    supplier.country = country || supplier.country;
    await supplier.save();
    res.status(200).json(supplier);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSupplier = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findOneBy({ id: parseInt(id) });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    await supplier.remove();
    res.status(200).json({ message: 'Supplier deleted' });
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllSuppliers = async (req: Request, res: Response): Promise<any> => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSupplierById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findOneBy({ id: parseInt(id) });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json(supplier);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};