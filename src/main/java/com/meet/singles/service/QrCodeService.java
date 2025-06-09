package com.meet.singles.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class QrCodeService {

    private final Logger log = LoggerFactory.getLogger(QrCodeService.class);

    public String generateQrCode(String data) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            
            BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, 300, 300, hints);
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            
            byte[] qrCodeBytes = outputStream.toByteArray();
            String base64QrCode = Base64.getEncoder().encodeToString(qrCodeBytes);
            
            log.debug("Generated QR code for data: {}", data);
            return "data:image/png;base64," + base64QrCode;
            
        } catch (WriterException | IOException e) {
            log.error("Error generating QR code for data: {}", data, e);
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    public String generateTicketQrCode(String ticketCode, Long eventId, Long userId) {
        // Create a structured data string for the QR code
        String qrData = String.format("TICKET:%s:EVENT:%d:USER:%d", ticketCode, eventId, userId);
        return generateQrCode(qrData);
    }
} 