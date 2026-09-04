import { FiPhone, FiFacebook } from 'react-icons/fi';

const ContactFixed = () => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-2">
      {/* Phone */}
      <a
        href="tel:0123456789"
        className="w-12 h-12 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        title="Gọi điện"
      >
        <FiPhone className="w-6 h-6 text-white" />
      </a>

      {/* Facebook */}
      <a
        href="https://facebook.com/luanhuynhfco"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        title="Facebook"
      >
        <FiFacebook className="w-6 h-6 text-white" />
      </a>
    </div>
  );
};

export default ContactFixed;
