'use client';

type SidebarProps = {
    price?:number,
    bedrooms?: number,
    toilets?: number
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Phone, Mail, Calendar, Bed, Bath } from "lucide-react"

export default function Sidebar({
    price,
    bedrooms,
    toilets
    }: SidebarProps 
) {
    return (
    
     < div className = "lg:w-1/3 space-y-6" >
            {/* Contact Card */ }
    < Card >
      <CardHeader>
        <CardTitle className="text-lg">Contact Agent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h4 className="font-medium">Property Manager</h4>
            <p className="text-sm text-gray-500">Campus Stay Team</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full" size="lg">
            <Phone className="w-4 h-4 mr-2" />
            Call Now
          </Button>
          <Button variant="outline" className="w-full" size="lg">
            <Mail className="w-4 h-4 mr-2" />
            Send Message
          </Button>
          <Button variant="outline" className="w-full" size="lg">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Viewing
          </Button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Response time: Usually within 24 hours
          </p>
        </div>
      </CardContent>
    </Card >

        {/* Similar Properties */ }
    < Card >
      <CardHeader>
        <CardTitle className="text-lg">Similar Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="flex space-x-4 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-sm">Similar Property {item}</h4>
                <p className="text-sm text-gray-500">TZS {((price ?? 0) * (1 - (item * 0.1))).toLocaleString()}/mo</p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Bed className="w-3 h-3 mr-1" />
                  <span className="mr-3">{bedrooms || 0} bds</span>
                  <Bath className="w-3 h-3 mr-1" />
                  <span>{toilets || 0} ba</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="link" className="w-full mt-4" size="sm">
          View all similar properties
        </Button>
      </CardContent>
    </Card >
  </div >
  )
}
