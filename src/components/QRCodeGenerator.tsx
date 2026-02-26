'use client'

import { QRCodeCanvas } from 'qrcode.react'
import { useRef } from 'react'
import { Download } from 'lucide-react'

interface QRCodeGeneratorProps {
    url: string
    storeName: string
}

export default function QRCodeGenerator({ url, storeName }: QRCodeGeneratorProps) {
    const qrRef = useRef<HTMLDivElement>(null)

    const downloadQR = () => {
        const canvas = qrRef.current?.querySelector('canvas')
        if (canvas) {
            const pngUrl = canvas.toDataURL('image/png')
            const downloadLink = document.createElement('a')
            downloadLink.href = pngUrl
            downloadLink.download = `${storeName.replace(/\s+/g, '-')}-qrcode.png`
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
        }
    }

    return (
        <div className="flex flex-col items-center space-y-4 rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Scan to Visit Store</h3>
            <div ref={qrRef} className="rounded-lg border bg-white p-4">
                <QRCodeCanvas
                    value={url}
                    size={200}
                    level={"H"}
                    includeMargin={true}
                />
            </div>
            <p className="text-sm text-gray-500 break-all text-center">{url}</p>
            <button
                onClick={downloadQR}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
                <Download size={16} />
                Download QR Code
            </button>
        </div>
    )
}
