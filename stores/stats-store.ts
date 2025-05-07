import { create } from 'zustand';

interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'Available' | 'Booked';
  price: string;
}

interface Enquiry {
  id: string;
  student: string;
  property: string;
  date: string;
  status: 'Pending' | 'Responded' | 'Completed';
}

interface StatsState {
  totalProperties: number;
  newProperties: number;
  availableProperties: number;
  availablePercentage: number;
  newEnquiries: number;
  enquiryIncreasePercentage: number;
  totalStudents: number;
  activeStudentPercentage: number;
  recentProperties: Property[];
  recentEnquiries: Enquiry[];
  fetchStats: () => void;
}

// Mock data for demonstration purposes
export const useStatsStore = create<StatsState>((set) => ({
  totalProperties: 0,
  newProperties: 0,
  availableProperties: 0,
  availablePercentage: 0,
  newEnquiries: 0,
  enquiryIncreasePercentage: 0,
  totalStudents: 0,
  activeStudentPercentage: 0,
  recentProperties: [],
  recentEnquiries: [],
  fetchStats: async () => {
    // In a real application, this would be an API call
    // For demo purposes, using mock data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set({
      totalProperties: 128,
      newProperties: 8,
      availableProperties: 43,
      availablePercentage: 34,
      newEnquiries: 24,
      enquiryIncreasePercentage: 12,
      totalStudents: 512,
      activeStudentPercentage: 78,
      recentProperties: [
        {
          id: '1',
          name: 'Sunrise Apartment',
          type: 'Apartment',
          location: 'Near Uni of Dar es Salaam',
          status: 'Available',
          price: 'TZS 300,000/mo'
        },
        {
          id: '2',
          name: 'Green Villa',
          type: 'House',
          location: 'Mikocheni',
          status: 'Booked',
          price: 'TZS 450,000/mo'
        },
        {
          id: '3',
          name: 'Student Lodge',
          type: 'Hostel',
          location: 'UDSM Campus',
          status: 'Available',
          price: 'TZS 150,000/mo'
        },
        {
          id: '4',
          name: 'Elite Residence',
          type: 'Apartment',
          location: 'Msasani',
          status: 'Available',
          price: 'TZS 380,000/mo'
        },
        {
          id: '5',
          name: 'Campus View',
          type: 'Hostel',
          location: 'Near Ardhi University',
          status: 'Booked',
          price: 'TZS 200,000/mo'
        },
      ],
      recentEnquiries: [
        {
          id: '1',
          student: 'John Doe',
          property: 'Sunrise Apartment',
          date: '2023-07-15',
          status: 'Responded'
        },
        {
          id: '2',
          student: 'Sarah Johnson',
          property: 'Student Lodge',
          date: '2023-07-14',
          status: 'Pending'
        },
        {
          id: '3',
          student: 'Michael Brown',
          property: 'Green Villa',
          date: '2023-07-10',
          status: 'Completed'
        },
        {
          id: '4',
          student: 'Emily Davis',
          property: 'Elite Residence',
          date: '2023-07-08',
          status: 'Pending'
        },
        {
          id: '5',
          student: 'Daniel Wilson',
          property: 'Campus View',
          date: '2023-07-05',
          status: 'Responded'
        },
      ],
    });
  }
}));
