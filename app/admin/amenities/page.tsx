'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Amenity } from '@/lib/types';
import { addAmenity } from '@/lib/api';

export default function AmenitiesPage() {
    const [formData, setFormData] = useState<Partial<Amenity>>({});
    const fields = [
        { key: 'name' as keyof Amenity, label: 'Name', required: true },
        { key: 'description' as keyof Amenity, label: 'Description (Optional)' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addAmenity({ name: formData.name as string, description: formData.description as string });
        setFormData({});
    };

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-2xl font-semibold text-black">Manage Amenities</h1>
            <Card className="bg-white shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-black">Add Amenity</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {fields.map((field) => (
                            <div key={field.key as string}>
                                <label className="block text-sm font-medium text-black">{field.label}</label>
                                <input
                                    type="text"
                                    value={(formData[field.key] as string) || ''}
                                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                    className="mt-2 block w-full border border-gray-300 rounded-lg p-2"
                                    required={field.required}
                                />
                            </div>
                        ))}
                        <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">Add</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}