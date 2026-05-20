// @ts-nocheck
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BsFacebook, BsLinkedin, BsTwitterX } from 'react-icons/bs';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      title: 'Platform',
      links: [
        ['/', 'Home'],
        ['/trips', 'Search Trips'],
        ['/about', 'About RindaSeat'],
        ['/dashboard', 'Dashboard'],
      ],
    },
    {
      title: 'Support',
      links: [
        ['/help', 'Help Center'],
        ['/contact', 'Contact Us'],
        ['/faq', 'FAQ'],
      ],
    },
    {
      title: 'Legal',
      links: [
        ['/privacy', 'Privacy Policy'],
        ['/terms', 'Terms of Service'],
        ['/cookies', 'Cookies'],
      ],
    },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-950 text-gray-300 mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">RS</span>
              </div>
              <span className="font-bold text-white text-lg">RindaSeat</span>
            </div>
            <p className="text-gray-400 text-sm max-w-sm leading-6">
              Smart bus booking for Rwanda. Search real-like schedules, choose seats, pay in RWF, and travel with QR tickets.
            </p>
            <div className="mt-5 text-sm text-gray-400 space-y-1">
              <p>Nyabugogo Bus Park, Kigali</p>
              <p>support@rindaseat.rw</p>
              <p>+250 788 000 111</p>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="font-semibold text-white mb-4">{column.title}</h4>
              <ul className="space-y-2 text-sm">
                {column.links.map(([to, label]) => (
                  <li key={to}>
                    <Link to={to} className="hover:text-primary-400 transition">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} RindaSeat. Rwanda transport booking demo platform.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com" className="text-gray-400 hover:text-primary-400 transition" aria-label="Twitter">
                <BsTwitterX />
              </a>
              <a href="https://facebook.com" className="text-gray-400 hover:text-primary-400 transition" aria-label="Facebook">
                <BsFacebook />
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-primary-400 transition" aria-label="LinkedIn">
                <BsLinkedin />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
