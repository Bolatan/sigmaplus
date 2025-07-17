import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">Product</h3>
            <ul>
              <li><a href="#" className="hover:underline">Overview</a></li>
              <li><a href="#" className="hover:underline">Surveys</a></li>
              <li><a href="#" className="hover:underline">Online Forms</a></li>
              <li><a href="#" className="hover:underline">Market Research</a></li>
              <li><a href="#" className="hover:underline">Integrations</a></li>
              <li><a href="#" className="hover:underline">AI</a></li>
              <li><a href="#" className="hover:underline">Enterprise</a></li>
              <li><a href="#" className="hover:underline">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Popular Templates</h3>
            <ul>
              <li><a href="#" className="hover:underline">Customer Satisfaction</a></li>
              <li><a href="#" className="hover:underline">Employee Engagement</a></li>
              <li><a href="#" className="hover:underline">Event Feedback</a></li>
              <li><a href="#" className="hover:underline">Product Testing</a></li>
              <li><a href="#" className="hover:underline">Net Promoter Score (NPS)</a></li>
              <li><a href="#" className="hover:underline">Course Evaluation</a></li>
              <li><a href="#" className="hover:underline">All Templates</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul>
              <li><a href="#" className="hover:underline">Customers</a></li>
              <li><a href="#" className="hover:underline">Blog</a></li>
              <li><a href="#" className="hover:underline">Resource Center</a></li>
              <li><a href="#" className="hover:underline">Trust Center</a></li>
              <li><a href="#" className="hover:underline">Support</a></li>
              <li><a href="#" className="hover:underline">Contact Sales</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Learn</h3>
            <ul>
              <li><a href="#" className="hover:underline">How to Create Surveys</a></li>
              <li><a href="#" className="hover:underline">NPS Calculator</a></li>
              <li><a href="#" className="hover:underline">Margin of Error Calculator</a></li>
              <li><a href="#" className="hover:underline">Sample Size Calculator</a></li>
              <li><a href="#" className="hover:underline">AB Test Significance Calculator</a></li>
              <li><a href="#" className="hover:underline">Likert Scale</a></li>
              <li><a href="#" className="hover:underline">Online Quizzes</a></li>
              <li><a href="#" className="hover:underline">Free Survey Templates</a></li>
              <li><a href="#" className="hover:underline">Survey Best Practices</a></li>
              <li><a href="#" className="hover:underline">SignaPlus vs. Google Forms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 flex justify-between items-center">
          <p>&copy; {new Date().getFullYear()} SignaPlus</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline">Privacy notice</a>
            <a href="#" className="hover:underline">Terms of use</a>
            <a href="#" className="hover:underline">Cookies notice</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
