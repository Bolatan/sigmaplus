export function getChartData(responses, survey, questionName) {
  const question = survey.questions.find(q => q.name === questionName);
  if (!question) return null;

  const labels = question.options;
  const data = labels.map(option => {
    return responses.filter(response => {
      const answer = response.responseData[question.id];
      return answer && answer.includes(option);
    }).length;
  });

  return {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: question.text,
        data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };
}
