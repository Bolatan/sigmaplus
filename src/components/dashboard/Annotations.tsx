import React, { useState } from 'react';

interface Annotation {
  id: string;
  text: string;
  x: number;
  y: number;
}

interface AnnotationsProps {
  annotations: Annotation[];
  onAddAnnotation: (text: string, x: number, y: number) => void;
}

const Annotations: React.FC<AnnotationsProps> = ({ annotations, onAddAnnotation }) => {
  const [text, setText] = useState('');

  const handleAddAnnotation = (e: React.MouseEvent<HTMLDivElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;
    onAddAnnotation(text, offsetX, offsetY);
    setText('');
  };

  return (
    <div className="relative" onClick={handleAddAnnotation}>
      {annotations.map((annotation) => (
        <div
          key={annotation.id}
          className="absolute p-2 bg-yellow-200 rounded-lg shadow-md"
          style={{ left: annotation.x, top: annotation.y }}
        >
          {annotation.text}
        </div>
      ))}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add annotation"
        className="absolute bottom-0 left-0 w-full p-2 border-t border-gray-300"
      />
    </div>
  );
};

export default Annotations;
