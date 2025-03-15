
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const parks = [
  {
    id: 1,
    name: 'Evergreen National Park',
    description: 'Ancient forests and stunning mountain vistas with diverse wildlife.',
    image: '/lovable-uploads/3cda8714-88f1-4e5a-b524-bca279f23ef1.png',
  },
  {
    id: 2,
    name: 'Azure Lakes Reserve',
    description: 'Crystal clear waters surrounded by pristine wilderness and rare bird species.',
    image: '/lovable-uploads/07b6e0a0-cf59-4458-b3ec-4e14ef579d3e.png',
  },
  {
    id: 3,
    name: 'Granite Mountain Park',
    description: 'Dramatic rock formations and high-altitude trails with panoramic views.',
    image: '/lovable-uploads/8abceb12-cf1f-4d98-916f-551a0bad8130.png',
  },
];

const ParkHighlights = () => {
  return (
    <div className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-conservation-900 sm:text-4xl">
            Explore Our Parks
          </h2>
          <p className="mt-6 text-lg leading-8 text-conservation-700">
            Discover the natural beauty and biodiversity of our conservation areas.
          </p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 sm:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {parks.map((park) => (
            <div key={park.id} className="overflow-hidden rounded-lg shadow-lg border border-conservation-100 hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={park.image}
                  alt={park.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-conservation-900">{park.name}</h3>
                <p className="mt-2 text-conservation-600">{park.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <Button asChild variant="outline" className="text-conservation-700 border-conservation-300 hover:bg-conservation-50">
                    <Link to={`/parks/${park.id}`}>
                      Learn More
                    </Link>
                  </Button>
                  <Button asChild variant="default" className="bg-conservation-600 hover:bg-conservation-700">
                    <Link to={`/book-tour?park=${park.id}`}>
                      Book Tour
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParkHighlights;
