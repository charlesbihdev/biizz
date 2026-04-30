import { Head, Link } from '@inertiajs/react';

export default function TermsPage() {
    return (
        <>
            <Head>
                <title>Terms of Service - biizz.app</title>
                <meta
                    name="description"
                    content="Terms of Service for biizz.app covering account usage, integrations, payments, WhatsApp AI features, and platform rules."
                />
            </Head>

            <main className="bg-site-bg px-6 py-16 text-site-fg">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8">
                        <Link
                            href="/"
                            className="text-sm text-site-muted transition hover:text-site-fg"
                        >
                            Back to home
                        </Link>
                    </div>

                    <h1 className="text-3xl font-bold sm:text-4xl">
                        Terms of Service
                    </h1>
                    <p className="mt-3 text-sm text-site-muted">
                        Last updated: April 30, 2026
                    </p>

                    <div className="mt-10 space-y-8 text-sm leading-7 text-site-muted">
                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                1. Agreement to Terms
                            </h2>
                            <p className="mt-2">
                                These Terms of Service ("Terms") govern your use
                                of biizz.app ("biizz", "we", "us", "our"). By
                                creating an account or using the platform, you
                                agree to these Terms and our Privacy Policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                2. Services
                            </h2>
                            <p className="mt-2">
                                biizz.app provides tools for creating and managing
                                online storefronts, product catalogs, checkout
                                experiences, customer-facing pages, and related
                                commerce operations.
                            </p>
                            <p className="mt-2">
                                Service features may include third-party
                                integrations such as payment providers, Google
                                authentication, Meta-related tracking
                                functionality, and optional WhatsApp AI commerce
                                capabilities.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                3. Eligibility and Account Responsibility
                            </h2>
                            <p className="mt-2">
                                You must be legally able to enter into this
                                agreement and use the platform in compliance with
                                applicable laws. You are responsible for all
                                activity under your account and for maintaining
                                the confidentiality of your login credentials.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                4. Acceptable Use
                            </h2>
                            <p className="mt-2">You agree not to:</p>
                            <ul className="mt-2 list-disc space-y-1 pl-6">
                                <li>
                                    Use the platform for unlawful, fraudulent, or
                                    deceptive activity.
                                </li>
                                <li>
                                    Infringe intellectual property, privacy, or
                                    other legal rights.
                                </li>
                                <li>
                                    Upload malware, abuse APIs, or interfere with
                                    platform stability or security.
                                </li>
                                <li>
                                    Misrepresent your identity, affiliations, or
                                    authorization to connect third-party assets.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                5. Third-Party Integrations
                            </h2>
                            <p className="mt-2">
                                You may connect third-party services through
                                biizz.app, including Google, Meta, WhatsApp, and
                                payment providers. You are responsible for
                                maintaining valid accounts and permissions with
                                those services.
                            </p>
                            <p className="mt-2">
                                Use of third-party services is also subject to
                                their own terms and policies. We are not
                                responsible for third-party service interruptions,
                                account restrictions, policy decisions, or API
                                changes outside our control.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                6. Meta Pixel and Event Tracking
                            </h2>
                            <p className="mt-2">
                                If you connect Meta assets, you represent that you
                                have authority to use those assets and to send
                                event data for your business. You are responsible
                                for any disclosures, notices, and consent
                                obligations required for your customers under
                                applicable law, and you agree to comply with the
                                Meta Business Tools Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                7. WhatsApp AI Commerce Features
                            </h2>
                            <p className="mt-2">
                                Optional AI commerce features may assist with
                                customer conversations, product suggestions, and
                                transaction support on WhatsApp. You are
                                responsible for reviewing outputs and ensuring your
                                business communications and sales activities remain
                                accurate and legally compliant.
                            </p>
                            <p className="mt-2">
                                AI-generated outputs may occasionally be
                                incomplete or incorrect. You should verify
                                important details, including pricing, availability,
                                and fulfillment commitments.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                8. Payments and Fees
                            </h2>
                            <p className="mt-2">
                                Payments processed through connected gateways are
                                handled by third-party payment providers. You are
                                responsible for your provider agreements,
                                settlement terms, chargebacks, refunds, taxes, and
                                compliance obligations.
                            </p>
                            <p className="mt-2">
                                If biizz.app introduces paid plans or usage-based
                                fees, applicable pricing and billing terms will be
                                communicated in-product or on our pricing pages.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                9. Your Content and Data
                            </h2>
                            <p className="mt-2">
                                You retain ownership of your business content and
                                data. You grant us a limited license to host,
                                process, transmit, and display that data as needed
                                to operate, maintain, and improve the platform.
                            </p>
                            <p className="mt-2">
                                You represent that you have all rights needed to
                                upload and use your content on the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                10. Intellectual Property
                            </h2>
                            <p className="mt-2">
                                biizz.app, including software, branding, and
                                related materials, is protected by intellectual
                                property laws. Except for rights explicitly granted
                                in these Terms, we reserve all rights.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                11. Suspension and Termination
                            </h2>
                            <p className="mt-2">
                                We may suspend or terminate access if we believe
                                you violated these Terms, created security or
                                legal risk, or misused the platform or
                                integrations. You may stop using the platform at
                                any time.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                12. Disclaimer of Warranties
                            </h2>
                            <p className="mt-2">
                                The platform is provided on an "as is" and "as
                                available" basis, without warranties of any kind,
                                express or implied, to the fullest extent
                                permitted by law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                13. Limitation of Liability
                            </h2>
                            <p className="mt-2">
                                To the fullest extent permitted by law, biizz.app
                                and its affiliates are not liable for indirect,
                                incidental, special, consequential, or punitive
                                damages, or for loss of profits, revenue, data, or
                                goodwill arising from your use of the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                14. Indemnification
                            </h2>
                            <p className="mt-2">
                                You agree to defend, indemnify, and hold harmless
                                biizz.app and its affiliates from claims,
                                liabilities, damages, losses, and expenses
                                resulting from your use of the platform, your
                                content, or your violation of these Terms or
                                applicable law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                15. Changes to Terms
                            </h2>
                            <p className="mt-2">
                                We may update these Terms from time to time.
                                Continued use after updated Terms become effective
                                means you accept the revised Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                16. Governing Law
                            </h2>
                            <p className="mt-2">
                                These Terms are governed by the laws of Ghana,
                                without regard to conflict-of-law rules.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                17. Contact
                            </h2>
                            <p className="mt-2">
                                For legal questions, contact{' '}
                                <a
                                    href="mailto:legal@biizz.app"
                                    className="text-brand hover:underline"
                                >
                                    legal@biizz.app
                                </a>
                                .
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}
