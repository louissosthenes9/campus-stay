import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Phone, Mail, Users, HomeIcon, Bed, Bath } from "lucide-react";
import { Button } from "@/components/ui/button";

type SidebarProps = {
  property: any;
  onEnquireClick: () => void;
}

export default function Sidebar({ property, onEnquireClick }: SidebarProps) {
  const { price, bedrooms, toilets } = property?.properties || {};

  return (
    <div className="lg:w-1/3 space-y-6">
      {/* Quick Actions Card */}
      <Card className="sticky top-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Interested in this property?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={onEnquireClick}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 text-base"
            size="lg"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Enquire Now
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={() => window.open('tel:+255697080072')}
            >
              <Phone className="w-4 h-4 mr-1" />
              Call
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={() => window.open('mailto:campus-stay@business.com')}
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-medium">Campus Stay Team</h4>
              <p className="text-sm text-gray-500">Property Management</p>
            </div>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm">+255 697 080 072</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm">campus-stay@business.com</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Response time: Usually within 24 hours
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Similar Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Similar Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div key={item} className="flex space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-md flex-shrink-0 flex items-center justify-center">
                  <HomeIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">Student Apartment {item}</h4>
                  <p className="text-sm text-indigo-600 font-medium">
                    TZS {((price ?? 0) * (1 - (item * 0.1))).toLocaleString()}/mo
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Bed className="w-3 h-3 mr-1" />
                    <span className="mr-3">{bedrooms || 0} beds</span>
                    <Bath className="w-3 h-3 mr-1" />
                    <span>{toilets || 0} baths</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="link" className="w-full mt-4 text-indigo-600" size="sm">
            View all similar properties →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
