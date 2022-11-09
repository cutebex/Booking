import React from "react";
import "./Card.css";

const Card = ({ title, description, duration, setService }) => {
  return (
    <label className='card'>
      <input
        onChange={(e) => setService({title, duration})}
        name={"service"}
        className='radio'
        type='radio'
      />

      <span className='plan-details'>
        <span className='plan-type'>{title}</span>

        <span>{description}</span>
      </span>
    </label>
  );
};

export default Card;
