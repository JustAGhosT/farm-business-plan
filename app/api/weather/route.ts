import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/weather
 * Get weather data and forecast using Open-Meteo API (free, no API key required)
 *
 * Query parameters:
 * - lat: Latitude (required)
 * - lng: Longitude (required)
 * - forecast_days: Number of days for forecast (default: 7, max: 16)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const forecastDays = searchParams.get('forecast_days') || '7'

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Validate coordinates
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ success: false, error: 'Invalid coordinates' }, { status: 400 })
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { success: false, error: 'Coordinates out of range' },
        { status: 400 }
      )
    }

    // Open-Meteo API - Free, no API key required
    // Documentation: https://open-meteo.com/en/docs
    const openMeteoUrl = new URL('https://api.open-meteo.com/v1/forecast')
    openMeteoUrl.searchParams.append('latitude', latitude.toString())
    openMeteoUrl.searchParams.append('longitude', longitude.toString())
    openMeteoUrl.searchParams.append(
      'current',
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m'
    )
    openMeteoUrl.searchParams.append(
      'hourly',
      'temperature_2m,precipitation_probability,precipitation,weather_code,soil_temperature_0cm,soil_moisture_0_to_1cm'
    )
    openMeteoUrl.searchParams.append(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max'
    )
    openMeteoUrl.searchParams.append('timezone', 'auto')
    openMeteoUrl.searchParams.append('forecast_days', forecastDays)

    const response = await fetch(openMeteoUrl.toString())

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.statusText}`)
    }

    const weatherData = await response.json()

    // Process and structure the data for easier consumption
    const processed = {
      location: {
        latitude: weatherData.latitude,
        longitude: weatherData.longitude,
        elevation: weatherData.elevation,
        timezone: weatherData.timezone,
      },
      current: {
        time: weatherData.current?.time,
        temperature: weatherData.current?.temperature_2m,
        apparentTemperature: weatherData.current?.apparent_temperature,
        humidity: weatherData.current?.relative_humidity_2m,
        precipitation: weatherData.current?.precipitation,
        rain: weatherData.current?.rain,
        weatherCode: weatherData.current?.weather_code,
        windSpeed: weatherData.current?.wind_speed_10m,
        windDirection: weatherData.current?.wind_direction_10m,
        weatherDescription: getWeatherDescription(weatherData.current?.weather_code),
      },
      daily:
        weatherData.daily?.time?.map((date: string, index: number) => ({
          date,
          weatherCode: weatherData.daily.weather_code[index],
          weatherDescription: getWeatherDescription(weatherData.daily.weather_code[index]),
          temperatureMax: weatherData.daily.temperature_2m_max[index],
          temperatureMin: weatherData.daily.temperature_2m_min[index],
          apparentTemperatureMax: weatherData.daily.apparent_temperature_max[index],
          apparentTemperatureMin: weatherData.daily.apparent_temperature_min[index],
          sunrise: weatherData.daily.sunrise[index],
          sunset: weatherData.daily.sunset[index],
          precipitationSum: weatherData.daily.precipitation_sum[index],
          rainSum: weatherData.daily.rain_sum[index],
          precipitationProbabilityMax: weatherData.daily.precipitation_probability_max[index],
          windSpeedMax: weatherData.daily.wind_speed_10m_max[index],
          windGustsMax: weatherData.daily.wind_gusts_10m_max[index],
        })) || [],
      hourly: {
        time: weatherData.hourly?.time || [],
        temperature: weatherData.hourly?.temperature_2m || [],
        precipitation: weatherData.hourly?.precipitation || [],
        precipitationProbability: weatherData.hourly?.precipitation_probability || [],
        weatherCode: weatherData.hourly?.weather_code || [],
        soilTemperature: weatherData.hourly?.soil_temperature_0cm || [],
        soilMoisture: weatherData.hourly?.soil_moisture_0_to_1cm || [],
      },
      // Generate farming alerts
      alerts: generateFarmingAlerts(weatherData),
    }

    return NextResponse.json({
      success: true,
      data: processed,
      source: 'Open-Meteo',
      cached: false,
    })
  } catch (error) {
    console.error('Error fetching weather data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch weather data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Convert WMO weather codes to human-readable descriptions
 * Based on WMO Code: https://open-meteo.com/en/docs
 */
function getWeatherDescription(code: number | undefined): string {
  if (code === undefined) return 'Unknown'

  const weatherCodes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  }

  return weatherCodes[code] || `Unknown (code: ${code})`
}

/**
 * Generate farming-specific alerts based on weather data
 */
function generateFarmingAlerts(weatherData: any): Array<{
  type: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  details?: string
}> {
  const alerts: Array<{
    type: string
    severity: 'info' | 'warning' | 'critical'
    message: string
    details?: string
  }> = []

  if (!weatherData.current || !weatherData.daily) return alerts

  const currentTemp = weatherData.current.temperature_2m
  const dailyMinTemps = weatherData.daily.temperature_2m_min || []
  const dailyPrecipitation = weatherData.daily.precipitation_sum || []
  const dailyWindSpeed = weatherData.daily.wind_speed_10m_max || []

  // Frost warning
  const frostRiskDays = dailyMinTemps.filter((temp: number) => temp < 2).length
  if (frostRiskDays > 0 || currentTemp < 2) {
    alerts.push({
      type: 'frost',
      severity: currentTemp < 0 ? 'critical' : 'warning',
      message:
        currentTemp < 0
          ? 'FROST ALERT: Temperature below freezing'
          : 'Frost risk: Low temperatures expected',
      details:
        frostRiskDays > 0
          ? `Frost risk for next ${frostRiskDays} day(s). Protect sensitive crops.`
          : 'Current temperature near freezing point.',
    })
  }

  // Heavy rain warning
  const heavyRainDays = dailyPrecipitation.filter((precip: number) => precip > 25).length
  if (heavyRainDays > 0) {
    alerts.push({
      type: 'heavy_rain',
      severity: 'warning',
      message: 'Heavy rainfall expected',
      details: `${heavyRainDays} day(s) with heavy rain (>25mm). Check drainage and soil erosion risk.`,
    })
  }

  // Drought warning
  const dryDays = dailyPrecipitation.filter((precip: number) => precip < 1).length
  if (dryDays >= 5) {
    alerts.push({
      type: 'drought',
      severity: dryDays >= 7 ? 'warning' : 'info',
      message: 'Extended dry period',
      details: `${dryDays} consecutive days with minimal rainfall. Consider irrigation.`,
    })
  }

  // Wind warning
  const highWindDays = dailyWindSpeed.filter((wind: number) => wind > 40).length
  if (highWindDays > 0) {
    alerts.push({
      type: 'wind',
      severity: 'warning',
      message: 'High winds expected',
      details: `${highWindDays} day(s) with strong winds (>40 km/h). Secure equipment and check irrigation systems.`,
    })
  }

  // Optimal planting conditions
  const optimalDays = dailyMinTemps.filter(
    (temp: number, idx: number) =>
      temp > 10 && temp < 30 && dailyPrecipitation[idx] < 10 && dailyPrecipitation[idx] > 0
  ).length
  if (optimalDays >= 2) {
    alerts.push({
      type: 'optimal_conditions',
      severity: 'info',
      message: 'Good planting conditions',
      details: `${optimalDays} day(s) with favorable weather for planting activities.`,
    })
  }

  // Heat warning
  const hotDays = weatherData.daily.temperature_2m_max.filter((temp: number) => temp > 35).length
  if (hotDays > 0) {
    alerts.push({
      type: 'heat',
      severity: hotDays > 3 ? 'warning' : 'info',
      message: 'High temperatures expected',
      details: `${hotDays} day(s) with temperatures above 35°C. Increase irrigation and monitor crop stress.`,
    })
  }

  return alerts
}
