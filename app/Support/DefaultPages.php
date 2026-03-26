<?php

namespace App\Support;

class DefaultPages
{
    /**
     * Returns draft page stubs auto-created when a business registers.
     *
     * @return array<int, array{title: string, slug: string, type: string, is_published: bool, sort_order: int, content: string}>
     */
    public static function stubs(): array
    {
        return [
            [
                'title' => 'About Us',
                'slug' => 'about-us',
                'type' => 'about',
                'is_published' => false,
                'sort_order' => 1,
                'content' => '<h2>1. Our Story</h2>'
                    .'<p>We are passionate about delivering quality products and exceptional service to our customers. Founded with the mission to make shopping easy and enjoyable, we carefully curate our selection to ensure every product meets our high standards.</p>'
                    .'<h2>2. Our Mission</h2>'
                    .'<p>To provide our customers with the best shopping experience possible — from browsing to delivery. We believe in honest pricing, quality products, and friendly customer service.</p>'
                    .'<h2>3. Why Shop With Us?</h2>'
                    .'<ul><li>Carefully selected products</li><li>Fast and reliable delivery</li><li>Secure and easy checkout</li><li>Dedicated customer support</li></ul>'
                    .'<h2>4. Get in Touch</h2>'
                    .'<p>We appreciate your trust and look forward to serving you. Feel free to reach out if you have any questions or need assistance.</p>',
            ],
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'type' => 'privacy_policy',
                'is_published' => false,
                'sort_order' => 2,
                'content' => '<p>Your privacy is important to us. This policy explains what information we collect, how we use it, and your rights regarding your personal data.</p>'
                    .'<h2>1. Information We Collect</h2>'
                    .'<p>We collect information you provide when placing an order, including your name, email address, shipping address, and payment details. We may also collect browsing data to improve your shopping experience.</p>'
                    .'<h2>2. How We Use Your Information</h2>'
                    .'<ul><li>To process and fulfil your orders</li><li>To send order confirmations and shipping updates</li><li>To improve our products and services</li><li>To respond to your enquiries and support requests</li></ul>'
                    .'<h2>3. Data Security</h2>'
                    .'<p>We take reasonable measures to protect your personal information. Payment information is processed securely and we do not store card details on our servers.</p>'
                    .'<h2>4. Third Parties</h2>'
                    .'<p>We do not sell or rent your personal information to third parties. We may share data with service providers (e.g. payment processors, delivery companies) strictly to fulfil your order.</p>'
                    .'<h2>5. Contact Us</h2>'
                    .'<p>If you have questions about this privacy policy, please contact us through our Contact page.</p>',
            ],
            [
                'title' => 'Terms & Conditions',
                'slug' => 'terms-and-conditions',
                'type' => 'terms',
                'is_published' => false,
                'sort_order' => 3,
                'content' => '<p>By accessing or using our website, you agree to be bound by these Terms and Conditions. Please read them carefully before making any purchase.</p>'
                    .'<h2>1. Orders &amp; Payments</h2>'
                    .'<p>All orders are subject to availability. We reserve the right to cancel any order and provide a full refund if we are unable to fulfil it. Prices are listed in the displayed currency and include applicable taxes unless otherwise stated.</p>'
                    .'<h2>2. Shipping &amp; Delivery</h2>'
                    .'<p>Delivery times are estimates and may vary due to factors outside our control. We will provide tracking information where available. Risk of loss passes to you upon delivery.</p>'
                    .'<h2>3. Returns &amp; Refunds</h2>'
                    .'<p>We want you to be satisfied with your purchase. If you are not happy with your order, please contact us within 7 days of receipt to discuss a return or exchange. Items must be in original condition with all tags and packaging.</p>'
                    .'<h2>4. Intellectual Property</h2>'
                    .'<p>All content on this store, including images, descriptions, and logos, is the property of this business and may not be reproduced without permission.</p>'
                    .'<h2>5. Limitation of Liability</h2>'
                    .'<p>We shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or the purchase of products.</p>'
                    .'<h2>6. Changes to Terms</h2>'
                    .'<p>We reserve the right to update these terms at any time. Continued use of the store constitutes acceptance of any revised terms.</p>',
            ],
            [
                'title' => 'FAQ',
                'slug' => 'faq',
                'type' => 'faq',
                'is_published' => false,
                'sort_order' => 4,
                'content' => '<h2>How do I place an order?</h2>'
                    .'<p>Browse our products, add items to your cart, and proceed to checkout. You\'ll need to provide your shipping address and payment details to complete the order.</p>'
                    .'<h2>What payment methods do you accept?</h2>'
                    .'<p>We accept major payment methods including mobile money and card payments. All transactions are processed securely.</p>'
                    .'<h2>How long does delivery take?</h2>'
                    .'<p>Delivery times vary depending on your location. You will receive an estimated delivery date at checkout and a tracking update once your order ships.</p>'
                    .'<h2>Can I change or cancel my order?</h2>'
                    .'<p>Please contact us as soon as possible if you need to change or cancel your order. We\'ll do our best to accommodate your request before the order is dispatched.</p>'
                    .'<h2>What is your return policy?</h2>'
                    .'<p>We accept returns within 7 days of delivery for items that are unused and in their original condition. Please contact us to initiate a return.</p>'
                    .'<h2>How can I contact you?</h2>'
                    .'<p>You can reach us through our Contact page or via the contact details listed there. We aim to respond within 24 hours.</p>',
            ],
            [
                'title' => 'Shipping & Returns',
                'slug' => 'shipping-and-returns',
                'type' => 'shipping',
                'is_published' => false,
                'sort_order' => 5,
                'content' => '<h2>1. Shipping</h2>'
                    .'<p>We offer delivery to locations within our service area. Shipping costs and estimated delivery times are shown at checkout based on your location.</p>'
                    .'<ul><li>Standard delivery: 3–5 business days</li><li>Express delivery: 1–2 business days (where available)</li></ul>'
                    .'<p>Once your order ships, you will receive a notification with tracking information.</p>'
                    .'<h2>2. Returns</h2>'
                    .'<p>We accept returns within 7 days of delivery, provided the item is unused, undamaged, and in its original packaging. To start a return, please contact us with your order number and reason for return.</p>'
                    .'<h2>3. Refunds</h2>'
                    .'<p>Once we receive and inspect your returned item, we will process your refund within 5–7 business days. Refunds are issued to the original payment method.</p>'
                    .'<h2>4. Damaged or Incorrect Items</h2>'
                    .'<p>If you receive a damaged or incorrect item, please contact us immediately with photos and your order details. We will arrange a replacement or refund promptly.</p>',
            ],
            [
                'title' => 'Acceptable Use Policy',
                'slug' => 'acceptable-use',
                'type' => 'acceptable_use',
                'is_published' => false,
                'sort_order' => 6,
                'content' => '<p>This policy governs the acceptable use of our store and services. By using this store, you agree to comply with these guidelines.</p>'
                    .'<h2>1. Permitted Use</h2>'
                    .'<p>You may use this store solely for lawful, personal, non-commercial purposes — to browse products and make purchases for yourself or as gifts.</p>'
                    .'<h2>2. Prohibited Activities</h2>'
                    .'<ul><li>Using the store for any unlawful purpose</li><li>Attempting to gain unauthorised access to any part of the store</li><li>Transmitting any harmful, offensive, or disruptive content</li><li>Scraping, crawling, or harvesting data without permission</li><li>Impersonating any person or entity</li></ul>'
                    .'<h2>3. Consequences</h2>'
                    .'<p>Violation of this policy may result in suspension of your account and access to our services, and may be reported to relevant authorities where required by law.</p>'
                    .'<h2>4. Updates</h2>'
                    .'<p>We may update this policy periodically. We encourage you to review it regularly to stay informed of any changes.</p>',
            ],
        ];
    }
}
