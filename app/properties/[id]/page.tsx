import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PropertyDetails from '@/components/property/PropertyDetails';
import { getPropertyById } from '@/lib/api/properties';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await getPropertyById(params.id);
  
  if (!property) {
    return {
      title: 'Property Not Found',
    };
  }

  return {
    title: `${property.properties.title} | CampusStay`,
    description: property.properties.description,
    openGraph: {
      title: property.properties.title,
      description: property.properties.description,
      images: property.images.length > 0 ? [property.images[0]] : [],
    },
  };
}

export default async function PropertyPage({ params }: Props) {
  const property = await getPropertyById(params.id);

  if (!property) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PropertyDetails property={property} />
    </div>
  );
}
