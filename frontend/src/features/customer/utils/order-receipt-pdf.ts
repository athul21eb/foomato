import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { OrderDetails } from '../../checkout/types/checkout.types';

/**
 * Loads an image from a URL and converts it to a base64 data URL.
 */
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image from ${url}`));
    img.src = url;
  });
};

/**
 * Formats currency safely for jsPDF standard fonts.
 * (Uses 'Rs.' prefix to avoid missing unicode glyphs in default Helvetica)
 */
const formatPdfCurrency = (amount: number | undefined | null): string => {
  const val = Number(amount || 0);
  return `Rs. ${val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Generates and downloads a branded PDF receipt for delivered or cancelled orders.
 */
export async function generateOrderReceiptPdf(order: OrderDetails): Promise<void> {
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  // Initialize PDF in Portrait A4 (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. Brand Logo & Header
  let currentY = margin + 2;

  try {
    const logoBase64 = await loadImageAsBase64('/foomato.png');
    // Draw logo (width ~34mm, height proportional ~12mm)
    doc.addImage(logoBase64, 'PNG', margin, currentY, 34, 11);
  } catch {
    // Elegant fallback text banner if image fails
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(234, 88, 12); // Foomato brand orange #EA580C
    doc.text('FOOMATO', margin, currentY + 8);
  }

  // Right Header: Receipt & Order Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(24, 24, 27); // Zinc 900
  doc.text('TAX INVOICE / RECEIPT', pageWidth - margin, currentY + 4, {
    align: 'right',
  });

  const displayOrderNum =
    order.orderNumber || `#ORD-${order.id.slice(-6).toUpperCase()}`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(113, 113, 122); // Zinc 500
  doc.text(`Order No: ${displayOrderNum}`, pageWidth - margin, currentY + 9, {
    align: 'right',
  });

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

  doc.text(`Date & Time: ${orderDate}`, pageWidth - margin, currentY + 13.5, {
    align: 'right',
  });

  currentY += 19;

  // 2. Status Banner (Delivered vs Cancelled)
  if (isDelivered) {
    // Emerald delivered box
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('ORDER DELIVERED SUCCESSFULLY', margin + 4, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(4, 120, 87); // emerald-700
    const riderText = order.riderName
      ? `Fulfilled by Courier Partner: ${order.riderName} ${
          order.riderPhone ? `(${order.riderPhone})` : ''
        }`
      : 'Thank you for ordering with Foomato! We hope you enjoyed your meal.';
    doc.text(riderText, margin + 4, currentY + 10.5);

    currentY += 19;
  } else if (isCancelled) {
    // Rose cancelled box
    doc.setFillColor(255, 241, 242); // rose-50
    doc.setDrawColor(254, 205, 211); // rose-200
    doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text('ORDER CANCELLED', margin + 4, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(190, 18, 60); // rose-700
    const reasonText = order.reason
      ? `Reason: ${order.reason}`
      : 'This order was cancelled and could not be fulfilled.';
    doc.text(reasonText, margin + 4, currentY + 10);

    doc.setFontSize(7.5);
    doc.setTextColor(159, 18, 57);
    const refundNote =
      order.paymentStatus === 'paid'
        ? `Payment method: ${order.paymentMethod?.toUpperCase() || 'ONLINE'}. Any charged amount will be credited back as per bank SLA.`
        : 'Payment was not settled or has been voided.';
    doc.text(refundNote, margin + 4, currentY + 14);

    currentY += 21;
  }

  // 3. Info Cards Grid: Restaurant Info & Customer Info
  const cardWidth = (contentWidth - 6) / 2;
  const cardHeight = 27;

  // Left Card: Merchant / Restaurant
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(234, 88, 12); // Brand orange
  doc.text('RESTAURANT DETAILS', margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(24, 24, 27);
  doc.text(order.restaurantName || 'Partner Restaurant', margin + 4, currentY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.text(`Merchant ID: ${order.restaurantId.slice(-8).toUpperCase()}`, margin + 4, currentY + 17);
  doc.text(`Foomato Food Partner`, margin + 4, currentY + 22);

  // Right Card: Customer Drop-off
  const rightCardX = margin + cardWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightCardX, currentY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(234, 88, 12);
  doc.text('DELIVERY DESTINATION', rightCardX + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(24, 24, 27);

  const address =
    order.deliveryAddress?.formattedAddress ||
    order.deliveryAddress?.fromattedAddress ||
    'Customer Address On File';
  const splitAddress = doc.splitTextToSize(address, cardWidth - 8);
  doc.text(splitAddress.slice(0, 2), rightCardX + 4, currentY + 11);

  if (order.deliveryAddress?.mobile) {
    doc.setTextColor(113, 113, 122);
    doc.text(`Contact: +91 ${order.deliveryAddress.mobile}`, rightCardX + 4, currentY + 22);
  }

  currentY += cardHeight + 6;

  // 4. Itemized Dishes Table via autoTable
  const tableData = (order.items || []).map((item, index) => {
    const qty = item.quauntity || item.quantity || 1;
    const price = item.price || 0;
    const total = qty * price;
    return [
      String(index + 1),
      item.name || 'Food Item',
      String(qty),
      formatPdfCurrency(price),
      formatPdfCurrency(total),
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Item Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [234, 88, 12], // #EA580C
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.8,
      textColor: [39, 39, 42],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 32, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  });

  // Calculate position after table
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : currentY + 50;

  // 5. Payment Summary Breakdown (Right Aligned)
  const summaryBoxWidth = 84;
  const summaryX = pageWidth - margin - summaryBoxWidth;
  const summaryY = finalY;

  // Background box for summary
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(228, 228, 231);
  doc.roundedRect(summaryX, summaryY, summaryBoxWidth, 38, 2, 2, 'FD');

  const labelX = summaryX + 4;
  const valueX = summaryX + summaryBoxWidth - 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);

  // Subtotal
  doc.text('Item Subtotal', labelX, summaryY + 7);
  doc.setTextColor(24, 24, 27);
  doc.text(formatPdfCurrency(order.subtotal), valueX, summaryY + 7, {
    align: 'right',
  });

  // Delivery Fee
  doc.setTextColor(113, 113, 122);
  doc.text('Delivery Fee', labelX, summaryY + 13);
  doc.setTextColor(24, 24, 27);
  const deliveryFeeText =
    order.deliveryFee === 0 ? 'FREE' : formatPdfCurrency(order.deliveryFee);
  doc.text(deliveryFeeText, valueX, summaryY + 13, { align: 'right' });

  // Platform Fee
  doc.setTextColor(113, 113, 122);
  doc.text('Platform Fee', labelX, summaryY + 19);
  doc.setTextColor(24, 24, 27);
  doc.text(formatPdfCurrency(order.platformFee), valueX, summaryY + 19, {
    align: 'right',
  });

  // Divider
  doc.setDrawColor(228, 228, 231);
  doc.line(summaryX + 3, summaryY + 23, summaryX + summaryBoxWidth - 3, summaryY + 23);

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(24, 24, 27);
  doc.text('Total Amount', labelX, summaryY + 30);
  doc.setTextColor(234, 88, 12); // Brand orange
  doc.text(formatPdfCurrency(order.totalAmount), valueX, summaryY + 30, {
    align: 'right',
  });

  // Payment method stamp on the left of summary
  const paymentBoxX = margin;
  const paymentBoxWidth = contentWidth - summaryBoxWidth - 6;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(paymentBoxX, summaryY, paymentBoxWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(24, 24, 27);
  doc.text('PAYMENT INFORMATION', paymentBoxX + 4, summaryY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.text('Payment Mode:', paymentBoxX + 4, summaryY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text((order.paymentMethod || 'Online').toUpperCase(), paymentBoxX + 28, summaryY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(113, 113, 122);
  doc.text('Payment Status:', paymentBoxX + 4, summaryY + 21);
  doc.setFont('helvetica', 'bold');
  if (order.paymentStatus === 'paid') {
    doc.setTextColor(5, 150, 105);
    doc.text('PAID & SETTLED', paymentBoxX + 28, summaryY + 21);
  } else {
    doc.setTextColor(225, 29, 72);
    doc.text((order.paymentStatus || 'PENDING').toUpperCase(), paymentBoxX + 28, summaryY + 21);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(161, 161, 170);
  doc.text('For queries regarding this order, contact support@foomato.com', paymentBoxX + 4, summaryY + 31);

  // 6. Clean Bottom Footer
  const footerY = pageHeight - margin - 4;
  doc.setDrawColor(228, 228, 231);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(161, 161, 170);
  doc.text(
    'Foomato Technologies Inc. • Automated Computer Generated Invoice • No Physical Signature Required',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // 7. Save and Trigger Download + Preview
  const cleanId = order.orderNumber ? order.orderNumber.replace(/[^a-zA-Z0-9_-]/g, '') : order.id.slice(-6);
  const fileName = `foomato-receipt-${cleanId}.pdf`;

  // Output blob URL for immediate new tab preview, then trigger file download
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
  doc.save(fileName);
}
