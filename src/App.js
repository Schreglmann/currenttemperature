import { fetchWeatherApi } from 'openmeteo';
import './App.css';
const averageTemperatures = {};
const coordinates = {
  latitude: 48.2085,
  longitude: 16.3721,
};
async function getWeather() {
  if ("geolocation" in navigator) {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    coordinates.latitude = position.coords.latitude;
    coordinates.longitude = position.coords.longitude;
  } else {
    console.log("Default Location: Vienna");
  }

  const currentDate = new Date();
  const dateString = `${currentDate.getFullYear()}-${("0" + (currentDate.getMonth()+1)).slice(-2)}-${("0" + (currentDate.getDate())).slice(-2)}`;
  const params = {
    "latitude": coordinates.latitude,
    "longitude": coordinates.longitude,
    "hourly": "temperature_2m",
    "start_date": "2024-01-01",
    "end_date": dateString,
  };
  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);
  const range = (start, stop, step) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  const response = responses[0];

  const hourly = response.hourly();

  const weatherData = {

    hourly: {
      time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
        (t) => new Date((t) * 1000)
      ),
      temperature2m: hourly.variables(0).valuesArray(),
    },
  };

  const temperatures = {};
  for (let i = 0; i < weatherData.hourly.time.length; i++) {
    const day = ("0" + (weatherData.hourly.time[i].getDate())).slice(-2);
    const month = ("0" + (weatherData.hourly.time[i].getMonth() + 1)).slice(-2);

    const date = `${day}.${month}.`;

    if (weatherData.hourly.time[i].getTime() > currentDate.getTime()) continue;
    if (!temperatures[date]) {
      temperatures[date] = [];
    }

    temperatures[date].push(weatherData.hourly.temperature2m[i]);
  }

  console.log(temperatures);

  for (const date in temperatures) {
    const sum = temperatures[date].reduce((a, b) => a + b, 0);
    averageTemperatures[date] = sum / temperatures[date].length;
  }
}

await getWeather();

function App() {
  let listItems = [];
  for (const [key, value] of Object.entries(averageTemperatures).reverse()) {
    let temperaturColorClass;
    switch (true) {
      case value <= -7:
        temperaturColorClass = "m7Minus dateTemp";
        break;
      case value <= -1:
        temperaturColorClass = "m6Tom1 dateTemp";
        break;
      case value <= 5:
        temperaturColorClass = "zeroTo5 dateTemp";
        break;
      case value <= 12:
        temperaturColorClass = "sixTo12 dateTemp";
        break;
      case value <= 19:
        temperaturColorClass = "thirteenTo19 dateTemp";
        break;
      case value <= 28:
        temperaturColorClass = "twentyTo28 dateTemp";
        break;
      default:
        temperaturColorClass = "twentyeightPlus dateTemp";
        break;
    }
    listItems.push(
      <div class={temperaturColorClass}>
        <span class="date">{key}: </span>
        <span class="temp">
          {Math.round(value)}°
        </span>
      </div>
    );
  };


  return (
    <div class="App">
      <header><h1>Durchschnittstemperaturen pro Tag:</h1></header>
      {listItems}
      <div class="coordinates">Aktueller Ort: {coordinates.latitude} {coordinates.longitude}</div>
    </div>
  );
}

export default App;
