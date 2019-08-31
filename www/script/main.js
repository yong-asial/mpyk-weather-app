const API_KEY = 'd603f9613eee5ac711056939e92168b6';
const CORS_ANYWHERE = 'https://cors-anywhere.herokuapp.com';
const baseUrl = 'https://api.darksky.net/forecast';

function convertFahrenheitToCelsius(fahrenheit) {
    let celsius = (fahrenheit - 32) * 5/9;
    return Math.round(celsius * 100) / 100
}

function getInfo(weatherInfo, showSummary=true) {
    let info = '';
    let fahrenheitTemperature = weatherInfo.temperature;
    if (showSummary) info += `Summary: ${weatherInfo.summary} <br/>`;
    info += `Temperature: ${convertFahrenheitToCelsius(fahrenheitTemperature)}°C <br/>`;
    info += `Humidity: ${Math.ceil(weatherInfo.humidity * 100)}% <br/>`;
    info += `UV Index: ${weatherInfo.uvIndex} <br/>`;
    return info;
}

function getInfoDaily(weatherInfo, showSummary=true) {
    let info = '';
    let fahrenheitTemperatureMin = weatherInfo.temperatureMin;
    let fahrenheitTemperatureMax = weatherInfo.temperatureMax;
    if (showSummary) info += `Summary: ${weatherInfo.summary} <br/>`;
    info += `Temperature: ${convertFahrenheitToCelsius(fahrenheitTemperatureMin)}°C - ${convertFahrenheitToCelsius(fahrenheitTemperatureMax)}°C <br/>`;
    info += `Humidity: ${Math.ceil(weatherInfo.humidity * 100)}% <br/>`;
    info += `UV Index: ${weatherInfo.uvIndex} <br/>`;
    let date = convertEpochToDate(weatherInfo.sunriseTime);
    info += `Sunrise: ${date.getHours()}:${date.getMinutes()} <br/>`;
    date = convertEpochToDate(weatherInfo.sunsetTime);
    info += `Sunset: ${date.getHours()}:${date.getMinutes()}  <br/>`;
    return info;
}

function convertEpochToDate(epoch) {
    let utcSeconds = epoch;
    let d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(utcSeconds);
    return d;
}

async function fetchWeather(latitude, longitude) {
    try {
        const url = `${CORS_ANYWHERE}/${baseUrl}/${API_KEY}/${latitude},${longitude}`;
        let content = '';
        const result = await fetch(url, {mode: 'cors'}).then(response => response.json());
        if (result) {
            // currently
            content += '<h2>Current Location</h2>';
            content += `Latitude/Longitude: ${latitude}/${longitude} <br/>`;
            content += '<h2>Current Weather</h2>';
            let date = convertEpochToDate(result.currently.time);
            content += `Time: ${date.getHours()}:${date.getMinutes()} <br/>`;
            content += getInfo(result.currently);
            // hourly
            content += '<h2>Hourly</h2>';
            content += `Summary: ${result.hourly.summary} <br/>`;
            for (let i=0; i<result.hourly.data.length; i++) {
                let hourlyData = result.hourly.data[i];
                let date = convertEpochToDate(hourlyData.time);
                content += `Time: ${date.getHours()} <br/>`;
                content += getInfo(hourlyData, false);
                content += '<br/>';
            }
            // daily
            content += '<h2>Daily</h2>';
            content += `Summary: ${result.daily.summary} <br/>`;
            content += '<br/>';
            for (let i=0; i<result.daily.data.length; i++) {
                let dailyData = result.daily.data[i];
                let date = convertEpochToDate(dailyData.time);
                content += `Date: ${date.getDate()} <br/>`;
                content += getInfoDaily(dailyData);
                content += '<br/>';
            }
        } else {
            content = 'Could not download weather data';
        }
        document.getElementById('weather').innerHTML = content;
    } catch (e) {
        const errorMessage = 'Could not fetch weather';
        console.error(errorMessage,e);
        document.getElementById('weather').innerHTML = errorMessage;
    }
}

async function getLocation() {
    const DUMMYLOCATION = [35.726284, 139.797290];
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                resolve([position.coords.latitude, position.coords.longitude]);
            }, function(error) {
                console.error('Could not get current location.', error);
                console.log('Use Dummy Location', DUMMYLOCATION);
                resolve(DUMMYLOCATION);
            });
        } else { 
            resolve(DUMMYLOCATION);
        }
    });
}

function wait(flag) {
    let status = flag ? 'wait' : 'default';
    document.body.style.cursor = status;
}

async function main() {
    wait(true);
    // get current location
    let coord = await getLocation();
    // fetch weather
    let latitude = coord[0];
    let longitude = coord[1];
    await fetchWeather(latitude, longitude);
    wait(false);
}

main();