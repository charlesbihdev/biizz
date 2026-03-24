export default function AppLogo() {
    return (
        <>
            {/* Compact slot — visible when sidebar is collapsed to icon mode */}
            <span className="text-base font-black leading-none text-brand">b.</span>

            {/* Full text — hidden in collapsed sidebar */}
            <span className="text-sm font-bold tracking-tight text-site-fg">
                biizz<span className="text-brand">.</span>app
            </span>
        </>
    );
}
