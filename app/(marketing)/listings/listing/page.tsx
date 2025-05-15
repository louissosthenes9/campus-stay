'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BoltIcon,
  WifiIcon,
  UsersIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  FilmIcon,
  CalendarIcon,
  CameraIcon,
  PlayIcon,
  CubeIcon,
  MapPinIcon,
  StarIcon as StarOutlineIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Header from '../../Header';
import Footer from '../../Footer';

// Dummy Reviews
const reviews = [
  {
    name: "John M.",
    location: "Dar es Salaam",
    rating: 5,
    comment: "Amazing location near University of Dar es Salaam! Security is top-notch."
  },
  {
    name: "Amina K.",
    location: "Mwanza",
    rating: 4,
    comment: "Good value for money. Close to Nakumatt Supermarket and public transport."
  },
  {
    name: "David T.",
    location: "Arusha",
    rating: 4,
    comment: "Modern facilities and clean environment. Would recommend to fellow students."
  }
];

export default function PropertyDetailsPage() {
  const [activeTab, setActiveTab] = useState('photos');

  // Image URLs (Replace with real property images)
  const imageUrls = [
    "https://picsum.photos/seed/room1/800/600 ",
    "https://picsum.photos/seed/room2/800/600 ",
    "https://picsum.photos/seed/room3/800/600 "
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content */}
      <main className="py-6 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Property Name & Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Canvas Oyster Bay, Dar es Salaam</h1>
              <p className="text-gray-600 mt-1">Nakawa, Dar es Salaam, Tanzania</p>
            </div>
            <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full self-start sm:self-auto">
              Student's Choice
            </span>
          </div>

          {/* Image Carousel */}
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={10}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              className="h-96"
            >
              {imageUrls.map((url, index) => (
                <SwiperSlide key={index}>
                  <div className="h-full bg-cover bg-center" style={{ backgroundImage: `url(${url})` }}></div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Rating */}
          <div className="flex items-center">
            {[...Array(4)].map((_, i) => (
              <StarSolidIcon key={i} className="h-5 w-5 text-yellow-500" />
            ))}
            <StarOutlineIcon className="h-5 w-5 text-gray-300" />
            <span className="ml-2 text-gray-600">4.7 (12 reviews)</span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            {[
              { id: 'photos', icon: <CameraIcon className="h-5 w-5" />, label: 'Photos' },
              { id: 'videos', icon: <PlayIcon className="h-5 w-5" />, label: 'Videos' },
              { id: '3d', icon: <CubeIcon className="h-5 w-5" />, label: '3D Views' },
              { id: 'map', icon: <MapPinIcon className="h-5 w-5" />, label: 'Map View' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-indigo-600'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'photos' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img src={url} alt={`Property view ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Video Placeholder</span>
              </div>
            )}

            {activeTab === '3d' && (
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">3D View Placeholder</span>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Map Placeholder (Integrate Mapbox)</span>
              </div>
            )}
          </div>

          {/* Distance Info */}
          <p className="text-gray-600">
            3.2 km from University of Dar es Salaam · 1.5 km from Ardhi University · 2.1 km from Mwenge Market
          </p>

          {/* Price */}
          <p className="text-3xl font-bold text-indigo-600">From TZS 850,000/month</p>

          {/* Amenities Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Bills Included */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Bills Included</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <BoltIcon className="h-6 w-6 text-gray-500" />
                    <span>Electricity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <WifiIcon className="h-6 w-6 text-gray-500" />
                    <span>High-Speed WiFi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="h-6 w-6 text-gray-500">💧</span>
                    <span>Water</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="h-6 w-6 text-gray-500">👮</span>
                    <span>24/7 Security</span>
                  </div>
                </div>
              </div>

              {/* Common Amenities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Common Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="h-6 w-6 text-gray-500" />
                    <span>Social Spaces</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpenIcon className="h-6 w-6 text-gray-500" />
                    <span>Study Rooms</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="h-6 w-6 text-gray-500" />
                    <span>Roof Terrace</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-6 w-6 text-gray-500" />
                    <span>Events & Activities</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">What People Say</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={index} className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <StarSolidIcon key={i} className="h-4 w-4 text-yellow-500" />
                      ))}
                    </div>
                    <p className="font-medium">{review.name}, {review.location}</p>
                    <p className="text-gray-600 mt-1">{review.comment}</p>
                  </div>
                ))}
                <a href="#" className="text-indigo-600 hover:underline">
                  View all 12 reviews {'>'}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Broker Contact */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Contact Property Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">DP</span>
                </div>
                <div>
                  <h3 className="font-semibold">David P.</h3>
                  <p className="text-gray-600">Real Estate Agent · 5+ years experience</p>
                  <div className="mt-2 space-y-1">
                    <p className="flex items-center text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      +255 714 000 000
                    </p>
                    <p className="flex items-center text-gray-600">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      david@property.co.tz
                    </p>
                  </div>
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full p-2 border border-gray-300 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={4} className="w-full p-2 border border-gray-300 rounded"></textarea>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors">
                  Send Enquiry
                </button>
              </form>
            </CardContent>
          </Card>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-700 transition-colors shadow-md">
              Schedule a Visit
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}