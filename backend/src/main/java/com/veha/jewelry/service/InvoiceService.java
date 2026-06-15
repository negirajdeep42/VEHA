package com.veha.jewelry.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.veha.jewelry.entity.Order;
import com.veha.jewelry.entity.OrderItem;
import org.springframework.stereotype.Service;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    public ByteArrayInputStream generateInvoicePdf(Order order) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font styles
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Font.BOLD, new java.awt.Color(217, 184, 92)); // Gold color
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.BOLD);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, java.awt.Color.WHITE);

            // Header Section
            Paragraph brand = new Paragraph("VEHA JEWELRY", titleFont);
            brand.setAlignment(Element.ALIGN_CENTER);
            document.add(brand);

            Paragraph subtitle = new Paragraph("Atelier Invoice", FontFactory.getFont(FontFactory.HELVETICA, 10, Font.ITALIC));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            // Invoice details metadata table
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(20);

            PdfPCell cell1 = new PdfPCell(new Paragraph("Order Details", sectionFont));
            cell1.setBorder(Rectangle.NO_BORDER);
            metaTable.addCell(cell1);

            PdfPCell cell2 = new PdfPCell(new Paragraph("Customer Information", sectionFont));
            cell2.setBorder(Rectangle.NO_BORDER);
            metaTable.addCell(cell2);

            String orderDate = order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"));
            PdfPCell cellOrderInfo = new PdfPCell(new Paragraph(
                    "Order Number: " + order.getOrderNumber() + "\n" +
                    "Date: " + orderDate + "\n" +
                    "Status: " + order.getStatus(),
                    bodyFont
            ));
            cellOrderInfo.setBorder(Rectangle.NO_BORDER);
            metaTable.addCell(cellOrderInfo);

            PdfPCell cellCustomerInfo = new PdfPCell(new Paragraph(
                    "Name: " + order.getUser().getName() + "\n" +
                    "Email: " + order.getUser().getEmail() + "\n" +
                    "Phone: " + (order.getUser().getPhone() != null ? order.getUser().getPhone() : "N/A"),
                    bodyFont
            ));
            cellCustomerInfo.setBorder(Rectangle.NO_BORDER);
            metaTable.addCell(cellCustomerInfo);

            document.add(metaTable);

            // Address Details
            PdfPTable addrTable = new PdfPTable(2);
            addrTable.setWidthPercentage(100);
            addrTable.setSpacingAfter(20);

            PdfPCell shippingCell = new PdfPCell(new Paragraph(
                    "Shipping Address:\n" +
                    order.getShippingAddressLine() + "\n" +
                    (order.getShippingLandmark() != null ? order.getShippingLandmark() + "\n" : "") +
                    order.getShippingCity() + ", " + order.getShippingState() + " - " + order.getShippingPincode() + "\n" +
                    order.getShippingCountry(),
                    bodyFont
            ));
            shippingCell.setBorder(Rectangle.NO_BORDER);
            addrTable.addCell(shippingCell);

            PdfPCell billingCell = new PdfPCell(new Paragraph(
                    "Billing Address:\n" +
                    order.getBillingAddressLine() + "\n" +
                    (order.getBillingLandmark() != null ? order.getBillingLandmark() + "\n" : "") +
                    order.getBillingCity() + ", " + order.getBillingState() + " - " + order.getBillingPincode() + "\n" +
                    order.getBillingCountry(),
                    bodyFont
            ));
            billingCell.setBorder(Rectangle.NO_BORDER);
            addrTable.addCell(billingCell);

            document.add(addrTable);

            // Product Items Table
            PdfPTable itemsTable = new PdfPTable(4);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{3.0f, 1.5f, 1.0f, 1.5f});
            itemsTable.setSpacingAfter(20);

            // Table headers
            String[] headers = {"Item & Variant", "Price Each", "Qty", "Total"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(h, headerFont));
                cell.setBackgroundColor(new java.awt.Color(23, 21, 17)); // Noir style background
                cell.setPadding(8);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                itemsTable.addCell(cell);
            }

            // Table content rows
            for (OrderItem item : order.getItems()) {
                PdfPCell nameCell = new PdfPCell(new Paragraph(item.getProductName() + "\n(" + (item.getVariantInfo() != null ? item.getVariantInfo() : "Standard") + ")", bodyFont));
                nameCell.setPadding(8);
                itemsTable.addCell(nameCell);

                PdfPCell priceCell = new PdfPCell(new Paragraph("Rs. " + item.getPriceEach().setScale(2, BigDecimal.ROUND_HALF_UP).toString(), bodyFont));
                priceCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                priceCell.setPadding(8);
                itemsTable.addCell(priceCell);

                PdfPCell qtyCell = new PdfPCell(new Paragraph(String.valueOf(item.getQuantity()), bodyFont));
                qtyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                qtyCell.setPadding(8);
                itemsTable.addCell(qtyCell);

                BigDecimal itemTotal = item.getPriceEach().multiply(BigDecimal.valueOf(item.getQuantity()));
                PdfPCell totalCell = new PdfPCell(new Paragraph("Rs. " + itemTotal.setScale(2, BigDecimal.ROUND_HALF_UP).toString(), bodyFont));
                totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                totalCell.setPadding(8);
                itemsTable.addCell(totalCell);
            }

            document.add(itemsTable);

            // Totals and Summary Section
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(50);
            summaryTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summaryTable.setWidths(new float[]{2.0f, 2.0f});

            addSummaryRow(summaryTable, "Subtotal:", "Rs. " + order.getSubtotal().setScale(2, BigDecimal.ROUND_HALF_UP).toString(), bodyFont);
            if (order.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
                addSummaryRow(summaryTable, "Discount:", "- Rs. " + order.getDiscount().setScale(2, BigDecimal.ROUND_HALF_UP).toString(), bodyFont);
            }
            addSummaryRow(summaryTable, "Shipping:", order.getShippingCharge().compareTo(BigDecimal.ZERO) == 0 ? "Free" : "Rs. " + order.getShippingCharge().setScale(2, BigDecimal.ROUND_HALF_UP).toString(), bodyFont);
            addSummaryRow(summaryTable, "GST (3%):", "Rs. " + order.getTax().setScale(2, BigDecimal.ROUND_HALF_UP).toString(), bodyFont);
            addSummaryRow(summaryTable, "Grand Total:", "Rs. " + order.getTotal().setScale(2, BigDecimal.ROUND_HALF_UP).toString(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Font.BOLD));

            document.add(summaryTable);

            // Footer note
            Paragraph footer = new Paragraph("\n\nThank you for shopping with VEHA Jewelry.\nFor any support, contact us at care@veha.com", FontFactory.getFont(FontFactory.HELVETICA, 9, Font.ITALIC));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();

        } catch (DocumentException e) {
            System.err.println("Document Exception during PDF invoice generation: " + e.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addSummaryRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell cellLbl = new PdfPCell(new Paragraph(label, font));
        cellLbl.setBorder(Rectangle.NO_BORDER);
        cellLbl.setPadding(4);
        table.addCell(cellLbl);

        PdfPCell cellVal = new PdfPCell(new Paragraph(value, font));
        cellVal.setBorder(Rectangle.NO_BORDER);
        cellVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellVal.setPadding(4);
        table.addCell(cellVal);
    }
}
