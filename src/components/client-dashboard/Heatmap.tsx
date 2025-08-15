import React from 'react';

const Heatmap = ({ data }: { data: any }) => {
  // This is a placeholder component.
  // In a real application, you would render a heatmap here.
  return (
    <div>
      <h3>Heatmap</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Heatmap;
