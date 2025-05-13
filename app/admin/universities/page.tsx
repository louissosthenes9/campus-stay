'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { University } from '@/lib/types';
import { addUniversity } from '@/lib/api';

export default function UniversitiesPage() {
    const [formData, setFormData] = useState<Partial<University>>({});
    const fields = [
        { key: 'name' as keyof University, label: 'Name', required: true },
        { key: 'location' as keyof University, label: 'Location', required: true },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addUniversity({ name: formData.name as string, location: formData.location as string });
        setFormData({});
    };

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-2xl font-semibold text-black">Manage Universities</h1>
            <Card className="bg-white shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-black">Add University</CardTitle>
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