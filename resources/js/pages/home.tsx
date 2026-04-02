import { Head } from '@inertiajs/react';
import LandingNav from '@/components/Landing/LandingNav';
import HeroSection from '@/components/Landing/HeroSection';
import StorefrontPreview from '@/components/Landing/StorefrontPreview';
import PillarsSection from '@/components/Landing/PillarsSection';
import SocialProofSection from '@/components/Landing/SocialProofSection';
import FinalCTA from '@/components/Landing/FinalCTA';
import LandingFooter from '@/components/Landing/LandingFooter';

export default function Home() {
    return (
        <>
            <Head>
                <title>biizz.app - E-commerce OS for Entrepreneurs</title>
                <meta
                    name="description"
                    content="Your own online store, built-in payments, and an AI that sells for you on WhatsApp while you sleep. Set up once, sell forever."
                />
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
