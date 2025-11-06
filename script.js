const API_KEY = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locBtn = document.getElementById('locBtn');

const locationElem = document.getElementById('location');
const temperatureElem = document.getElementById('temperature');
const descriptionElem = document.getElementById('description');
const iconElem = document.getElementById('weatherIcon');
const humidityElem = document.getElementById('humidity');
const windElem = document.getElementById('wind');
const pressureElem = document.getElementById('pressure');
const uvElem = document.getElementById('uv');
const sunriseElem = document.getElementById('sunrise');
const sunsetElem = document.getElementById('sunset');
const forecastContainer = document.getElementById('forecastContainer');
const timeElem = document.getElementById('time');

function updateTime() {
  const now = new Date();
  timeElem.textContent = now.toLocaleTimeString();
}
setInterval(updateTime, 1000);
updateTime();

function getWeather(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    .then(response => response.json())
    .then(data => {
      updateWeather(data);
      getForecast(city);
    })
    .catch(() => alert('City not found!'));
}

function getForecast(city) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
    .then(response => response.json())
    .then(data => {
      const daily = {};
      data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!daily[date]) daily[date] = item;
      });

      forecastContainer.innerHTML = '';
      Object.values(daily).slice(0, 5).forEach(day => {
        forecastContainer.innerHTML += `
          <div>
            <p>${new Date(day.dt_txt).toDateString()}</p>
            <p>${day.main.temp.toFixed(1)}°C</p>
            <p>${day.weather[0].main}</p>
          </div>
        `;
      });
    });
}

function updateWeather(data) {
  locationElem.textContent = data.name;
  temperatureElem.textContent = `${data.main.temp} °C`;
  descriptionElem.textContent = data.weather[0].description;
  iconElem.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  humidityElem.textContent = `${data.main.humidity}%`;
  windElem.textContent = `${data.wind.speed} km/h`;
  pressureElem.textContent = `${data.main.pressure} hPa`;
  sunriseElem.textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  sunsetElem.textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString();

  fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${API_KEY}`)
    .then(res => res.json())
    .then(uvData => {
      uvElem.textContent = uvData.value;
    })
    .catch(() => {
      uvElem.textContent = '--';
    });
}

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) getWeather(city);
});

locBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`)
        .then(response => response.json())
        .then(data => {
          updateWeather(data);
          getForecast(data.name);
        });
    });
  }
});
