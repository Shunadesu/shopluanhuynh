import { Helmet } from 'react-helmet-async';

export default function SEOHead({
  title,
  description,
  keywords,
  ogImage,
  favicon,
  twitterCard = 'summary',
  canonical,
  type = 'website',
}) {
  const siteName = 'Shop Luan Huỳnh';
  const defaultDescription = 'Cung cấp tài khoản game giá rẻ, uy tín, chất lượng. Mua bán tài khoản Liên Quân, PUBG, Free Fire, Genshin Impact và nhiều game khác.';
  const defaultKeywords = 'mua tai khoan game, tai khoan game gia re, ban tai khoan, lien quan mobile, pubg mobile, free fire, genshin impact';
  const defaultOgImage = 'https://via.placeholder.com/1200x630/1e293b/0ea5e9?text=Shop+Luan+Huynh';

  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Mua Bán Tài Khoản Game Giá Rẻ`;
  const metaDescription = description || defaultDescription;
  const metaKeywords = keywords || defaultKeywords;
  const metaOgImage = ogImage || defaultOgImage;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      
      {/* Favicon - Update dynamically */}
      {favicon && <link rel="icon" type="image/x-icon" href={favicon} />}
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaOgImage} />
      <meta property="og:site_name" content={siteName} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaOgImage} />
    </Helmet>
  );
}
