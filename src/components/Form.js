import React, { useState, useEffect } from "react";
import { BsPerson } from "react-icons/bs";
import { RiContactsBook2Line } from "react-icons/ri";
import moment from "moment";
import axios from "axios";
import Select from "react-select";
import DateTime from "./DateTime";
import { Config } from "../config";

const Form = ({ service, timings, options, setTiming }) => {
  const [provider, setProvider] = useState();
  const [providerName, setProviderName] = useState();
  const [bloodDrawService, setBloodDrawService] = useState();
  const [selectedTime, setSelectedTime] = useState();
  const [selectedDate, setSelectedDate] = useState();
  const [bookingDate, setBookingDate] = useState();
  const [appointments, setAppointments] = useState();
  const [subject, setSubject] = useState();
  const [email, setEmail] = useState();
  const [timeDifference, setTimeDifference] = useState();
  const [description, setDescription] = useState("");
  const [modalMessage, setModalMessage] = useState({ title: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);

  useEffect(() => {
    setProvider(null);
    setProviderName(null);
    if (service.title && document.querySelector(".rdtToday")) {
      document.querySelector(".rdtToday").click();
    }
  }, [service]);

  useEffect(() => {
    if (provider && document.querySelector(".rdtActive")) {
      setIsLoading(true);
      const todayDateEl = document.querySelector(".rdtActive");
      todayDateEl.click();
      let today = new Date();
      let dd = String(today.getDate()).padStart(2, "0");
      let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
      let yyyy = today.getFullYear();

      today = +yyyy + "/" + mm + "/" + dd;
      const getAppointments = async () => {
        let res = await axios({
          method: "GET",
          url: `${Config.API_URL}api/CRMPlatform/Sales/Appointment/V1/GetAppointments?scheduleDate=${today}&physicianId=${provider}`,
          headers: {
            "x-user-token": Config.USER_TOKEN,
            "Access-Control-Allow-Credentials": true,
          },
        });
        setAppointments(res.data);
      };

      const getTimings = async () => {
        let res = await axios({
          method: "GET",
          url: `${Config.API_URL}api/CRMPlatform/Sales/Appointment/V1/GetTimersByService?providerId=${provider}&serviceName=${service.title}`,
          headers: {
            "x-user-token": Config.USER_TOKEN,
            "Access-Control-Allow-Credentials": true,
          },
        });
        setTiming(res.data);
        setIsLoading(false);
      };

      getAppointments();
      getTimings();
    }
  }, [provider, setTiming]);

  useEffect(() => {
    let timeBoxes = Array.from(document.querySelectorAll(".time-box"));
    if (selectedDate && appointments && provider) {
      timeBoxes.forEach((box) => box.classList.remove("disabled", "active"));

      // if (service === "New Consultation") {
      //   document.querySelector(".available-slots").lastChild.classList.add("disabled");
      // } else if (service === "Blood Draw") {
      //   if (timeBoxes.length < 1) {
      //     setTimeout(() => {
      //       timeBoxes = Array.from(document.querySelectorAll(".time-box"));
      //       timeBoxes
      //         .splice(4, timeBoxes.length)
      //         .forEach((box) => box.classList.add("disabled"));
      //     }, 1000);
      //   }
      //   timeBoxes
      //     .splice(4, timeBoxes.length)
      //     .forEach((box) => box.classList.add("disabled"));
      // }
      // if (
      //   bloodDrawService &&
      //   (service === "New Consultation" ||
      //     service === "Follow Up" ||
      //     service === "Pellets")
      // ) {
      //   if (timeBoxes.length < 1) {
      //     setTimeout(() => {
      //       timeBoxes = Array.from(document.querySelectorAll(".time-box"));
      //       timeBoxes.splice(0, 4).forEach((box) => {
      //         box.classList.add("disabled");
      //       });
      //     }, 1000);
      //   }
      // }

      appointments.forEach((appointment) => {
        let temp = appointment.scheduledstart.split("/");
        const month = parseInt(temp[0]);
        const date = parseInt(temp[1]);

        const selectedDateSplit = selectedDate.split("-");
        if (
          month === parseInt(selectedDateSplit[1]) &&
          date === parseInt(selectedDateSplit[2])
        ) {
          if (appointment.isAllDay) {
            timeBoxes.forEach((box) => {
              box.classList.add("disabled");
            });
            return;
          }
          const originalStartTime = moment(appointment.startTime, "hh:mm A")
            .subtract(parseInt(timeDifference) + service.duration/60, "hours")
            .format("hh:mm A");
          
          const originalEndTime = moment(appointment.endTime, "hh:mm A")
            .subtract(parseInt(timeDifference), "hours")
            .format("hh:mm A");

          const beforeTime = moment(originalStartTime, "hh:mm A")
          const afterTime = moment(originalEndTime, "hh:mm A");

          timeBoxes.forEach((box) => {
            const time = box.getAttribute("id");
            if(moment(time, "hh:mm A").isBetween(beforeTime, afterTime)) {
              const element = document.getElementById(time);
              element.classList.add("disabled");
            }
          });
        }
      });
    }
  }, [
    selectedDate,
    appointments,
    provider,
    service,
    timeDifference,
    bloodDrawService,
  ]);

  //book appointment
  const bookAppointment = async (e) => {
    e.preventDefault();
    setBookLoading(true);
    const UTCTime = moment(selectedTime, "hh:mm A")
      .add(timeDifference, "hours")
      .format("hh:mm A");
    let startTime = `${bookingDate} ${UTCTime}`;

    const endTime = `${bookingDate} ${moment(UTCTime, "hh:mm A")
      .add(service.duration, "minutes")
      .format("hh:mm A")}`;

    let userId = window.parent.Xrm?.Page?.context?.getUserId()
      ? window.parent.Xrm.Page.context.getUserId()
      : "bcbfcbe5-5b6b-e911-a9c1-000d3a3abdb6";

    const patientName = `${subject} - ${service.title}`;

    try {
      let res = await axios({
        method: "POST",
        url: `${Config.API_URL}api/CRMPlatform/Sales/Appointment/V1/PostAppointments`,
        headers: {
          "x-user-token": Config.USER_TOKEN,
          "Access-Control-Allow-Credentials": true,
          "Content-Type": "application/json",
        },
        data: [
          {
            startTime: startTime,
            endTime: endTime,
            physician: provider,
            note: description,
            subject: patientName,
            createdBy: userId,
            patientEmail: email,
          },
        ],
      });

      if (res.data.SuccessResponse) {
        setModalMessage({
          title: "Successfully Booked Appointment",
          message: `Your appointment has been successfully booked @ ${selectedTime}`,
        });
        document.querySelector(".modal-btn").click();
      } else {
        setModalMessage({
          title: "Booking Appointment Failed",
          message: res.data.AppointmentResponse,
        });
        document.querySelector(".modal-btn").click();
      }
    } catch (error) {
      setModalMessage({
        title: "Booking Appointment Failed",
        message: "Internal server error. Please try again later",
      });
      document.querySelector(".modal-btn").click();
    }
  };

  return (
    <form className='mt-5'>
      <label htmlFor='inputEmail4' className='form-label mb-3'>
        <BsPerson size={28} /> SELECT PROVIDER *
      </label>
      <Select
        onChange={(e) => {
          setProviderName(e.value);
          setProvider(e.userId);
          setTimeDifference(e.timeToSubtract);
          setBloodDrawService(e.bloodDraw);
        }}
        placeholder='Anyone'
        name='form-field-name'
        isDisabled={!service.title}
        value={{ label: providerName ? providerName : "Anyone" }}
        options={options}
      />

      <DateTime
        isLoading={isLoading}
        setSelectedDate={setSelectedDate}
        setBookingDate={setBookingDate}
        setSelectedTime={setSelectedTime}
        provider={provider}
        timings={timings}
      />

      <div className='details mt-3'>
        <div className='mb-4'>
          <RiContactsBook2Line size={28} />
          <span>APPOINTMENT DETAILS</span>
        </div>
        <div className='row'>
          <div className='col-lg-6'>
            <div className='form-group my-3'>
              <label className='mb-2' htmlFor='subject'>
                Patient Name *
              </label>
              <input
                required
                name={"subject"}
                onChange={(e) => setSubject(e.target.value)}
                type='text'
                className='form-control'
                id='subject'
                placeholder='Patient Name *'
              />
            </div>
            <div className='form-group my-3'>
              <label className='mb-2' htmlFor='email'>
                Patient Email *
              </label>
              <input
                name={"email"}
                type='email'
                onChange={(e) => setEmail(e.target.value)}
                className='form-control'
                id='email'
                placeholder='Patient Email *'
              />
            </div>
          </div>
          <div className='col-lg-6'>
            <div className='form-group my-3'>
              <label className='mb-2' htmlFor='notes'>
                Description (optional)
              </label>
              <textarea
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Add any special requests'
                className='form-control'
                id='notes'
                rows='3'
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      <div className='wrapper'>
        <button
          className='mb-5 text-center submit-btn btn btn-secondary'
          type='submit'
          onClick={bookAppointment}
          disabled={!selectedTime || !subject || !email || bookLoading}
        >
          Appointment Book
        </button>
        <button
          onClick={(e) => e.preventDefault()}
          className='d-none modal-btn'
          data-bs-toggle='modal'
          data-bs-target='#exampleModal'
        ></button>
        <div
          className='modal fade'
          id='exampleModal'
          tabIndex='-1'
          aria-labelledby='exampleModalLabel'
          aria-hidden='true'
          data-bs-keyboard='false'
          data-bs-backdrop='static'
        >
          <div style={{ maxWidth: "35%" }} className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title' id='exampleModalLabel'>
                  {modalMessage.title}
                </h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={(e) => {
                    window.location.reload(false);
                  }}
                  aria-label='Close'
                ></button>
              </div>
              <div className='modal-body'>
                <p>{modalMessage.message}</p>
              </div>
              <div className='modal-footer'>
                <button
                  onClick={(e) => {
                    window.location.reload(false);
                  }}
                  type='button'
                  className='btn btn-primary'
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Form;
