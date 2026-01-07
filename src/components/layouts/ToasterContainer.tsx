import { Toaster } from "sonner";

export default function ToasterContainer({ isArabic }: { isArabic: boolean }) {
    return (
        <Toaster
            position={isArabic ? 'top-right' : 'top-left'}
            expand={false}
            richColors
            closeButton
            dir={isArabic ? 'rtl' : 'ltr'}
            toastOptions={{
                className:
                    'font-ibm-plex-sans-arabic border-0 shadow-[0_20px_40px_rgba(0,0,0,0.15)] rounded-2xl p-4 gap-4 bg-white/95 backdrop-blur-md',
                style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                },
                actionButtonStyle: {
                    backgroundColor: 'transparent',
                    color: '#B44734',
                    fontWeight: '800',
                    fontSize: '13px',
                    padding: '8px 12px',
                },
            }}
        />
    );
}
