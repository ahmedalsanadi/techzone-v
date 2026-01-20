import { Toaster } from 'sonner';

export default function ToasterContainer({ isArabic }: { isArabic: boolean }) {
    return (
        <Toaster
            position={isArabic ? 'top-right' : 'top-left'}
            expand={false}
            richColors
            closeButton
            dir={isArabic ? 'rtl' : 'ltr'}
            toastOptions={{
                className: `font-ibm-plex-sans-arabic border border-green-200 shadow-[0_20px_40px_rgba(0,0,0,0.15)] rounded-2xl bg-white/95 backdrop-blur-md ${
                    isArabic ? 'rtl' : 'ltr'
                }`,
                style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    minWidth: '320px',
                    maxWidth: '420px',
                },
                actionButtonStyle: {
                    backgroundColor: 'transparent',
                    color: 'var(--theme-primary, #B44734)',
                    fontWeight: '800',
                    fontSize: '13px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginTop: '8px',
                },
            }}
            className="toaster"
        />
    );
}
