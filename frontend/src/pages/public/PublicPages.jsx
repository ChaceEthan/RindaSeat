// @ts-nocheck
import { motion } from 'framer-motion';
import { Button } from '../../components/buttons/Button';
import { Card } from '../../components/cards/Card';

const PageShell = ({ title, subtitle, children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="text-primary-600 font-semibold mb-2">Rwanda transport made simple</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-3xl">{subtitle}</p>
      </motion.div>
      {children}
    </div>
  </div>
);

export const AboutPage = () => (
  <PageShell
    title="About RindaSeat"
    subtitle="RindaSeat connects passengers with trusted Rwanda coach operators, live schedules, seat selection, digital payment, and QR tickets."
  >
    <div className="grid md:grid-cols-3 gap-6">
      {[
        ['Trusted operators', 'Volcano Express, Ritco, Kigali Coach, Royal Express, Omega Bus, and Virunga Express demo routes are ready for testing.'],
        ['Clear journeys', 'Search by route, date, company, bus type, and price before selecting seats.'],
        ['Digital first', 'Bookings, payments, and QR tickets are tracked end to end.'],
      ].map(([heading, text]) => (
        <Card key={heading}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{heading}</h2>
          <p className="text-gray-600 dark:text-gray-300">{text}</p>
        </Card>
      ))}
    </div>
  </PageShell>
);

export const ContactPage = () => (
  <PageShell
    title="Contact Support"
    subtitle="Need help with a booking, payment, ticket, or route? Our demo support channels are ready."
  >
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Passenger desk</h2>
        <div className="space-y-3 text-gray-600 dark:text-gray-300">
          <p>Phone: +250 788 000 111</p>
          <p>Email: support@rindaseat.rw</p>
          <p>Hours: Daily, 6:00 - 22:00 CAT</p>
        </div>
      </Card>
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Main office</h2>
        <div className="space-y-3 text-gray-600 dark:text-gray-300">
          <p>Nyabugogo Bus Park, Kigali</p>
          <p>Operator onboarding: partners@rindaseat.rw</p>
          <p>Emergency travel support: +250 788 000 112</p>
        </div>
      </Card>
    </div>
  </PageShell>
);

export const FAQPage = () => (
  <PageShell title="FAQ" subtitle="Fast answers for common booking, payment, and ticket questions.">
    <div className="space-y-4">
      {[
        ['Can I book without an account?', 'You can search publicly. Seat selection, payment, and tickets require login so bookings stay attached to your profile.'],
        ['How are payments handled?', 'Local development uses an instant simulated RWF payment so the full booking flow can be tested without external payment downtime.'],
        ['Can I choose my seat?', 'Yes. Booked and locked seats are disabled on the seat map.'],
        ['Where do I find my ticket?', 'After payment, your QR ticket appears under Tickets and in your dashboard history.'],
      ].map(([question, answer]) => (
        <Card key={question}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{question}</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{answer}</p>
        </Card>
      ))}
    </div>
  </PageShell>
);

export const HelpCenterPage = () => (
  <PageShell title="Help Center" subtitle="Start with the most common passenger workflows.">
    <div className="grid md:grid-cols-3 gap-6">
      {['Search a trip', 'Select seats', 'Pay and download ticket'].map((item, index) => (
        <Card key={item}>
          <div className="text-sm font-semibold text-primary-600 mb-2">Step {index + 1}</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{item}</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-3">Use the guided flow and watch for toast confirmations at each stage.</p>
        </Card>
      ))}
    </div>
    <Button className="mt-8" onClick={() => { window.location.href = '/trips'; }}>Search Trips</Button>
  </PageShell>
);

export const PrivacyPage = () => (
  <PageShell title="Privacy Policy" subtitle="RindaSeat keeps passenger booking data scoped to authentication, payment tracking, and ticket validation.">
    <Card>
      <p className="text-gray-600 dark:text-gray-300">
        Demo data is used for local testing. A production deployment should connect to approved payment, email, SMS, and analytics providers with audited retention policies.
      </p>
    </Card>
  </PageShell>
);

export const TermsPage = () => (
  <PageShell title="Terms of Service" subtitle="Bookings are confirmed after payment and represented by a unique QR ticket.">
    <Card>
      <p className="text-gray-600 dark:text-gray-300">
        Operators remain responsible for trip operations, departure timing, luggage policy, and passenger safety. RindaSeat provides the digital booking layer.
      </p>
    </Card>
  </PageShell>
);

export const CookiesPage = () => (
  <PageShell title="Cookie Policy" subtitle="RindaSeat uses local browser storage for theme, authentication token, and booking continuity in this demo.">
    <Card>
      <p className="text-gray-600 dark:text-gray-300">
        Production analytics and consent tooling can be added before public launch.
      </p>
    </Card>
  </PageShell>
);
