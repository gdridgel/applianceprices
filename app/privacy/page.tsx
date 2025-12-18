import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Appliance Prices',
  description: 'Privacy policy for Appliance Prices. Learn how we collect, use, and protect your information.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://appliance-prices.com/privacy'
  }
}

export default function PrivacyPolicy() {
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
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-slate-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-slate-300 mb-4">
              Appliance Prices ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you visit our website 
              appliance-prices.com (the "Site").
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="text-slate-300 mb-4">We may collect the following types of information:</p>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li><strong>Usage Data:</strong> Information about how you use our website, including pages visited, time spent on pages, and referring websites.</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device type, and IP address.</li>
              <li><strong>Cookies:</strong> Small data files stored on your device to improve your browsing experience.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-slate-300 mb-4">We use the collected information to:</p>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li>Provide and maintain our website</li>
              <li>Improve user experience and website functionality</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Display relevant product information and pricing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Affiliate Disclosure</h2>
            <p className="text-slate-300 mb-4">
              Appliance Prices is a participant in the Amazon Services LLC Associates Program and the Home Depot Affiliate Program, 
              affiliate advertising programs designed to provide a means for sites to earn advertising fees by advertising and 
              linking to Amazon.com and HomeDepot.com.
            </p>
            <p className="text-slate-300 mb-4">
              When you click on product links on our site and make a purchase, we may earn a commission at no additional cost to you. 
              This helps support our website and allows us to continue providing free price comparison services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
            <p className="text-slate-300 mb-4">
              We use cookies and similar tracking technologies to track activity on our website and hold certain information. 
              Cookies are files with a small amount of data that may include an anonymous unique identifier.
            </p>
            <p className="text-slate-300 mb-4">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, 
              if you do not accept cookies, you may not be able to use some portions of our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-slate-300 mb-4">We may use third-party services that collect, monitor, and analyze data:</p>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li><strong>Google Analytics:</strong> To analyze website traffic and user behavior</li>
              <li><strong>Amazon Associates:</strong> To track affiliate purchases</li>
              <li><strong>Impact Radius:</strong> To manage affiliate relationships with Home Depot</li>
            </ul>
            <p className="text-slate-300 mt-4">
              These third parties have their own privacy policies governing the use of your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-slate-300 mb-4">
              We implement appropriate security measures to protect your personal information. However, no method of 
              transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-slate-300 mb-4">
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-slate-300 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-slate-300 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-slate-300">
              Email: privacy@appliance-prices.com
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
