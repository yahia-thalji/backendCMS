import { Request, Response } from 'express';
import { InternalTransfer } from '../entities/InternalTransfer';
import { Location } from '../entities/Location';

export const addInternalTransfer = async (req: Request, res: Response): Promise<any> => {
  try {
    const { transferNumber, fromLocationId, toLocationId, transferDate, status, items, notes } = req.body;
    
    const fromLocation = await Location.findOneBy({ id: fromLocationId });
    const toLocation = await Location.findOneBy({ id: toLocationId });
    
    if (!fromLocation || !toLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const internalTransfer = InternalTransfer.create({
      transferNumber,
      fromLocation,
      toLocation,
      transferDate,
      status,
      items,
      notes,
    });
    await internalTransfer.save();
    res.status(201).json(internalTransfer);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInternalTransfer = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { transferNumber, fromLocationId, toLocationId, transferDate, status, items, notes } = req.body;
    
    const internalTransfer = await InternalTransfer.findOneBy({ id: parseInt(id) });
    if (!internalTransfer) {
      return res.status(404).json({ message: 'InternalTransfer not found' });
    }

    if (fromLocationId) {
      const fromLocation = await Location.findOneBy({ id: fromLocationId });
      if (!fromLocation) return res.status(404).json({ message: 'From Location not found' });
      internalTransfer.fromLocation = fromLocation;
    }

    if (toLocationId) {
      const toLocation = await Location.findOneBy({ id: toLocationId });
      if (!toLocation) return res.status(404).json({ message: 'To Location not found' });
      internalTransfer.toLocation = toLocation;
    }

    internalTransfer.transferNumber = transferNumber || internalTransfer.transferNumber;
    internalTransfer.transferDate = transferDate || internalTransfer.transferDate;
    internalTransfer.status = status || internalTransfer.status;
    internalTransfer.items = items || internalTransfer.items;
    internalTransfer.notes = notes || internalTransfer.notes;
    
    await internalTransfer.save();
    res.status(200).json(internalTransfer);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInternalTransfer = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const internalTransfer = await InternalTransfer.findOneBy({ id: parseInt(id) });
    if (!internalTransfer) {
      return res.status(404).json({ message: 'InternalTransfer not found' });
    }
    await internalTransfer.remove();
    res.status(200).json({ message: 'InternalTransfer deleted' });
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllInternalTransfers = async (req: Request, res: Response): Promise<any> => {
  try {
    const internalTransfers = await InternalTransfer.find({ relations: ['fromLocation', 'toLocation'] });
    res.status(200).json(internalTransfers);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export const getInternalTransferById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const internalTransfer = await InternalTransfer.findOne({ 
      where: { id: parseInt(id) },
      relations: ['fromLocation', 'toLocation']
    });
    if (!internalTransfer) {
      return res.status(404).json({ message: 'InternalTransfer not found' });
    }
    res.status(200).json(internalTransfer);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};