import { Request, Response } from 'express';
import { Invoice } from '../entities/Invoice';
import { Supplier } from '../entities/Supplier';
import { Currency } from '../entities/Currency';

export const addInvoice = async (req: Request, res: Response): Promise<any> => {
  try {
    const { number, supplierId, issueDate, dueDate, totalAmount, status, notes, items, currencyId } = req.body;
    
    const supplier = await Supplier.findOneBy({ id: supplierId });
    const currency = await Currency.findOneBy({ id: currencyId });
    
    if (!supplier || !currency) {
      return res.status(404).json({ message: 'Supplier or Currency not found' });
    }

    const invoice = Invoice.create({
      number,
      supplier,
      issueDate,
      dueDate,
      totalAmount,
      status,
      notes,
      items,
      currency,
    });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInvoice = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { number, supplierId, issueDate, dueDate, totalAmount, status, notes, items, currencyId } = req.body;
    
    const invoice = await Invoice.findOneBy({ id: parseInt(id) });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (supplierId) {
      const supplier = await Supplier.findOneBy({ id: supplierId });
      if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
      invoice.supplier = supplier;
    }

    if (currencyId) {
      const currency = await Currency.findOneBy({ id: currencyId });
      if (!currency) return res.status(404).json({ message: 'Currency not found' });
      invoice.currency = currency;
    }

    invoice.number = number || invoice.number;
    invoice.issueDate = issueDate || invoice.issueDate;
    invoice.dueDate = dueDate || invoice.dueDate;
    invoice.totalAmount = totalAmount || invoice.totalAmount;
    invoice.status = status || invoice.status;
    invoice.notes = notes || invoice.notes;
    invoice.items = items || invoice.items;
    
    await invoice.save();
    res.status(200).json(invoice);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInvoice = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findOneBy({ id: parseInt(id) });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await invoice.remove();
    res.status(200).json({ message: 'Invoice deleted' });
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllInvoices = async (req: Request, res: Response): Promise<any> => {
  try {
    const invoices = await Invoice.find({ relations: ['supplier', 'currency'] });
    res.status(200).json(invoices);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoiceById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findOne({ 
      where: { id: parseInt(id) },
      relations: ['supplier', 'currency']
    });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json(invoice);
  } catch (error :any) {
    res.status(500).json({ message: error.message });
  }
};