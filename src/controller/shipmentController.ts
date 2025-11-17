import { Request, Response } from 'express';
import { Shipment } from '../entities/Shipment';
import { Supplier } from '../entities/Supplier';
import { Currency } from '../entities/Currency';

export const addShipment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { containerNumber, billOfLading, supplierId, departureDate, arrivalDate, status, items, currencyId } = req.body;
    
    const supplier = await Supplier.findOneBy({ id: supplierId });
    const currency = await Currency.findOneBy({ id: currencyId });
    
    if (!supplier || !currency) {
      return res.status(404).json({ message: 'Supplier or Currency not found' });
    }

    const shipment = Shipment.create({
      containerNumber,
      billOfLading,
      supplier,
      departureDate,
      arrivalDate,
      status,
      items,
      currency,
    });
    await shipment.save();
    res.status(201).json(shipment);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateShipment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { containerNumber, billOfLading, supplierId, departureDate, arrivalDate, status, items, currencyId } = req.body;
    
    const shipment = await Shipment.findOneBy({ id: parseInt(id) });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    if (supplierId) {
      const supplier = await Supplier.findOneBy({ id: supplierId });
      if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
      shipment.supplier = supplier;
    }

    if (currencyId) {
      const currency = await Currency.findOneBy({ id: currencyId });
      if (!currency) return res.status(404).json({ message: 'Currency not found' });
      shipment.currency = currency;
    }

    shipment.containerNumber = containerNumber || shipment.containerNumber;
    shipment.billOfLading = billOfLading || shipment.billOfLading;
    shipment.departureDate = departureDate || shipment.departureDate;
    shipment.arrivalDate = arrivalDate || shipment.arrivalDate;
    shipment.status = status || shipment.status;
    shipment.items = items || shipment.items;
    
    await shipment.save();
    res.status(200).json(shipment);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteShipment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findOneBy({ id: parseInt(id) });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    await shipment.remove();
    res.status(200).json({ message: 'Shipment deleted' });
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllShipments = async (req: Request, res: Response): Promise<any> => {
  try {
    const shipments = await Shipment.find({ relations: ['supplier', 'currency'] });
    res.status(200).json(shipments);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const getShipmentById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findOne({ 
      where: { id: parseInt(id) },
      relations: ['supplier', 'currency']
    });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.status(200).json(shipment);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};