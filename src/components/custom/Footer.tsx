import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-800 py-8 text-gray-200">
      <div className="container mx-auto flex flex-col justify-between px-4 md:flex-row">
        <div className="mb-6 md:mb-0">
          <h4 className="mb-2 text-xl font-semibold">Nine11</h4>
          <p>&copy; {new Date().getFullYear()} Nine11. All rights reserved.</p>
        </div>
        <div className="flex space-x-6">
          <Link href="/privacy">
            <p className="hover:text-white">Privacy Policy</p>
          </Link>
          <Link href="/terms">
            <p className="hover:text-white">Terms of Service</p>
          </Link>
          <Link href="/contact">
            <p className="hover:text-white">Contact Us</p>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
