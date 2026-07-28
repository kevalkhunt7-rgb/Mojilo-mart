import PDFDocument from 'pdfkit';

/**
 * Generates an invoice PDF as a Buffer.
 * @param {Object} order - Order object containing details, items, addresses, etc.
 * @returns {Promise<Buffer>}
 */
export const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Title
      doc.fontSize(24).fillColor('#333333').text('MOJILO', 50, 50, { align: 'left' });
      doc.fontSize(10).fillColor('#777777').text('Custom T-Shirt Printing E-Commerce', 50, 75);
      
      doc.fontSize(20).fillColor('#333333').text('INVOICE', 400, 50, { align: 'right' });
      doc.fontSize(10).fillColor('#555555')
        .text(`Order Number: ${order.orderNumber || order._id}`, 400, 75, { align: 'right' })
        .text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`, 400, 90, { align: 'right' })
        .text(`Payment: ${order.paymentMethod || 'COD'}`, 400, 105, { align: 'right' });

      doc.moveTo(50, 130).lineTo(550, 130).strokeColor('#e5e5e5').stroke();

      // Addresses
      doc.fontSize(12).fillColor('#333333').text('Billing Info', 50, 150, { bold: true });
      if (order.billingAddress) {
        doc.fontSize(10).fillColor('#555555')
          .text(order.billingAddress.name || '', 50, 170)
          .text(order.billingAddress.street || '', 50, 185)
          .text(`${order.billingAddress.city || ''}, ${order.billingAddress.state || ''} - ${order.billingAddress.zipCode || ''}`, 50, 200)
          .text(`Phone: ${order.billingAddress.phone || ''}`, 50, 215);
      } else {
        doc.fontSize(10).fillColor('#555555').text('N/A', 50, 170);
      }

      doc.fontSize(12).fillColor('#333333').text('Shipping Info', 300, 150, { bold: true });
      if (order.shippingAddress) {
        doc.fontSize(10).fillColor('#555555')
          .text(order.shippingAddress.name || '', 300, 170)
          .text(order.shippingAddress.street || '', 300, 185)
          .text(`${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.zipCode || ''}`, 300, 200)
          .text(`Phone: ${order.shippingAddress.phone || ''}`, 300, 215);
      } else {
        doc.fontSize(10).fillColor('#555555').text('N/A', 300, 170);
      }

      doc.moveTo(50, 245).lineTo(550, 245).strokeColor('#e5e5e5').stroke();

      // Items Table Header
      let y = 265;
      doc.fontSize(10).fillColor('#333333')
        .text('Item Description', 50, y, { bold: true })
        .text('Qty', 350, y, { bold: true })
        .text('Unit Price', 410, y, { bold: true })
        .text('Total', 490, y, { bold: true });

      doc.moveTo(50, y + 15).lineTo(550, y + 15).strokeColor('#e5e5e5').stroke();
      y += 25;

      // Table Row Loop
      const items = order.items || [];
      items.forEach((item) => {
        const prodName = item.productName || (item.product && item.product.name) || 'Customized T-Shirt';
        const variantDesc = item.variantDescription || (item.productVariant && `${item.productVariant.size} / ${item.productVariant.color}`) || '';
        
        doc.fontSize(10).fillColor('#555555').text(prodName, 50, y);
        if (variantDesc) {
          doc.fontSize(8).fillColor('#777777').text(variantDesc, 50, y + 12);
        }
        
        doc.fontSize(10).fillColor('#555555')
          .text(String(item.quantity || 1), 350, y)
          .text(`Rs. ${(item.price || 0).toFixed(2)}`, 410, y)
          .text(`Rs. ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`, 490, y);
        
        y += 30;
      });

      doc.moveTo(50, y).lineTo(550, y).strokeColor('#e5e5e5').stroke();
      y += 15;

      // Totals
      doc.fontSize(10).fillColor('#555555')
        .text('Subtotal:', 380, y)
        .text(`Rs. ${(order.subTotal || 0).toFixed(2)}`, 490, y);
      y += 15;

      if (order.discountAmount) {
        doc.text('Discount:', 380, y)
          .text(`-Rs. ${(order.discountAmount || 0).toFixed(2)}`, 490, y);
        y += 15;
      }

      if (order.taxAmount) {
        doc.text('Tax:', 380, y)
          .text(`Rs. ${(order.taxAmount || 0).toFixed(2)}`, 490, y);
        y += 15;
      }

      doc.text('Shipping:', 380, y)
        .text(`Rs. ${(order.shippingCharges || 0).toFixed(2)}`, 490, y);
      y += 20;

      doc.fontSize(12).fillColor('#333333')
        .text('Grand Total:', 380, y, { bold: true })
        .text(`Rs. ${(order.totalAmount || 0).toFixed(2)}`, 490, y, { bold: true });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
