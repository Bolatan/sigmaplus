import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  BarChart2,
  Users,
  Settings,
  Building,
  Share2,
  Lightbulb,
  Combine,
  Wrench,
  CheckSquare
} from 'lucide-react';

const features = [
  { name: 'Dashboard', icon: LayoutDashboard, description: 'Visualize your key metrics at a glance.' },
  { name: 'Surveys', icon: FileText, description: 'Create, manage, and distribute surveys.' },
  { name: 'Projects', icon: Briefcase, description: 'Organize your surveys and reports into projects.' },
  { name: 'Reports', icon: BarChart2, description: 'Generate detailed reports from your survey data.' },
  { name: 'Market Research', icon: Lightbulb, description: 'Conduct market research to gain new insights.' },
  { name: 'Survey Builder', icon: Wrench, description: 'Build powerful surveys with our intuitive builder.' },
  { name: 'Advanced Analytics', icon: BarChart2, description: 'Dive deep into your data with advanced analytics.' },
  { name: 'Collaboration', icon: Share2, description: 'Work with your team on surveys and reports.' },
  { name: 'Multi-Survey Analysis', icon: Combine, description: 'Analyze data from multiple surveys at once.' },
  { name: 'User Management', icon: Users, description: 'Manage users and their roles (for admins).' },
  { name: 'Company Management', icon: Building, description: 'Manage companies and their data (for admins).' },
  { name: 'Conditional Logic', icon: CheckSquare, description: 'Create dynamic surveys that react to user input.' },
];

const Features: React.FC = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to get feedback
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Our platform is packed with features to help you create, distribute, and analyze surveys.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Features;
