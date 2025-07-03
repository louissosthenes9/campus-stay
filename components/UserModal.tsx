'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import {User}from '@/types/properties';

// Types for form data
interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  confirm_password?: string;
}

interface StudentProfileFormData {
  university: number | '';
  course: string;
  year_of_study: number | '';
  graduation_year: number | '';
  student_id: string;
  bio: string;
  phone_number: string;
  emergency_contact: string;
  date_of_birth: string;
  gender: '' | 'M' | 'F' | 'O';
  nationality: string;
  special_needs: string;
  profile_picture?: File;
}

// Combined form data
interface CompleteUserFormData extends UserFormData {
  student_profile: StudentProfileFormData;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData, profileData: StudentProfileFormData) => Promise<void>;
  user?: User | null;
  loading?: boolean;
  universities?: Array<{ id: number; name: string }>;
}

// Gender options
const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
];

// Current year for graduation year options
const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 10 }, (_, i) => currentYear + i);
const studyYears = [1, 2, 3, 4, 5, 6];

export function UserModal({ isOpen, onClose, onSubmit, user, loading = false, universities = [] }: UserModalProps) {
  const isEditing = !!user;
  
  // Form state
  const [formData, setFormData] = useState<CompleteUserFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    student_profile: {
      university: '',
      course: '',
      year_of_study: '',
      graduation_year: '',
      student_id: '',
      bio: '',
      phone_number: '',
      emergency_contact: '',
      date_of_birth: '',
      gender: '',
      nationality: '',
      special_needs: '',
    }
  });

  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Initialize form data when user changes
  useEffect(() => {
    if (user && isEditing) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        password: '',
        confirm_password: '',
        student_profile: {
          university: user.student_profile?.university || '',
          course: user.student_profile?.course || '',
          year_of_study: user.student_profile?.year_of_study || '',
          graduation_year: user.student_profile?.graduation_year || '',
          student_id: user.student_profile?.student_id || '',
          bio: user.student_profile?.bio || '',
          phone_number: user.student_profile?.phone_number || '',
          emergency_contact: user.student_profile?.emergency_contact || '',
          date_of_birth: user.student_profile?.date_of_birth || '',
          gender: user.student_profile?.gender || '',
          nationality: user.student_profile?.nationality || '',
          special_needs: user.student_profile?.special_needs || '',
        }
      });
      
      // Set profile picture preview if exists
      if (user.student_profile?.profile_picture) {
        setProfilePicturePreview(user.student_profile.profile_picture);
      }
    } else {
      // Reset form for new user
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        confirm_password: '',
        student_profile: {
          university: '',
          course: '',
          year_of_study: '',
          graduation_year: '',
          student_id: '',
          bio: '',
          phone_number: '',
          emergency_contact: '',
          date_of_birth: '',
          gender: '',
          nationality: '',
          special_needs: '',
        }
      });
      setProfilePicturePreview('');
    }
    setFormErrors({});
  }, [user, isEditing]);

  // Handle input changes
  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle student profile input changes
  const handleProfileInputChange = (field: keyof StudentProfileFormData, value: string | number | File) => {
    setFormData(prev => ({
      ...prev,
      student_profile: {
        ...prev.student_profile,
        [field]: value
      }
    }));
    
    // Clear error for this field
    const errorKey = `student_profile.${field}`;
    if (formErrors[errorKey]) {
      setFormErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Profile picture must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      handleProfileInputChange('profile_picture', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile picture
  const removeProfilePicture = () => {
    setFormData(prev => ({
      ...prev,
      student_profile: {
        ...prev.student_profile,
        profile_picture: undefined
      }
    }));
    setProfilePicturePreview('');
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Basic user validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    // Password validation for new users
    if (!isEditing) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      
      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = 'Passwords do not match';
      }
    }
    
    // Student profile validation
    if (!formData.student_profile.course.trim()) {
      errors['student_profile.course'] = 'Course is required';
    }
    
    if (!formData.student_profile.university) {
      errors['student_profile.university'] = 'University is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      // Prepare user data
      const userData: UserFormData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      };
      
      // Add password for new users
      if (!isEditing && formData.password) {
        userData.password = formData.password;
        userData.confirm_password = formData.confirm_password;
      }
      
      // Prepare student profile data
      const profileData: StudentProfileFormData = {
        ...formData.student_profile,
        university: formData.student_profile.university || 0,
        year_of_study: formData.student_profile.year_of_study || 0,
        graduation_year: formData.student_profile.graduation_year || 0,
      };
      
      await onSubmit(userData, profileData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update user information and student profile details.'
              : 'Create a new student user account with profile information.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">User Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter username"
                  disabled={loading}
                />
                {formErrors.username && (
                  <p className="text-sm text-destructive">{formErrors.username}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  disabled={loading}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                  disabled={loading}
                />
                {formErrors.first_name && (
                  <p className="text-sm text-destructive">{formErrors.first_name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                  disabled={loading}
                />
                {formErrors.last_name && (
                  <p className="text-sm text-destructive">{formErrors.last_name}</p>
                )}
              </div>
            </div>
            
            {/* Password fields for new users */}
            {!isEditing && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter password"
                    disabled={loading}
                  />
                  {formErrors.password && (
                    <p className="text-sm text-destructive">{formErrors.password}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password *</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                    placeholder="Confirm password"
                    disabled={loading}
                  />
                  {formErrors.confirm_password && (
                    <p className="text-sm text-destructive">{formErrors.confirm_password}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Student Profile Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Student Profile</h3>
            
            {/* Profile Picture */}
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                {profilePicturePreview && (
                  <div className="relative">
                    <img
                      src={profilePicturePreview}
                      alt="Profile preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={removeProfilePicture}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    disabled={loading}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Max file size: 5MB. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">University *</Label>
                <Select
                  value={formData.student_profile.university.toString()}
                  onValueChange={(value) => handleProfileInputChange('university', parseInt(value))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.id} value={uni.id.toString()}>
                        {uni.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors['student_profile.university'] && (
                  <p className="text-sm text-destructive">{formErrors['student_profile.university']}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Input
                  id="course"
                  value={formData.student_profile.course}
                  onChange={(e) => handleProfileInputChange('course', e.target.value)}
                  placeholder="Enter course/program"
                  disabled={loading}
                />
                {formErrors['student_profile.course'] && (
                  <p className="text-sm text-destructive">{formErrors['student_profile.course']}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year_of_study">Year of Study</Label>
                <Select
                  value={formData.student_profile.year_of_study.toString()}
                  onValueChange={(value) => handleProfileInputChange('year_of_study', parseInt(value))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {studyYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        Year {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="graduation_year">Graduation Year</Label>
                <Select
                  value={formData.student_profile.graduation_year.toString()}
                  onValueChange={(value) => handleProfileInputChange('graduation_year', parseInt(value))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {graduationYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  id="student_id"
                  value={formData.student_profile.student_id}
                  onChange={(e) => handleProfileInputChange('student_id', e.target.value)}
                  placeholder="Enter student ID"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={formData.student_profile.phone_number}
                  onChange={(e) => handleProfileInputChange('phone_number', e.target.value)}
                  placeholder="Enter phone number"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={formData.student_profile.emergency_contact}
                  onChange={(e) => handleProfileInputChange('emergency_contact', e.target.value)}
                  placeholder="Enter emergency contact"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.student_profile.date_of_birth}
                  onChange={(e) => handleProfileInputChange('date_of_birth', e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.student_profile.gender}
                  onValueChange={(value) => handleProfileInputChange('gender', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.student_profile.nationality}
                  onChange={(e) => handleProfileInputChange('nationality', e.target.value)}
                  placeholder="Enter nationality"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.student_profile.bio}
                onChange={(e) => handleProfileInputChange('bio', e.target.value)}
                placeholder="Enter a brief bio (optional)"
                rows={3}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="special_needs">Special Needs</Label>
              <Textarea
                id="special_needs"
                value={formData.student_profile.special_needs}
                onChange={(e) => handleProfileInputChange('special_needs', e.target.value)}
                placeholder="Enter any special needs or accommodations (optional)"
                rows={2}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}