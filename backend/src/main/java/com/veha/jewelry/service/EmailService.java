package com.veha.jewelry.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String name, String token) {
        String verifyLink = "http://localhost:8080/api/auth/verify-email?token=" + token;
        String htmlContent = "<div style=\"font-family: 'Jost', sans-serif; background-color: #0B0B0C; color: #ECE4D2; padding: 40px; text-align: center; border: 1px solid rgba(217, 184, 92, 0.16);\">" +
                "<h1 style=\"color: #D9B85C; font-family: 'Cinzel', serif;\">VEHA JEWELRY</h1>" +
                "<p style=\"font-size: 16px;\">Welcome, " + name + "!</p>" +
                "<p style=\"color: #A79E8A;\">Thank you for registering. Please verify your email to unlock your account.</p>" +
                "<a href=\"" + verifyLink + "\" style=\"display: inline-block; background: linear-gradient(135deg, #E8CC76, #C49B3F); color: #1A1408; text-decoration: none; padding: 12px 30px; font-weight: 500; margin-top: 20px; letter-spacing: 0.15em; text-transform: uppercase;\">Verify Email</a>" +
                "</div>";

        sendHtmlEmail(to, "Verify your VEHA account", htmlContent);
    }

    public void sendPasswordResetEmail(String to, String token) {
        // Reset password link pointing to frontend template
        String resetLink = "http://localhost:8080/reset-password.html?token=" + token;
        String htmlContent = "<div style=\"font-family: 'Jost', sans-serif; background-color: #0B0B0C; color: #ECE4D2; padding: 40px; text-align: center; border: 1px solid rgba(217, 184, 92, 0.16);\">" +
                "<h1 style=\"color: #D9B85C; font-family: 'Cinzel', serif;\">VEHA JEWELRY</h1>" +
                "<p style=\"font-size: 16px;\">Password Reset Request</p>" +
                "<p style=\"color: #A79E8A;\">You requested a password reset. Click the button below to choose a new password.</p>" +
                "<a href=\"" + resetLink + "\" style=\"display: inline-block; background: linear-gradient(135deg, #E8CC76, #C49B3F); color: #1A1408; text-decoration: none; padding: 12px 30px; font-weight: 500; margin-top: 20px; letter-spacing: 0.15em; text-transform: uppercase;\">Reset Password</a>" +
                "</div>";

        sendHtmlEmail(to, "Reset your VEHA password", htmlContent);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom("no-reply@veha.com");
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send transactional email to " + to + ": " + e.getMessage());
        }
    }
}
