import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Slider = ({ slides }) => {
  if (!slides || slides.length === 0) return null;

  return (
    <div className="w-full mb-8">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        loop={true}
        className="rounded-xl overflow-hidden"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            <a
              href={slide.link || '#'}
              target={slide.link ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="block"
            >
              <div className="relative h-64 md:h-96">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                {slide.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <h3 className="text-white text-2xl font-bold">{slide.title}</h3>
                  </div>
                )}
              </div>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;
