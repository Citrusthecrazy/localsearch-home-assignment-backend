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
          console.log();
          if (!alreadyContainsHours(hours, opening_hours.days[currItem])) {
            hours.push(opening_hours.days[currItem]);
          }
        }
      });

      items.push({ daysInTheWeek: days, workingHours: hours.slice(1) });
    });

    res.json({
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
