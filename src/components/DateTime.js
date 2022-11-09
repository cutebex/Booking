import React from "react";
import { BiCalendar, BiTime } from "react-icons/bi";
import Datetime from "react-datetime";
import moment from "moment";

const DateTime = ({
  setSelectedDate,
  setBookingDate,
  setSelectedTime,
  provider,
  timings,
  isLoading,
}) => {
  const handleDateChange = (e) => {
    setSelectedDate(`${e.year()}-${e.month() + 1}-${e.date()}`);
    setBookingDate(`${e.month() + 1}/${e.date()}/${e.year()}`);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.innerText);
    Array.from(document.querySelectorAll(".time-box")).forEach((box) => {
      box.classList.remove("active");
    });
    e.target.closest(".time-box").classList.toggle("active");
  };

  var yesterday = moment().subtract(1, "day");
  const valid = (current) => {
    return (
      current.isAfter(yesterday) &&
      (current.day() !== 0) & (current.year() === new Date().getFullYear())
    );
  };

  let initialDate;
  if (moment().day() === 0) {
    initialDate = moment().add(1, "days");
  } else {
    initialDate = moment();
  }

  return (
    <div className='d-flex mt-5'>
      <div style={{ marginRight: "50px" }} className='date w-50'>
        <div className='mb-4'>
          <BiCalendar size={28} /> <span>Date</span>
        </div>
        <div style={!provider ? { opacity: "0.2", pointerEvents: "none" } : {}}>
          <Datetime
            initialValue={initialDate}
            onChange={handleDateChange}
            className='p-4'
            isValidDate={valid}
            input={false}
            timeFormat={false}
          />
        </div>
      </div>
      <div className='time w-50'>
        <div className='mb-4'>
          <BiTime size={28} /> <span>Time</span>
        </div>
        <div
          className={
            isLoading
              ? `loading available-slots d-flex flex-wrap p-4`
              : `available-slots d-flex flex-wrap p-4`
          }
        >
          {!provider ? (
            <span className='text-center p-2 px-5 mt-5'>
              Select a service and date to see available times
            </span>
          ) : (
            <>
              <div id='spinner' className='spinner-border' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
              {timings.map((time, i) => (
                <div
                  key={i}
                  id={time.timer}
                  onClick={handleTimeChange}
                  className='time-box m-2'
                >
                  <span>{time.timer}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateTime;
