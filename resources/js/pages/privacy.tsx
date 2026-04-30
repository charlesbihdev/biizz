import { Head, Link } from '@inertiajs/react';

export default function PrivacyPage() {
    return (
        <>
            <Head>
                <title>Privacy Policy - biizz.app</title>
                <meta
                    name="description"
                    content="Privacy Policy for biizz.app, including Google authentication, Meta Pixel connection, and WhatsApp AI commerce features."
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
                        Privacy Policy
                    </h1>
                    <p className="mt-3 text-sm text-site-muted">
                        Last updated: April 30, 2026
                    </p>

                    <div className="mt-10 space-y-8 text-sm leading-7 text-site-muted">
                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                1. Who We Are
                            </h2>
                            <p className="mt-2">
                                biizz.app ("biizz", "we", "us", "our") provides
                                an e-commerce operating system that helps
                                entrepreneurs run online stores, receive
                                payments, connect analytics tools, and use
                                optional AI-powered commerce features.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                2. Information We Collect
                            </h2>
                            <p className="mt-2">
                                We collect information needed to provide and
                                secure the platform, including:
                            </p>
                            <ul className="mt-2 list-disc space-y-1 pl-6">
                                <li>
                                    Account details such as name, email address,
                                    and login credentials.
                                </li>
                                <li>
                                    Business profile details, storefront
                                    settings, product catalog data, and order
                                    records.
                                </li>
                                <li>
                                    Payment setup information such as selected
                                    gateway and encrypted API keys that you
                                    provide.
                                </li>
                                <li>
                                    Integration data from connected providers
                                    including Google, Meta, and WhatsApp
                                    services that you authorize.
                                </li>
                                <li>
                                    Technical and usage data such as log data,
                                    device metadata, and security events.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                3. How We Use Information
                            </h2>
                            <p className="mt-2">We use collected information to:</p>
                            <ul className="mt-2 list-disc space-y-1 pl-6">
                                <li>
                                    Create and manage your account and
                                    businesses.
                                </li>
                                <li>
                                    Operate storefronts, checkout flows, and
                                    order management.
                                </li>
                                <li>
                                    Connect approved third-party integrations
                                    you choose.
                                </li>
                                <li>
                                    Power optional WhatsApp AI commerce
                                    workflows for your business.
                                </li>
                                <li>
                                    Improve reliability, prevent fraud, and
                                    enforce platform security.
                                </li>
                                <li>
                                    Comply with legal obligations and valid
                                    law-enforcement requests.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                4. Google Authentication Data
                            </h2>
                            <p className="mt-2">
                                If you sign in with Google, we receive limited
                                profile data necessary for authentication, such
                                as your name, email address, and account
                                identifier. We use this data only to authenticate
                                you and manage your account on biizz.app.
                            </p>
                            <p className="mt-2">
                                We do not sell Google user data. We do not use
                                Google user data for advertising. We do not share
                                Google user data with third parties except where
                                required to operate our service, meet legal
                                requirements, or with your explicit consent.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                5. Meta Pixel and Meta Integrations
                            </h2>
                            <p className="mt-2">
                                If you connect your Meta assets, biizz.app may
                                access and use information needed to link your
                                business to your own Meta Pixel and related
                                analytics settings for event tracking.
                            </p>
                            <p className="mt-2">
                                We process this integration data only to provide
                                requested tracking and campaign measurement
                                functionality for your store. You control whether
                                to connect, disconnect, or reconfigure this
                                integration.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                6. WhatsApp AI Commerce Features
                            </h2>
                            <p className="mt-2">
                                If enabled by you, biizz.app may process customer
                                messages, product references, and transactional
                                context to support AI-assisted commerce on
                                WhatsApp for your business.
                            </p>
                            <p className="mt-2">
                                This feature is optional and controlled per
                                business. You are responsible for your customer
                                communications and disclosures required under
                                applicable law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                7. Data Sharing and Service Providers
                            </h2>
                            <p className="mt-2">
                                We may share information with trusted service
                                providers that help us operate platform
                                infrastructure, authentication, communication,
                                analytics, or payments. We require these parties
                                to process data only for permitted service
                                purposes and with reasonable safeguards.
                            </p>
                            <p className="mt-2">
                                We may also disclose data when required by law or
                                to protect rights, safety, and platform
                                integrity.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                8. Data Security
                            </h2>
                            <p className="mt-2">
                                We implement administrative, technical, and
                                organizational safeguards designed to protect
                                personal data. Sensitive credentials, including
                                payment gateway keys, are encrypted at rest.
                                While we apply industry-standard controls, no
                                system can guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                9. Data Retention
                            </h2>
                            <p className="mt-2">
                                We retain personal data for as long as needed to
                                provide services, comply with legal obligations,
                                resolve disputes, and enforce our agreements.
                                Retention periods vary by data type and legal
                                requirement.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                10. Your Rights and Choices
                            </h2>
                            <p className="mt-2">
                                Depending on your location, you may have rights
                                to request access, correction, deletion,
                                restriction, objection, or portability of your
                                personal data. You may also disconnect third-party
                                integrations at any time through available account
                                settings where supported.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                11. Data Deletion Requests
                            </h2>
                            <p className="mt-2">
                                To request account or data deletion, contact us at{' '}
                                <a
                                    href="mailto:privacy@biizz.app"
                                    className="text-brand hover:underline"
                                >
                                    privacy@biizz.app
                                </a>{' '}
                                from the email address associated with your
                                account. We may request verification details
                                before processing deletion.
                            </p>
                            <p className="mt-2">
                                If your request relates to Meta-connected data,
                                include your business name and Meta asset details
                                so we can process the request accurately.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                12. Children's Privacy
                            </h2>
                            <p className="mt-2">
                                biizz.app is not directed to children under 13,
                                and we do not knowingly collect personal
                                information from children under 13.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                13. International Processing
                            </h2>
                            <p className="mt-2">
                                We may process and store information in countries
                                other than your own. Where required, we implement
                                safeguards for cross-border data transfers in line
                                with applicable law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                14. Updates to This Policy
                            </h2>
                            <p className="mt-2">
                                We may update this Privacy Policy from time to
                                time. Material updates will be posted on this page
                                with an updated effective date.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-site-fg">
                                15. Contact
                            </h2>
                            <p className="mt-2">
                                For privacy questions, contact{' '}
                                <a
                                    href="mailto:privacy@biizz.app"
                                    className="text-brand hover:underline"
                                >
                                    privacy@biizz.app
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
