import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import * as XLSX from 'xlsx';

type PdfMakeLike = {
  vfs?: Record<string, string>;
  createPdf: (docDefinition: Record<string, any>) => { download: (filename: string) => void };
};

const pdfMakeAny = pdfMake as unknown as PdfMakeLike;
const pdfFontsAny = pdfFonts as any;
if (!pdfMakeAny.vfs) {
  pdfMakeAny.vfs = pdfFontsAny?.pdfMake?.vfs || pdfFontsAny?.vfs || {};
}

export type ExportPeriodType = 'all' | 'day' | 'month' | 'year';
export type ExportPeriod = {
  type: ExportPeriodType;
  value?: string;
};

type OrderExport = {
  _id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  itemCount?: number;
  items?: unknown[];
  user?: { name?: string; email?: string };
  customerInfo?: { fullName?: string; email?: string; phone?: string };
};

type OrderDetailExport = {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  totalPrice: number;
  paymentMethod?: string;
  customerInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  shippingAddress?: {
    fullAddress?: string;
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  items: Array<{ productName: string; quantity: number; price: number }>;
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  delivered: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const formatCurrency = (value: number) => {
  const amount = Number(value || 0);
  return `${new Intl.NumberFormat('vi-VN').format(amount)} VNĐ`;
};

const formatDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN');
};

const formatDateOnly = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN');
};

const getSafeDate = (value?: string) => {
  const date = new Date(value || '');
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

export const getExportPeriodLabel = (period?: ExportPeriod) => {
  if (!period || period.type === 'all') {
    return 'Toàn thời gian';
  }

  if (!period.value) {
    return 'Toàn thời gian';
  }

  if (period.type === 'day') {
    return `Ngày ${formatDateOnly(period.value)}`;
  }

  if (period.type === 'month') {
    const [year, month] = period.value.split('-');
    return `Tháng ${month}/${year}`;
  }

  return `Năm ${period.value}`;
};

export const filterOrdersByPeriod = <T extends { createdAt?: string }>(orders: T[], period?: ExportPeriod): T[] => {
  if (!period || period.type === 'all') {
    return orders;
  }

  if (!period.value) {
    return [];
  }

  return orders.filter((order) => {
    const date = getSafeDate(order.createdAt);
    if (!date) {
      return false;
    }

    if (period.type === 'day') {
      const target = getSafeDate(period.value);
      if (!target) {
        return false;
      }
      return date.toDateString() === target.toDateString();
    }

    if (period.type === 'month') {
      const [year, month] = period.value.split('-').map(Number);
      if (!year || !month) {
        return false;
      }
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    }

    const targetYear = Number(period.value);
    if (!targetYear) {
      return false;
    }
    return date.getFullYear() === targetYear;
  });
};

const createSheetAndDownload = (rows: Array<Record<string, any>>, sheetName: string, filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

export const exportOrderStatisticsPdf = (
  orders: Array<{ status: string; totalPrice: number; createdAt: string }>,
  period?: ExportPeriod,
  filename = `thong-ke-don-hang-${new Date().toISOString().slice(0, 10)}.pdf`
) => {
  const scopedOrders = filterOrdersByPeriod(orders, period);
  const statusMap: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  };

  let revenue = 0;
  scopedOrders.forEach((order) => {
    const normalizedStatus = order.status === 'delivered' ? 'completed' : order.status;
    statusMap[normalizedStatus] = (statusMap[normalizedStatus] || 0) + 1;
    if (normalizedStatus !== 'cancelled') {
      revenue += Number(order.totalPrice || 0);
    }
  });

  const periodLabel = getExportPeriodLabel(period);

  const docDefinition = {
    content: [
      { text: 'SALVIO ROYALE - BÁO CÁO THỐNG KÊ ĐƠN HÀNG', style: 'header' },
      { text: `Phạm vi: ${periodLabel}`, margin: [0, 6, 0, 0] },
      { text: `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}`, margin: [0, 2, 0, 12] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            ['Chỉ số', 'Giá trị'],
            ['Tổng đơn hàng', String(scopedOrders.length)],
            ['Đơn chờ xác nhận', String(statusMap.pending)],
            ['Đơn đã xác nhận', String(statusMap.confirmed)],
            ['Đơn đang giao', String(statusMap.shipping)],
            ['Đơn hoàn thành', String(statusMap.completed)],
            ['Đơn đã hủy', String(statusMap.cancelled)],
            ['Doanh thu (không tính đơn hủy)', formatCurrency(revenue)],
          ],
        },
        layout: 'lightHorizontalLines',
      },
    ],
    styles: {
      header: {
        fontSize: 15,
        bold: true,
      },
    },
    defaultStyle: {
      fontSize: 10,
    },
  };

  pdfMakeAny.createPdf(docDefinition).download(filename);
};

export const exportOrderStatisticsExcel = (
  orders: Array<{ status: string; totalPrice: number; createdAt: string }>,
  period?: ExportPeriod,
  filename = `thong-ke-don-hang-${new Date().toISOString().slice(0, 10)}.xlsx`
) => {
  const scopedOrders = filterOrdersByPeriod(orders, period);
  const statusMap: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  };

  let revenue = 0;
  scopedOrders.forEach((order) => {
    const normalizedStatus = order.status === 'delivered' ? 'completed' : order.status;
    statusMap[normalizedStatus] = (statusMap[normalizedStatus] || 0) + 1;
    if (normalizedStatus !== 'cancelled') {
      revenue += Number(order.totalPrice || 0);
    }
  });

  const rows = [
    { 'Chỉ số': 'Phạm vi', 'Giá trị': getExportPeriodLabel(period) },
    { 'Chỉ số': 'Thời gian xuất', 'Giá trị': new Date().toLocaleString('vi-VN') },
    { 'Chỉ số': 'Tổng đơn hàng', 'Giá trị': scopedOrders.length },
    { 'Chỉ số': 'Đơn chờ xác nhận', 'Giá trị': statusMap.pending },
    { 'Chỉ số': 'Đơn đã xác nhận', 'Giá trị': statusMap.confirmed },
    { 'Chỉ số': 'Đơn đang giao', 'Giá trị': statusMap.shipping },
    { 'Chỉ số': 'Đơn hoàn thành', 'Giá trị': statusMap.completed },
    { 'Chỉ số': 'Đơn đã hủy', 'Giá trị': statusMap.cancelled },
    { 'Chỉ số': 'Doanh thu (VNĐ)', 'Giá trị': revenue },
  ];

  createSheetAndDownload(rows, 'ThongKeDonHang', filename);
};

export const exportOrdersInvoiceListPdf = (
  orders: OrderExport[],
  period?: ExportPeriod,
  filename = `danh-sach-hoa-don-${new Date().toISOString().slice(0, 10)}.pdf`
) => {
  const scopedOrders = filterOrdersByPeriod(orders, period);

  const docDefinition = {
    pageOrientation: 'landscape',
    content: [
      { text: 'SALVIO ROYALE - DANH SÁCH HÓA ĐƠN', style: 'header' },
      { text: `Phạm vi: ${getExportPeriodLabel(period)}`, margin: [0, 6, 0, 0] },
      { text: `Tổng đơn: ${scopedOrders.length}`, margin: [0, 2, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: [120, 120, '*', 90, 45, 95, 100],
          body: [
            ['Mã đơn', 'Khách hàng', 'Email', 'Trạng thái', 'Số SP', 'Tổng tiền', 'Ngày đặt'],
            ...scopedOrders.map((order) => [
              order._id,
              order.user?.name || order.customerInfo?.fullName || 'Khách lẻ',
              order.user?.email || order.customerInfo?.email || '',
              STATUS_LABELS[order.status] || order.status,
              String(order.itemCount ?? order.items?.length ?? 0),
              formatCurrency(order.totalPrice),
              formatDateTime(order.createdAt),
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
      },
    ],
    styles: {
      header: {
        fontSize: 15,
        bold: true,
      },
    },
    defaultStyle: {
      fontSize: 9,
    },
  };

  pdfMakeAny.createPdf(docDefinition).download(filename);
};

export const exportOrdersInvoiceListExcel = (
  orders: OrderExport[],
  period?: ExportPeriod,
  filename = `danh-sach-hoa-don-${new Date().toISOString().slice(0, 10)}.xlsx`
) => {
  const scopedOrders = filterOrdersByPeriod(orders, period);

  const rows = scopedOrders.map((order) => ({
    'Mã đơn': order._id,
    'Khách hàng': order.user?.name || order.customerInfo?.fullName || 'Khách lẻ',
    Email: order.user?.email || order.customerInfo?.email || '',
    'Trạng thái': STATUS_LABELS[order.status] || order.status,
    'Số sản phẩm': order.itemCount ?? order.items?.length ?? 0,
    'Tổng tiền (VNĐ)': Number(order.totalPrice || 0),
    'Ngày đặt': formatDateTime(order.createdAt),
  }));

  createSheetAndDownload(rows, 'DanhSachHoaDon', filename);
};

export const exportOrderInvoiceDetailPdf = (order: OrderDetailExport) => {
  const customerName = order.customerInfo?.fullName || 'Khách lẻ';
  const customerEmail = order.customerInfo?.email || '';
  const customerPhone = order.customerInfo?.phone || '';
  const customerAddress =
    order.shippingAddress?.fullAddress ||
    [
      order.customerInfo?.address,
      order.customerInfo?.ward,
      order.customerInfo?.district,
      order.customerInfo?.city,
    ]
      .filter(Boolean)
      .join(', ');

  const docDefinition = {
    content: [
      { text: 'SALVIO ROYALE - HÓA ĐƠN CHI TIẾT', style: 'header' },
      { text: `Mã đơn hàng: ${order._id}`, margin: [0, 8, 0, 0] },
      { text: `Ngày đặt: ${formatDateTime(order.createdAt)}` },
      { text: `Trạng thái: ${STATUS_LABELS[order.status || ''] || order.status || ''}`, margin: [0, 0, 0, 10] },
      { text: 'Thông tin khách hàng', bold: true },
      { text: `Họ tên: ${customerName}` },
      { text: `Email: ${customerEmail}` },
      { text: `Điện thoại: ${customerPhone}` },
      { text: `Địa chỉ: ${customerAddress || ''}`, margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: [30, '*', 55, 95, 95],
          body: [
            ['STT', 'Sản phẩm', 'Số lượng', 'Đơn giá', 'Thành tiền'],
            ...order.items.map((item, index) => [
              String(index + 1),
              item.productName,
              String(item.quantity),
              formatCurrency(item.price),
              formatCurrency(item.price * item.quantity),
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
      },
      {
        text: `Tổng thanh toán: ${formatCurrency(order.totalPrice)}`,
        alignment: 'right',
        margin: [0, 12, 0, 0],
        bold: true,
      },
    ],
    styles: {
      header: {
        fontSize: 15,
        bold: true,
      },
    },
    defaultStyle: {
      fontSize: 10,
    },
  };

  pdfMakeAny.createPdf(docDefinition).download(`hoa-don-${order._id}.pdf`);
};

export const exportOrderInvoiceDetailExcel = (
  order: OrderDetailExport,
  filename = `hoa-don-${order._id}.xlsx`
) => {
  const summaryRows = [
    { 'Thông tin': 'Mã đơn hàng', 'Giá trị': order._id },
    { 'Thông tin': 'Ngày đặt', 'Giá trị': formatDateTime(order.createdAt) },
    { 'Thông tin': 'Trạng thái', 'Giá trị': STATUS_LABELS[order.status || ''] || order.status || '' },
    { 'Thông tin': 'Khách hàng', 'Giá trị': order.customerInfo?.fullName || 'Khách lẻ' },
    { 'Thông tin': 'Email', 'Giá trị': order.customerInfo?.email || '' },
    { 'Thông tin': 'Điện thoại', 'Giá trị': order.customerInfo?.phone || '' },
    {
      'Thông tin': 'Địa chỉ',
      'Giá trị':
        order.shippingAddress?.fullAddress ||
        [
          order.customerInfo?.address,
          order.customerInfo?.ward,
          order.customerInfo?.district,
          order.customerInfo?.city,
        ]
          .filter(Boolean)
          .join(', '),
    },
    { 'Thông tin': 'Tổng thanh toán (VNĐ)', 'Giá trị': Number(order.totalPrice || 0) },
  ];

  const detailRows = order.items.map((item, index) => ({
    STT: index + 1,
    'Sản phẩm': item.productName,
    'Số lượng': item.quantity,
    'Đơn giá (VNĐ)': Number(item.price || 0),
    'Thành tiền (VNĐ)': Number(item.price || 0) * Number(item.quantity || 0),
  }));

  const workbook = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  const detailSheet = XLSX.utils.json_to_sheet(detailRows);

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'TongQuan');
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'SanPham');
  XLSX.writeFile(workbook, filename);
};
