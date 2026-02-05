'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        fontFamily: 'sans-serif',
                        textAlign: 'center',
                        padding: '20px',
                    }}>
                    <h1 style={{ marginBottom: '10px' }}>
                        Something went seriously wrong
                    </h1>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        We encountered a critical error. Please try refreshing
                        the page.
                    </p>
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}>
                        Try again
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <pre
                            style={{
                                marginTop: '20px',
                                padding: '10px',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '5px',
                                fontSize: '12px',
                                textAlign: 'left',
                                maxWidth: '100%',
                                overflow: 'auto',
                            }}>
                            {error.message}
                        </pre>
                    )}
                </div>
            </body>
        </html>
    );
}
