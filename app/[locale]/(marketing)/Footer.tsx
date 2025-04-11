
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Campus<span className="text-blue-400">Stay</span></h3>
          <p className="text-gray-400 mb-4">
            The #1 platform for student housing near campus. Find your perfect student accommodation today.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition duration-200">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-lg mb-4">For Students</h4>
          <ul className="space-y-2">
          <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">How It Works</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Find Accommodation</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Virtual Tours</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Roommate Finder</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Student Resources</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-lg mb-4">For brokers</h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">List Your Property</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Property Management</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Landlord Resources</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Success Stories</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Landlord FAQ</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-lg mb-4">Company</h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">About Us</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Blog</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Careers</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Contact</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Help Center</a></li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-800 mt-8 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; 2025 CampusStay. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition duration-200">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition duration-200">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition duration-200">Cookie Policy</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
  )
}
