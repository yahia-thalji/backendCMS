import { Request, Response } from 'express';
import { Location } from '../entities/Location';

export const addLocation = async (req: Request, res: Response): Promise<any> => {
  try {
    const { number, name, type, address, capacity, currentUsage } = req.body;
    const location = Location.create({
      number,
      name,
      type,
      address,
      capacity,
      currentUsage,
    });
    await location.save();
    res.status(201).json(location);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLocation = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { number, name, type, address, capacity, currentUsage } = req.body;
    const location = await Location.findOneBy({ id: parseInt(id) });
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    location.number = number || location.number;
    location.name = name || location.name;
    location.type = type || location.type;
    location.address = address || location.address;
    location.capacity = capacity || location.capacity;
    location.currentUsage = currentUsage || location.currentUsage;
    await location.save();
    res.status(200).json(location);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLocation = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const location = await Location.findOneBy({ id: parseInt(id) });
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    await location.remove();
    res.status(200).json({ message: 'Location deleted' });
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllLocations = async (req: Request, res: Response): Promise<any> => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLocationById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const location = await Location.findOneBy({ id: parseInt(id) });
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.status(200).json(location);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};