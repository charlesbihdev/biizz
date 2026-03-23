import { Head } from '@inertiajs/react';
import LandingNav from './home/LandingNav';
import HeroSection from './home/HeroSection';
import StorefrontPreview from './home/StorefrontPreview';
import PillarsSection from './home/PillarsSection';
import SocialProofSection from './home/SocialProofSection';
import FinalCTA from './home/FinalCTA';
import LandingFooter from './home/LandingFooter';

export default function Home() {
    return (
        <>
            <Head>
                <title>biizz.app — E-commerce OS for Africa</title>
                <meta name="description" content="Professional storefronts, built-in payments, and an AI agent that sells on WhatsApp. One platform for African merchants." />
            </Head>

            <div className="bg-site-bg">
                <LandingNav />
                <HeroSection />
                <StorefrontPreview />
                <PillarsSection />
                <SocialProofSection />
                <FinalCTA />
                <LandingFooter />
            </div>
        </>
    );
}
