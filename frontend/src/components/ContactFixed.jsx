import { FiPhone, FiFacebook } from 'react-icons/fi';

const ContactFixed = () => {
  return (
    <div className="fixed bottom-24 right-2 md:bottom-24 md:right-4 z-[9999] flex flex-col space-y-2">
      {/* Phone */}
      <a
        href="tel:0327487583"
        className="w-10 h-10 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        title="Gọi điện"
      >
        <FiPhone className="w-6 h-6 text-white" />
      </a>

      {/* Facebook */}
      <a
        href="https://www.facebook.com/luanfcocom"
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        title="Facebook"
      >
        <FiFacebook className="w-6 h-6 text-white" />
      </a>

       {/* Facebook */}
      <a
        href="https://zalo.me/0327487583"
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        title="Facebook"
      >
        {/* <FiFacebook className="w-6 h-6 text-white" /> */}
        <img src="https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/960px-Icon_of_Zalo.svg.png?utm_source=vi.wikipedia.org&utm_campaign=index&utm_content=thumbnail" alt="Facebook" className="w-6 h-6" />
      </a>
    </div>
  );
};

export default ContactFixed;
