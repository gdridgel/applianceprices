import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Appliance Prices - Compare Best Deals on Major Appliances',
  description: 'Compare prices on refrigerators, washers, dryers, and more. Find the best deals on major appliances from Amazon.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
