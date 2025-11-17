import { Request, Response } from 'express';
import { Item } from '../entities/Item';
import { Currency } from '../entities/Currency';
import { Location } from '../entities/Location';
import { Supplier } from '../entities/Supplier';

export const addItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const { number, name, description, quantity, unit, price, category, profitMargin, profitAmount, costPrice, currencyId, locationId, supplierId } = req.body;
    
    const currency = await Currency.findOneBy({ id: currencyId });
    const location = await Location.findOneBy({ id: locationId });
    const supplier = await Supplier.findOneBy({ id: supplierId });
    
    if (!currency || !location || !supplier) {
      return res.status(404).json({ message: 'Currency, Location or Supplier not found' });
    }

    const item = Item.create({
      number,
      name,
      description,
      quantity,
      unit,
      price,
      category,
      profitMargin,
      profitAmount,
      costPrice,
      currency,
      location,
      supplier,
    });
    await item.save();
    res.status(201).json(item);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { number, name, description, quantity, unit, price, category, profitMargin, profitAmount, costPrice, currencyId, locationId, supplierId } = req.body;
    
    const item = await Item.findOneBy({ id: parseInt(id) });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (currencyId) {
      const currency = await Currency.findOneBy({ id: currencyId });
      if (!currency) return res.status(404).json({ message: 'Currency not found' });
      item.currency = currency;
    }

    if (locationId) {
      const location = await Location.findOneBy({ id: locationId });
      if (!location) return res.status(404).json({ message: 'Location not found' });
      item.location = location;
    }

    if (supplierId) {
      const supplier = await Supplier.findOneBy({ id: supplierId });
      if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
      item.supplier = supplier;
    }

    item.number = number || item.number;
    item.name = name || item.name;
    item.description = description || item.description;
    item.quantity = quantity || item.quantity;
    item.unit = unit || item.unit;
    item.price = price || item.price;
    item.category = category || item.category;
    item.profitMargin = profitMargin || item.profitMargin;
    item.profitAmount = profitAmount || item.profitAmount;
    item.costPrice = costPrice || item.costPrice;
    
    await item.save();
    res.status(200).json(item);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const item = await Item.findOneBy({ id: parseInt(id) });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    await item.remove();
    res.status(200).json({ message: 'Item deleted' });
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllItems = async (req: Request, res: Response): Promise<any> => {
  try {
    const items = await Item.find({ relations: ['currency', 'location', 'supplier'] });
    res.status(200).json(items);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const getItemById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const item = await Item.findOne({ 
      where: { id: parseInt(id) },
      relations: ['currency', 'location', 'supplier']
    });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};