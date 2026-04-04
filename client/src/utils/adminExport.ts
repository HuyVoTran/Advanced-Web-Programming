import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import * as XLSX from 'xlsx';

type PdfMakeLike = {
  vfs?: Record<string, string>;
  addFonts?: (fonts: Record<string, any>) => void;
  createPdf: (docDefinition: Record<string, any>) => { download: (filename: string) => void };
};

const pdfMakeAny = pdfMake as unknown as PdfMakeLike;
const pdfFontsAny = pdfFonts as any;
if (!pdfMakeAny.vfs) {
  pdfMakeAny.vfs = pdfFontsAny?.pdfMake?.vfs || pdfFontsAny?.vfs || {};
}

let montserratFontReady = false;
let montserratFontLoadingPromise: Promise<boolean> | null = null;

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
  totalOriginalPrice?: number;
  totalDiscount?: number;
  couponCode?: string;
  couponDiscount?: number;
  loyaltyPointsAwarded?: number;
  loyaltyMultiplierApplied?: number;
  loyaltyRankApplied?: string;
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
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    originalPrice?: number;
    salePercent?: number;
    discountAmount?: number;
    finalPrice?: number;
  }>;
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  delivered: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const COMPANY_INFO = {
  brand: 'SALVIO ROYALE',
  legalName: 'CÔNG TY TNHH SALVIO ROYALE',
  taxCode: '0312345678',
  address: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
  phone: '1900 1234',
  email: 'info@salvioroyale.vn',
  website: 'www.salvioroyale.vn',
  logoPath: '/images/SalvioRoyale-Logo.png',
  vatRate: 0.1,
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank_transfer: 'Chuyển khoản ngân hàng',
  credit_card: 'Thẻ tín dụng/ghi nợ',
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

const ensureMontserratPdfFont = async (): Promise<boolean> => {
  if (montserratFontReady) {
    return true;
  }

  if (montserratFontLoadingPromise) {
    return montserratFontLoadingPromise;
  }

  montserratFontLoadingPromise = (async () => {
    try {
      if (!pdfMakeAny.addFonts) {
        return false;
      }

      pdfMakeAny.addFonts?.({
        Montserrat: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf',
        },
      });

      montserratFontReady = true;
      return true;
    } catch {
      return false;
    }
  })();

  const isReady = await montserratFontLoadingPromise;
  if (!isReady) {
    montserratFontLoadingPromise = null;
  }
  return isReady;
};

const loadImageAsDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const exportOrderStatisticsPdf = async (
  orders: Array<{ status: string; totalPrice: number; createdAt: string }>,
  period?: ExportPeriod,
  filename = `thong-ke-don-hang-${new Date().toISOString().slice(0, 10)}.pdf`
) => {
  const hasMontserrat = await ensureMontserratPdfFont();
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
      ...(hasMontserrat ? { font: 'Montserrat' } : {}),
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

export const exportOrdersInvoiceListPdf = async (
  orders: OrderExport[],
  period?: ExportPeriod,
  filename = `danh-sach-hoa-don-${new Date().toISOString().slice(0, 10)}.pdf`
) => {
  const hasMontserrat = await ensureMontserratPdfFont();
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
      ...(hasMontserrat ? { font: 'Montserrat' } : {}),
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

export const exportOrderInvoiceDetailPdf = async (order: OrderDetailExport) => {
  const hasMontserrat = await ensureMontserratPdfFont();
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

  const lineSubtotal = order.items.reduce((sum, item) => {
    const originalUnitPrice = Number(item.originalPrice ?? item.price ?? 0);
    return sum + originalUnitPrice * Number(item.quantity || 0);
  }, 0);
  const totalDiscount =
    Number(order.totalDiscount) ||
    order.items.reduce((sum, item) => {
      const originalUnitPrice = Number(item.originalPrice ?? item.price ?? 0);
      const finalUnitPrice = Number(item.finalPrice ?? item.price ?? 0);
      const fallbackDiscount = Math.max(0, originalUnitPrice - finalUnitPrice);
      const discountUnit = Number(item.discountAmount ?? fallbackDiscount);
      return sum + discountUnit * Number(item.quantity || 0);
    }, 0);
  const shippingFee = 0;
  const grandTotal = Number(order.totalPrice || 0);
  const vatAmount = Math.round(grandTotal * (COMPANY_INFO.vatRate / (1 + COMPANY_INFO.vatRate)));
  const preTaxAmount = Math.max(0, grandTotal - vatAmount);

  const paymentMethodLabel = PAYMENT_METHOD_LABELS[order.paymentMethod || ''] || (order.paymentMethod || '');
  const logoDataUrl = await loadImageAsDataUrl(COMPANY_INFO.logoPath);

  const headerColumns: Array<Record<string, any>> = [];

  if (logoDataUrl) {
    headerColumns.push({ image: logoDataUrl, width: 120, margin: [0, 2, 0, 0] });
  }

  headerColumns.push({
    width: '*',
    stack: [
      { text: COMPANY_INFO.legalName, bold: true, fontSize: 12, alignment: 'right' },
      { text: `MST: ${COMPANY_INFO.taxCode}`, alignment: 'right', margin: [0, 2, 0, 0] },
      { text: `Địa chỉ: ${COMPANY_INFO.address}`, alignment: 'right', margin: [0, 2, 0, 0] },
      { text: `Điện thoại: ${COMPANY_INFO.phone}`, alignment: 'right', margin: [0, 2, 0, 0] },
      { text: `Email: ${COMPANY_INFO.email}`, alignment: 'right', margin: [0, 2, 0, 0] },
    ],
  });

  const docDefinition = {
    pageMargins: [36, 32, 36, 32],
    content: [
      {
        columns: headerColumns,
      },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: 1, lineColor: '#C9A24D' }],
        margin: [0, 12, 0, 12],
      },
      { text: 'HÓA ĐƠN GIÁ TRỊ GIA TĂNG', style: 'header', alignment: 'center' },
      { text: '(VAT INVOICE)', alignment: 'center', italics: true, margin: [0, 2, 0, 10] },
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: `Mẫu số: 01GTKT0/001` },
              { text: `Ký hiệu: SR/26E` },
              { text: `Số hóa đơn: ${order._id}` },
            ],
          },
          {
            width: '*',
            stack: [
              { text: `Ngày lập: ${formatDateOnly(order.createdAt)}`, alignment: 'right' },
              { text: `Giờ lập: ${formatDateTime(order.createdAt).split(' ')[1] || ''}`, alignment: 'right' },
              { text: `Trạng thái: ${STATUS_LABELS[order.status || ''] || order.status || ''}`, alignment: 'right' },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              {
                stack: [
                  { text: 'BÊN MUA (THÔNG TIN KHÁCH HÀNG)', bold: true, margin: [0, 0, 0, 4] },
                  { text: `Họ tên: ${customerName}` },
                  { text: `Điện thoại: ${customerPhone}` },
                  { text: `Email: ${customerEmail}` },
                  { text: `Địa chỉ: ${customerAddress || ''}` },
                ],
              },
              {
                stack: [
                  { text: 'THÔNG TIN THANH TOÁN', bold: true, margin: [0, 0, 0, 4] },
                  { text: `Phương thức: ${paymentMethodLabel}` },
                  { text: `Website: ${COMPANY_INFO.website}` },
                  { text: `Người bán: ${COMPANY_INFO.brand}` },
                  { text: `Email hỗ trợ: ${COMPANY_INFO.email}` },
                ],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: [24, '*', 34, 56, 60, 74, 80],
          body: [
            ['STT', 'Tên hàng hóa, dịch vụ', 'SL', 'Giảm', 'Đơn giá gốc', 'Đơn giá sau khi giảm', 'Thành tiền'],
            ...order.items.map((item, index) => {
              const quantity = Number(item.quantity || 0);
              const originalUnitPrice = Number(item.originalPrice ?? item.price ?? 0);
              const finalUnitPrice = Number(item.finalPrice ?? item.price ?? 0);
              const salePercent = Number(item.salePercent ?? 0);
              const lineTotal = finalUnitPrice * quantity;

              return [
                String(index + 1),
                item.productName,
                String(quantity),
                `${salePercent}%`,
                formatCurrency(originalUnitPrice),
                formatCurrency(finalUnitPrice),
                formatCurrency(lineTotal),
              ];
            }),
          ],
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#F5EFE1' : undefined),
        },
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          widths: ['*', 180],
          body: [
            [
              {
                stack: [
                  { text: 'Ghi chú thuế', bold: true, margin: [0, 0, 0, 4] },
                  { text: `- Mã số thuế đơn vị bán: ${COMPANY_INFO.taxCode}` },
                  { text: `- Thuế suất GTGT áp dụng: ${(COMPANY_INFO.vatRate * 100).toFixed(0)}%` },
                  { text: '- Hóa đơn được tạo tự động từ hệ thống thương mại điện tử.' },
                ],
              },
              {
                table: {
                  widths: ['*', 'auto'],
                  body: [
                    ['Tạm tính hàng hóa', formatCurrency(lineSubtotal)],
                    ['Tổng giảm giá', `-${formatCurrency(totalDiscount)}`],
                    ...(order.couponCode ? [[
                      `Mã giảm giá (${order.couponCode})`,
                      `-${formatCurrency(Number(order.couponDiscount ?? 0))}`
                    ]] : []),
                    ['Giá trị trước thuế', formatCurrency(preTaxAmount)],
                    [`Thuế GTGT (${(COMPANY_INFO.vatRate * 100).toFixed(0)}%)`, formatCurrency(vatAmount)],
                    ['Phí vận chuyển', formatCurrency(shippingFee)],
                    [{ text: 'TỔNG THANH TOÁN', bold: true }, { text: formatCurrency(grandTotal), bold: true }],
                    ...(order.loyaltyPointsAwarded && order.loyaltyPointsAwarded > 0 ? [[
                      { text: '\ud83c\udfc5 Điểm tích lũy từ đơn hàng này', color: '#b45309' },
                      { text: `+${order.loyaltyPointsAwarded} điểm (hạng ${order.loyaltyRankApplied || 'member'} \u00b7 x${order.loyaltyMultiplierApplied ?? 1})`, color: '#b45309' },
                    ]] : []),
                  ],
                },
                layout: 'lightHorizontalLines',
              },
            ],
          ],
        },
        layout: 'noBorders',
      },
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'Người mua hàng', alignment: 'center', margin: [0, 14, 0, 46] },
              { text: '(Ký, ghi rõ họ tên)', alignment: 'center', fontSize: 9, color: '#6B7280' },
            ],
          },
          {
            width: '*',
            stack: [
              { text: 'Người bán hàng', alignment: 'center', margin: [0, 14, 0, 46] },
              { text: COMPANY_INFO.brand, alignment: 'center', fontSize: 10, bold: true },
              { text: '(Ký, đóng dấu, ghi rõ họ tên)', alignment: 'center', fontSize: 9, color: '#6B7280' },
            ],
          },
        ],
      },
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
      },
    },
    defaultStyle: {
      fontSize: 10,
      ...(hasMontserrat ? { font: 'Montserrat' } : {}),
    },
  };

  pdfMakeAny.createPdf(docDefinition).download(`hoa-don-${order._id}.pdf`);
};

export const exportOrderInvoiceDetailExcel = (
  order: OrderDetailExport,
  filename = `hoa-don-${order._id}.xlsx`
) => {
  const computedTotalDiscount =
    Number(order.totalDiscount) ||
    order.items.reduce((sum, item) => {
      const originalUnitPrice = Number(item.originalPrice ?? item.price ?? 0);
      const finalUnitPrice = Number(item.finalPrice ?? item.price ?? 0);
      const fallbackDiscount = Math.max(0, originalUnitPrice - finalUnitPrice);
      return sum + Number(item.discountAmount ?? fallbackDiscount) * Number(item.quantity || 0);
    }, 0);

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
    { 'Thông tin': 'Tổng giảm giá (VNĐ)', 'Giá trị': Number(computedTotalDiscount || 0) },
    ...(order.couponCode ? [
      { 'Thông tin': 'Mã giảm giá', 'Giá trị': order.couponCode },
      { 'Thông tin': 'Tiền giảm qua mã (VNĐ)', 'Giá trị': Number(order.couponDiscount ?? 0) },
    ] : []),
    { 'Thông tin': 'Tổng thanh toán (VNĐ)', 'Giá trị': Number(order.totalPrice || 0) },
    ...(order.loyaltyPointsAwarded && order.loyaltyPointsAwarded > 0 ? [
      { 'Thông tin': 'Điểm tích lũy từ đơn hàng', 'Giá trị': `+${order.loyaltyPointsAwarded} điểm` },
      { 'Thông tin': 'Hạng thành viên áp dụng', 'Giá trị': order.loyaltyRankApplied || 'member' },
      { 'Thông tin': 'Hệ số nhân điểm', 'Giá trị': `x${order.loyaltyMultiplierApplied ?? 1}` },
    ] : []),
  ];

  const detailRows = order.items.map((item, index) => ({
    STT: index + 1,
    'Sản phẩm': item.productName,
    'Số lượng': item.quantity,
    'Giảm giá (%)': Number(item.salePercent ?? 0),
    'Đơn giá gốc (VNĐ)': Number(item.originalPrice ?? item.price ?? 0),
    'Đơn giá sau khi giảm (VNĐ)': Number(item.finalPrice ?? item.price ?? 0),
    'Thành tiền (VNĐ)': Number(item.finalPrice ?? item.price ?? 0) * Number(item.quantity || 0),
    'Tiền giảm (VNĐ)': Number(item.discountAmount ?? Math.max(0, Number(item.originalPrice ?? item.price ?? 0) - Number(item.finalPrice ?? item.price ?? 0))) * Number(item.quantity || 0),
  }));

  const workbook = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  const detailSheet = XLSX.utils.json_to_sheet(detailRows);

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'TongQuan');
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'SanPham');
  XLSX.writeFile(workbook, filename);
};
