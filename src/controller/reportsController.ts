import { Request, Response } from 'express';
import { Item } from '../entities/Item';
import { Supplier } from '../entities/Supplier';
import { Invoice } from '../entities/Invoice';
import { Shipment } from '../entities/Shipment';
import { Between } from 'typeorm';

export const getInventoryReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const { period = 'month' } = req.query;
    
    const items = await Item.find({
      relations: ['supplier', 'location', 'currency']
    });

    const totalItemsValue = items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    const lowStockItems = items.filter(item => item.quantity < 20);

    const categories = items.reduce((acc, item) => {
      const category = item.category || 'غير محدد';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      totalItems: items.length,
      totalValue: totalItemsValue,
      lowStockItems: lowStockItems.length,
      categories,
      lowStockItemsList: lowStockItems.map(item => ({
        id: item.id,
        name: item.name,
        number: item.number,
        quantity: item.quantity,
        unit: item.unit,
        supplierName: item.supplier?.name || 'غير محدد',
        locationName: item.location?.name || 'غير محدد'
      }))
    });
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    res.status(500).json({ message: 'فشل في تحميل تقرير المخزون' });
  }
};

export const getSuppliersReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const suppliers = await Supplier.find({
      relations: ['items']
    });

    const items = await Item.find({
      relations: ['supplier', 'currency']
    });

    const topSuppliers = suppliers.map(supplier => {
      const supplierItems = items.filter(item => item.supplier?.id === supplier.id);
      const totalValue = supplierItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );

      return {
        id: supplier.id,
        name: supplier.name,
        itemsCount: supplierItems.length,
        totalValue,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone
      };
    }).sort((a, b) => b.totalValue - a.totalValue);

    res.status(200).json({
      totalSuppliers: suppliers.length,
      activeSuppliers: suppliers.length, // يمكن إضافة منطق للموردين النشطين
      topSuppliers: topSuppliers.slice(0, 10) // أفضل 10 موردين
    });
  } catch (error) {
    console.error('Error fetching suppliers report:', error);
    res.status(500).json({ message: 'فشل في تحميل تقرير الموردين' });
  }
};

export const getCostsReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const { period = 'month' } = req.query;
    
    // حساب الفترة الزمنية
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const invoices = await Invoice.find({
      where: {
        issueDate: Between(startDate, now)
      },
      relations: ['supplier', 'currency']
    });

    const shipments = await Shipment.find({
      where: {
        departureDate: Between(startDate, now)
      },
      relations: ['currency']
    });

   
    const totalPurchases = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalShipping = shipments.reduce((sum, shipment) => sum + (((shipment as any).shippingCost) || 0), 0);
    const totalCustoms = shipments.reduce((sum, shipment) => sum + (((shipment as any).customsFees) || 0), 0);


    // تحليل الاتجاه الشهري
    const monthlyTrend = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const monthInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.issueDate);
        return invoiceDate >= monthStart && invoiceDate <= monthEnd;
      });
      
      const monthAmount = monthInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      
      const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                         'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      
      monthlyTrend.push({
        month: monthNames[currentDate.getMonth()],
        amount: monthAmount,
        year: currentDate.getFullYear()
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.status(200).json({
      totalPurchases,
      totalShipping,
      totalCustoms,
      totalCosts: totalPurchases + totalShipping + totalCustoms,
      monthlyTrend,
      period: {
        start: startDate.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error fetching costs report:', error);
    res.status(500).json({ message: 'فشل في تحميل تحليل التكاليف' });
  }
};

export const getShippingReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const shipments = await Shipment.find({
      relations: ['supplier', 'currency']
    });

    const statusBreakdown = shipments.reduce((acc, shipment) => {
      const status = shipment.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalShippingCost = shipments.reduce((sum, shipment) =>
        sum + (((shipment as any).shippingCost) || 0), 0
    );

    const averageShippingCost = shipments.length > 0 ? 
      totalShippingCost / shipments.length : 0;

    res.status(200).json({
      totalShipments: shipments.length,
      inTransitShipments: shipments.filter(s => s.status === 'in_transit').length,
      deliveredShipments: shipments.filter(s => s.status === 'delivered').length,
      customsShipments: shipments.filter(s => s.status === 'customs').length,
      arrivedShipments: shipments.filter(s => s.status === 'arrived').length,
      averageShippingCost,
      totalShippingCost,
      statusBreakdown,
      recentShipments: shipments
        .sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime())
        .slice(0, 10)
        .map(shipment => ({
          id: shipment.id,
          containerNumber: shipment.containerNumber,
          billOfLading: shipment.billOfLading,
          status: shipment.status,
          departureDate: shipment.departureDate,
          arrivalDate: shipment.arrivalDate,
          supplierName: shipment.supplier?.name || 'غير محدد',
          shippingCost: ((shipment as any).shippingCost) || 0,
        }))
    });
  } catch (error) {
    console.error('Error fetching shipping report:', error);
    res.status(500).json({ message: 'فشل في تحميل تقرير الشحن' });
  }
};

export const exportReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const { reportType, format = 'json' } = req.body;

    let reportData;
    
    switch (reportType) {
      case 'inventory':
        // إعادة استخدام منطق تقرير المخزون
        const inventoryReport = await getInventoryReportData();
        reportData = inventoryReport;
        break;
      case 'suppliers':
        const suppliersReport = await getSuppliersReportData();
        reportData = suppliersReport;
        break;
      case 'costs':
        const costsReport = await getCostsReportData();
        reportData = costsReport;
        break;
      case 'shipping':
        const shippingReport = await getShippingReportData();
        reportData = shippingReport;
        break;
      default:
        return res.status(400).json({ message: 'نوع التقرير غير صحيح' });
    }

    const exportData = {
      reportType,
      generatedAt: new Date().toISOString(),
      data: reportData
    };

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 
        `attachment; filename="تقرير_${reportType}_${new Date().toISOString().split('T')[0]}.json"`);
      res.status(200).json(exportData);
    } else {
      // يمكن إضافة دعم لصيغ أخرى مثل CSV, PDF, etc.
      res.status(400).json({ message: 'الصيغة غير مدعومة حالياً' });
    }

  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ message: 'فشل في تصدير التقرير' });
  }
};

// دوال مساعدة لإعادة استخدام المنطق
const getInventoryReportData = async () => {
  const items = await Item.find({ relations: ['supplier', 'location'] });
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const lowStockItems = items.filter(item => item.quantity < 20);
  
  return {
    totalItems: items.length,
    totalValue,
    lowStockItems: lowStockItems.length,
    lowStockItemsList: lowStockItems
  };
};

const getSuppliersReportData = async () => {
  const suppliers = await Supplier.find({ relations: ['items'] });
  const items = await Item.find({ relations: ['supplier'] });
  
  return suppliers.map(supplier => {
    const supplierItems = items.filter(item => item.supplier?.id === supplier.id);
    const totalValue = supplierItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      name: supplier.name,
      itemsCount: supplierItems.length,
      totalValue
    };
  }).sort((a, b) => b.totalValue - a.totalValue);
};

const getCostsReportData = async () => {
  const invoices = await Invoice.find();
  const totalPurchases = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  
  return { totalPurchases };
};

const getShippingReportData = async () => {
  const shipments = await Shipment.find({ relations: ['supplier'] });
  
  return {
    totalShipments: shipments.length,
    statusBreakdown: shipments.reduce((acc, shipment) => {
      acc[shipment.status] = (acc[shipment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
};