import React, { useState } from 'react';

const Annotations = ({ annotations, onAddAnnotation }: { annotations: any[], onAddAnnotation: (text: string, x: number, y: number) => void }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAnnotation(text, Math.random() * 100, Math.random() * 100);
    setText('');
  };

  return (
    <div>
      <h3>Annotations</h3>
      <ul>
        {annotations.map((annotation) => (
          <li key={annotation.id}>{annotation.text}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add an annotation"
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default Annotations;
