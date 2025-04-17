
import React from 'react';

import { useTheme } from '@mui/material/styles';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import RunItem from './RunItem';


const SortableRunItem = ({ run, id, onEditClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  
  const theme = useTheme();
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <RunItem run={run} onEditClick={onEditClick} />
    </div>
  );
};

export default SortableRunItem;