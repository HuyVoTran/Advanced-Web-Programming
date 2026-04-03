import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0);

const formatDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN');
};

export const exportOrderStatisticsPdf = (
  orders: Array<{ status: string; totalPrice: number; createdAt: string }>,
  filename = `thong-ke-don-hang-${new Date().toISOString().slice(0, 10)}.pdf`
) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const statusMap: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  };

  let revenue = 0;
  orders.forEach((order) => {
    statusMap[order.status] = (statusMap[order.status] || 0) + 1;
    if (order.status !== 'cancelled') {
      revenue += Number(order.totalPrice || 0);
    }
  });

  doc.setFontSize(16);
  doc.text('SALVIO ROYALE - BAO CAO THONG KE DON HANG', 40, 50);
  doc.setFontSize(11);
  doc.text(`Thoi gian xuat: ${new Date().toLocaleString('vi-VN')}`, 40, 72);

  autoTable(doc, {
    startY: 90,
    head: [['Chi so', 'Gia tri']],
    body: [
      ['Tong don hang', String(orders.length)],
      ['Don cho xac nhan', String(statusMap.pending)],
      ['Don da xac nhan', String(statusMap.confirmed)],
      ['Don dang giao', String(statusMap.shipping)],
      ['Don hoan thanh', String(statusMap.completed)],
      ['Don da huy', String(statusMap.cancelled)],
      ['Doanh thu (khong tinh don huy)', formatCurrency(revenue)],
      ['Thoi gian xuat', new Date().toLocaleString('vi-VN')],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [201, 162, 77] },
    theme: 'grid',
  });

  doc.save(filename);
};

export const exportOrdersInvoiceListPdf = (
  orders: Array<{
    _id: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    itemCount?: number;
    items?: unknown[];
    user?: { name?: string; email?: string };
    customerInfo?: { fullName?: string; email?: string; phone?: string };
  }>,
  filename = `danh-sach-hoa-don-${new Date().toISOString().slice(0, 10)}.pdf`
) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  doc.setFontSize(16);
  doc.text('SALVIO ROYALE - DANH SACH HOA DON', 40, 50);
  doc.setFontSize(11);
  doc.text(`Tong don: ${orders.length}`, 40, 72);

  autoTable(doc, {
    startY: 90,
    head: [['Ma don', 'Khach hang', 'Email', 'Trang thai', 'So SP', 'Tong tien', 'Ngay dat']],
    body: orders.map((order) => [
      order._id,
      order.user?.name || order.customerInfo?.fullName || 'Guest',
      order.user?.email || order.customerInfo?.email || '',
      order.status,
      String(order.itemCount ?? order.items?.length ?? 0),
      formatCurrency(order.totalPrice),
      formatDateTime(order.createdAt),
    ]),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [201, 162, 77] },
    theme: 'grid',
    margin: { left: 20, right: 20 },
  });

  doc.save(filename);
};

export const exportOrderInvoiceDetailPdf = (order: {
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
}) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const customerName = order.customerInfo?.fullName || 'Khach le';
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

  doc.setFontSize(18);
  doc.text('SALVIO ROYALE - HOA DON CHI TIET', 40, 48);
  doc.setFontSize(11);
  doc.text(`Ma don hang: ${order._id}`, 40, 70);
  doc.text(`Ngay dat: ${formatDateTime(order.createdAt)}`, 40, 88);
  doc.text(`Trang thai: ${order.status || ''}`, 40, 106);

  doc.text('Thong tin khach hang:', 40, 136);
  doc.text(`Ho ten: ${customerName}`, 40, 154);
  doc.text(`Email: ${customerEmail}`, 40, 172);
  doc.text(`Dien thoai: ${customerPhone}`, 40, 190);
  doc.text(`Dia chi: ${customerAddress || ''}`, 40, 208);

  autoTable(doc, {
    startY: 232,
    head: [['STT', 'San pham', 'So luong', 'Don gia', 'Thanh tien']],
    body: order.items.map((item, index) => [
      String(index + 1),
      item.productName,
      String(item.quantity),
      formatCurrency(item.price),
      formatCurrency(item.price * item.quantity),
    ]),
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [201, 162, 77] },
    theme: 'grid',
    margin: { left: 20, right: 20 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 260;
  doc.setFontSize(12);
  doc.text(`Tong thanh toan: ${formatCurrency(order.totalPrice)}`, 40, finalY + 28);

  doc.save(`hoa-don-${order._id}.pdf`);
};
