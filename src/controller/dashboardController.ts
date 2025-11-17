import { Request, Response } from 'express';
import { Item } from '../entities/Item';
import { Supplier } from '../entities/Supplier';
import { Invoice } from '../entities/Invoice';
import { Shipment } from '../entities/Shipment';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalItems,
      totalSuppliers,
      totalInvoices,
      activeShipments,
      totalInvoiceAmount
    ] = await Promise.all([
      Item.count(),
      Supplier.count(),
      Invoice.count(),
      Shipment.count({ where: { status: 'in_transit' } }),
      Invoice.createQueryBuilder('invoice')
        .select('SUM(invoice.totalAmount)', 'total')
        .getRawOne()
    ]);

    res.status(200).json({
      totalItems,
      totalSuppliers,
      totalInvoices,
      activeShipments,
      totalInvoiceAmount: parseFloat(totalInvoiceAmount.total) || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'فشل في تحميل إحصائيات لوحة التحكم' });
  }
};

export const getLowStockItems = async (req: Request, res: Response) => {
  try {
    const lowStockItems = await Item.find({
      where: { quantity: 20 },
      relations: ['location'],
      order: { quantity: 'ASC' },
      take: 10
    });

    res.status(200).json(lowStockItems);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ message: 'فشل في تحميل الأصناف منخفضة المخزون' });
  }
};

export const getRecentInvoices = async (req: Request, res: Response) => {
  try {
    const recentInvoices = await Invoice.find({
      relations: ['supplier', 'currency'],
      order: { createdAt: 'DESC' },
      take: 5
    });

    res.status(200).json(recentInvoices);
  } catch (error) {
    console.error('Error fetching recent invoices:', error);
    res.status(500).json({ message: 'فشل في تحميل أحدث الفواتير' });
  }
};

export const getActiveShipments = async (req: Request, res: Response) => {
  try {
    const activeShipments = await Shipment.find({
      where: { status: 'in_transit' },
      relations: ['supplier', 'currency'],
      order: { departureDate: 'DESC' },
      take: 5
    });

    res.status(200).json(activeShipments);
  } catch (error) {
    console.error('Error fetching active shipments:', error);
    res.status(500).json({ message: 'فشل في تحميل الشحنات النشطة' });
  }
};