import { useState, useEffect } from "react";
import "./App.css";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { Config, Services } from "./config";
import Card from "./components/Card";
import Form from "./components/Form";
import axios from "axios";

function App() {
  const [timing, setTiming] = useState([]);
  const [service, setService] = useState({
   title: "",
   duration: 0
  });
  const [options, setOptions] = useState();

  useEffect(() => {
    const getProviders = async () => {
      let res = await axios({
        method: "GET",
        url: `${Config.API_URL}api/CRMPlatform/Sales/Appointment/V1/GetProviders?teamName=Doctor`,
        headers: {
          "x-user-token": Config.USER_TOKEN,
          "Access-Control-Allow-Credentials": true,
        },
      });
      let optionsArr = [];
      if (service.title === "Blood Draw") {
        res.data.forEach((option) => {
          if (JSON.parse(option.bloodDraw)) {
            optionsArr.push({
              value: option.showFullName,
              label: option.showFullName,
              userId: option.systemuserid,
              timeToSubtract: option.utcTimeDifference,
              bloodDraw: JSON.parse(option.bloodDraw),
            });
          }
        });
      } else if(service.title === "Get Fat Loss") {
        res.data.forEach((option) => {
          if (JSON.parse(option.getFatLoss)) {
            optionsArr.push({
              value: option.showFullName,
              label: option.showFullName,
              userId: option.systemuserid,
              timeToSubtract: option.utcTimeDifference,
              bloodDraw: JSON.parse(option.bloodDraw),
            });
          }
        });
      } else if (service.title === "Pellets") {
        res.data.forEach((option) => {
          if (JSON.parse(option.pellet)) {
            optionsArr.push({
              value: option.showFullName,
              label: option.showFullName,
              userId: option.systemuserid,
              timeToSubtract: option.utcTimeDifference,
              bloodDraw: JSON.parse(option.bloodDraw),
            });
          }
        });
      } else {
        res.data.forEach((option) => {
          optionsArr.push({
            value: option.showFullName,
            label: option.showFullName,
            userId: option.systemuserid,
            timeToSubtract: option.utcTimeDifference,
            bloodDraw: JSON.parse(option.bloodDraw),
          });
        });
      }

      setOptions(optionsArr);
    };

    getProviders();
  }, [service]);

  return (
    <div className='container'>
      <div className='main-start pt-5'>
        <h1 className='heading-primary text-center'>Provider Appointment</h1>
        <div className='select-service'>
          <AiOutlineCheckCircle /> <span>SELECT A SERVICE</span>
          <div className='grid mt-4'>
            {
              Services.map((service, index) => {
                return <Card 
                  key={index}
                  setService={setService} 
                  title={service.title}
                  duration={service.duration}
                  description={`${service.duration} minutes`}
                />
              })
            }
          </div>
          <div className='d-flex justify-content-center message'>
            <span className='text-center p-2 px-5 mt-5'>
              {service
                ? `Booking for ${service.title}`
                : "Select a service to see available dates and times"}
            </span>
          </div>
          <Form
            setTiming={setTiming}
            options={options}
            timings={timing}
            service={service}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
