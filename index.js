const axios = require("axios");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;

app.use(cors());

app.get("/business/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const { data } = await axios.get(
      `https://storage.googleapis.com/coding-session-rest-api/${id}`
    );
    const { displayed_what, displayed_where, opening_hours } = data;

    keys = Object.keys(opening_hours.days);
    let items = []; // { daysInTheWeek:[],workingHours;[]}

    keys.forEach((item) => {
      let days = [];
      let hours = [];
      if (alreadyContainsDay(items, item)) {
        return;
      }
      keys.forEach((currItem) => {
        if (currItem === item) {
          if (!hours.includes(currItem)) {
            hours.push(currItem);
          }
        }
        if (
          JSON.stringify(opening_hours.days[item]) ===
          JSON.stringify(opening_hours.days[currItem])
        ) {
          days.push(currItem);
          if (!alreadyContainsHours(hours, opening_hours.days[currItem])) {
            hours.push(opening_hours.days[currItem]);
          }
        }
      });

      items.push({ daysInTheWeek: days, workingHours: hours.slice(1) });
    });
    let isOpen = getIsCurrentyOpen(opening_hours);
    let nextOpenClose = getNextOpenClose(isOpen, opening_hours);

    res.json({
      nextOpenClose,
      isOpenNow: isOpen,
      displayed_what,
      displayed_where,
      opening_hours: items,
    });
  } catch (error) {
    res.sendStatus(404);
  }
});

app.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});

const getNextOpenClose = (isOpen, opening_hours) => {
  if (!isOpen) return "";

  const currentHour = new Date().getHours();
  if (currentHour < 10) {
    currentHour = `0${currentHour}`;
  }
  const currentMinute = new Date().getMinutes();
  if (currentMinute < 10) {
    currentMinute = `0${currentMinute}`;
  }
  const currentTime = `${currentHour}:${currentMinute}`;
  const todaysDay = new Date().getDay();
  const dayString = daysInAWeek[todaysDay];

  const dayArray = opening_hours.days[dayString];

  const day = dayArray.find((timeSpan) => timeSpan.start <= currentTime);
  return `${dayString} in ${day.end}`;
};

const getIsCurrentyOpen = (opening_hours) => {
  let isOpen = false;
  const mockDate = new Date();
  mockDate.setHours(11, 40);
  const currentHour = mockDate.getHours();
  if (currentHour < 10) {
    currentHour = `0${currentHour}`;
  }
  const currentMinute = mockDate.getMinutes();
  if (currentMinute < 10) {
    currentMinute = `0${currentMinute}`;
  }
  const currentTime = `${currentHour}:${currentMinute}`;
  const todaysDay = mockDate.getDay();
  const dayString = daysInAWeek[todaysDay];
  const dayArray = opening_hours.days[dayString];

  // dayArray.forEach((timeSpan) => {
  //   if (isOpen) return;
  //   if (currentTime >= timeSpan.start && currentTime < timeSpan.end) {
  //     isOpen = true;
  //     return;
  //   }
  // });

  isOpen = dayArray.some(
    (timeSpan) => currentTime >= timeSpan.start && currentTime < timeSpan.end
  );

  return isOpen;
};

const alreadyContainsDay = (array, item) => {
  let contains = false;
  for (let i = 0; i < array.length; i++) {
    const subArray = array[i];

    if (subArray.daysInTheWeek.includes(item)) {
      contains = true;
      break;
    }
  }
  return contains;
};

const alreadyContainsHours = (array, item) => {
  let contains = false;
  for (let i = 0; i < array.length; i++) {
    const subArray = array[i];

    if (JSON.stringify(subArray) === JSON.stringify(item)) {
      contains = true;
      break;
    }
  }
  return contains;
};

const daysInAWeek = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
