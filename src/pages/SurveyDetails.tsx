import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const SurveyDetails = () => {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);

  useEffect(() => {
    // Fetch survey details from the backend
    // This is a placeholder, replace with actual API call
    setSurvey({
      id: surveyId,
      title: `Survey ${surveyId}`,
      questions: [
        { id: 1, text: 'What is your favorite color?', type: 'multiple-choice', options: ['Red', 'Green', 'Blue'] },
        { id: 2, text: 'Rate our service from 1 to 5', type: 'matrix', options: ['1', '2', '3', '4', '5'] },
        { id: 3, text: 'Any additional comments?', type: 'text' },
      ],
    });
  }, [surveyId]);

  if (!survey) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">{survey.title}</h2>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Distribution</h3>
        <div className="flex space-x-4">
          <Link to={`/surveys/${surveyId}/respond`} className="btn-primary">
            Web Link
          </Link>
          <button className="btn-primary">Email</button>
          <button className="btn-primary">Social Media</button>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Results</h3>
        {/* Add real-time results and analytics here */}
        <p>Real-time results and analytics will be displayed here.</p>
      </div>
    </div>
  );
};

export default SurveyDetails;
