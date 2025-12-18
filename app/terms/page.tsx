import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Appliance Prices',
  description: 'Terms of service for Appliance Prices. Read our terms and conditions for using our website.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://appliance-prices.com/terms'
  }
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:text-blue-400 transition">
            <span className="text-blue-400">Appliance</span> Prices
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-slate-400 hover:text-white transition">Compare Prices</Link>
            <Link href="/deals" className="text-slate-400 hover:text-white transition">Deals</Link>
            <Link href="/blog" className="text-slate-400 hover:text-white transition">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-slate-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
            <p className="text-slate-300 mb-4">
              By accessing and using Appliance Prices (appliance-prices.com), you agree to be bound by these Terms of Service. 
              If you do not agree with any part of these terms, you may not access or use our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
            <p className="text-slate-300 mb-4">
              Appliance Prices is a price comparison website that aggregates and displays pricing information for 
              appliances and electronics from various retailers. We provide this information to help consumers make 
              informed purchasing decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Price and Product Information</h2>
            <p className="text-slate-300 mb-4">
              While we strive to provide accurate and up-to-date pricing information, we cannot guarantee that all 
              prices, product descriptions, or other content on our website are accurate, complete, or current.
            </p>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li>Prices may change at any time without notice</li>
              <li>Product availability varies by retailer and location</li>
              <li>We are not responsible for pricing errors on third-party websites</li>
              <li>Always verify the final price on the retailer's website before purchasing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Affiliate Relationships</h2>
            <p className="text-slate-300 mb-4">
              Appliance Prices participates in affiliate programs with Amazon, Home Depot, and potentially other retailers. 
              This means we may earn a commission when you click on links to retailer websites and make a purchase.
            </p>
            <p className="text-slate-300 mb-4">
              Our affiliate relationships do not affect the prices you pay. The commission is paid by the retailer, 
              not by you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Websites</h2>
            <p className="text-slate-300 mb-4">
              Our website contains links to third-party websites (retailers). We are not responsible for:
            </p>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li>The content, accuracy, or practices of third-party websites</li>
              <li>Your transactions with third-party retailers</li>
              <li>Any damages or losses resulting from your use of third-party websites</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
            <p className="text-slate-300 mb-4">
              The content on Appliance Prices, including text, graphics, logos, and software, is owned by us or our 
              licensors and is protected by copyright and other intellectual property laws.
            </p>
            <p className="text-slate-300 mb-4">
              Product images and descriptions are provided by retailers and remain the property of their respective owners.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Prohibited Uses</h2>
            <p className="text-slate-300 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li>Use our website for any unlawful purpose</li>
              <li>Scrape, copy, or redistribute our content without permission</li>
              <li>Interfere with the proper functioning of the website</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated systems to access the website in a manner that exceeds reasonable use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
            <p className="text-slate-300 mb-4">
              APPLIANCE PRICES IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, 
              EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE WEBSITE WILL BE UNINTERRUPTED, ERROR-FREE, 
              OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-slate-300 mb-4">
              TO THE FULLEST EXTENT PERMITTED BY LAW, APPLIANCE PRICES SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF 
              PROFITS, DATA, OR USE, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OUR WEBSITE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-slate-300 mb-4">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately 
              upon posting to the website. Your continued use of the website after changes are posted constitutes 
              acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
            <p className="text-slate-300 mb-4">
              These Terms of Service shall be governed by and construed in accordance with the laws of the 
              United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-slate-300 mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-slate-300">
              Email: legal@appliance-prices.com
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500">
          <div className="flex justify-center gap-6 mb-4 text-sm">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
          <p>© {new Date().getFullYear()} Appliance Prices. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
