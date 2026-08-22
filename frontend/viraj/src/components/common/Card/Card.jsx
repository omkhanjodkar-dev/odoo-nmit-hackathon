import React from 'react';
import './Card.css';

export const Card = ({
  children,
  header,
  footer,
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`card ${hoverable ? 'card-hoverable' : ''} ${clickable ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
