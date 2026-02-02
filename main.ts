/*
Source: ChatGPT / StackOverflow
---

const HSLToRGB = (h, s, l) => {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
};

// Example usage:
console.log(HSLToRGB(120, 100, 50)); // Outputs: [0, 255, 0]

*/

// hue saturation lightness
type HSL = {
    h: number;
    s: number;
    l: number;
};

const HSLToRGB = ({ h, s, l }: HSL) => {
    s = s / 100;
    l = l / 100;

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    return [
        Math.floor(255 * f(0)),
        Math.floor(255 * f(8)),
        Math.floor(255 * f(4)),
    ];
};

console.log(HSLToRGB({ h: 120, s: 100, l: 50 }));

const api_key = Deno.env.get("OPENWEATHER_API");
const lat = Deno.env.get("LAT");
const lon = Deno.env.get("LON");

console.debug("USING API -> " + api_key);
console.log("USING LAT -> " + lat);
console.log("USING LAT -> " + lon);


let colors_map = "";
const poll_weather = async () => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;
    const response = await fetch(url);
    const data_json = await response.json();
    
    console.log(data_json);
    console.log(new Date().getHours());
    
    const weather = data_json?.weather[0];
    type WeatherColors = typeof data_json.weather;
    
    // reminder to self, change this later
    const weather_colors: WeatherColors = {
        Clouds: {
            description: {
                ["overcast clouds"]: { h: 120, s: 50, l: 50 },
            },
        },
        Clear: {
            description: {
                ["clear sky"]: { h: 120, s: 50, l: 50 },
            },
        },
    };
    
    const MAX_HOUR = 23;
    const curr_hour = new Date().getHours();
    const lightness = (curr_hour / MAX_HOUR) * 100;
    console.log(curr_hour, lightness);
    
    const merged_colors = {
        ...weather_colors[weather?.main].description[weather?.description],
        l: Math.floor(lightness),
    };
    const yeelight_colors = HSLToRGB(merged_colors);
    const yeelight_colors_str = JSON.stringify(yeelight_colors);
    // console.log(HSLToRGB(merged_colors));
    if (colors_map !== yeelight_colors_str) {
        colors_map = yeelight_colors_str;

        // make UDP call to yeelights
    }
}

const TIMER = 3600 * 1000;
setInterval(poll_weather, TIMER);


/*
EXAMPLE OUTPUT:

{
  coord: { lon: 1, lat: 1 },
  weather: [
    {
      id: 804,
      main: "Clouds",
      description: "overcast clouds",
      icon: "04n"
    }
  ],
  base: "stations",
  main: {
    temp: 300.43,
    feels_like: 303.2,
    temp_min: 300.43,
    temp_max: 300.43,
    pressure: 1012,
    humidity: 77,
    sea_level: 1012,
    grnd_level: 1012
  },
  visibility: 10000,
  wind: { speed: 2.35, deg: 266, gust: 2.22 },
  clouds: { all: 100 },
  dt: 1769559856,
  sys: { sunrise: 1769580397, sunset: 1769623859 },
  timezone: 0,
  id: 0,
  name: "",
  cod: 200
}

*/

// use weather description and main "type"
// as base for color map
/*
{
    weather: {
        main: "Clouds",
        description: "overcast clouds",
    }
}

const weather_colors = {
    clouds: {
        description: {
            ["overcast clouds"]: { h: some_grey, l: "some_lightness" }
        }
    }
}
*/

// use date hour for lightness i.e: HSL(hue, saturation, lightness)
// const lightness = new Date().getHours();
// determine based on sunrise and sunset times if hours is close to response epoch time hour of those new Date(1769580397).getHours();
// const merged_colors = { ...weather_colors[weather?.main].description[weather?.description], l: lightness };

// send UDP call to yeelights lamps with return value of HSLToRGB(merged_colors)
