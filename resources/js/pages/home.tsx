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
                <title>biizz.app — E-commerce OS for Entrepreneurs</title>
                <meta name="description" content="Your own online store, built-in payments, and an AI that sells for you on WhatsApp while you sleep. Set up once, sell forever." />
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
