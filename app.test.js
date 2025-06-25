// app.test.js
const request = require("supertest");
const axios = require("axios");

// Mock axios before importing app
jest.mock("axios");
const mockedAxios = axios;

// Import app after mocking
const app = require("./app");

describe("Weather API", () => {
  test("should return health status", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body.status).toBe("OK");
    expect(response.body.timestamp).toBeDefined();
  });

  test("should return weather data for valid city", async () => {
    // Mock API response
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        name: "London",
        sys: { country: "GB" },
        main: { temp: 18, humidity: 65 },
        weather: [{ description: "cloudy" }],
        wind: { speed: 5 },
      },
    });

    const response = await request(app).get("/weather/london").expect(200);

    expect(response.body).toEqual({
      city: "London",
      country: "GB",
      temperature: 18,
      description: "cloudy",
      humidity: 65,
      windSpeed: 5,
      timestamp: expect.any(String),
    });
  });

  test("should handle invalid city error", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("City not found"));

    const response = await request(app).get("/weather/invalidcity").expect(500);

    expect(response.body.error).toBe("Failed to fetch weather data");
    expect(response.body.message).toBe("City not found");
  });

  // Clean up after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
});
