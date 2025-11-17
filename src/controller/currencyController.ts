import { Request, Response } from 'express';
import { Currency } from '../entities/Currency';

export const addCurrency = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, code, symbol, exchangeRate, isBase } = req.body;
    const currency = Currency.create({
      name,
      code,
      symbol,
      exchangeRate,
      isBase,
    });
    

    await currency.save();
    res.status(201).json(currency);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCurrency = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, code, symbol, exchangeRate, isBase } = req.body;
    const currency = await Currency.findOneBy({ id: parseInt(id) });
    if (!currency) {
      return res.status(404).json({ message: 'Currency not found' });
    }
    currency.name = name || currency.name;
    currency.code = code || currency.code;
    currency.symbol = symbol || currency.symbol;
    currency.exchangeRate = exchangeRate || currency.exchangeRate;
    currency.isBase = isBase !== undefined ? isBase : currency.isBase;

    await currency.save();
    res.status(200).json(currency);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCurrency = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const currency = await Currency.findOneBy({ id: parseInt(id) });
    if (!currency) {
      return res.status(404).json({ message: 'Currency not found' });
    }
    await currency.remove();
    res.status(200).json({ message: 'Currency deleted' });
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCurrencies = async (req: Request, res: Response): Promise<any> => {
  try {
    const currencies = await Currency.find();
    res.status(200).json(currencies);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCurrencyById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const currency = await Currency.findOneBy({ id: parseInt(id) });
    if (!currency) {
      return res.status(404).json({ message: 'Currency not found' });
    }
    res.status(200).json(currency);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};