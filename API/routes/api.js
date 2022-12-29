const express = require("express");
const router = express.Router();

var requestCounts = {};

const AggregationMiddleware = {

  // Function to return the aggregated statistics for the given time ranges
  getAggregatedStatistics(userId) {
    const now = Date.now();
    return {
      last_60_seconds: this.getRequestCountForRange(userId, now - 60 * 1000, now),
      last_5_minutes: this.getRequestCountForRange(userId, now - 5 * 60 * 1000, now),
      last_1_hour: this.getRequestCountForRange(userId, now - 60 * 60 * 1000, now),
      last_6_hours: this.getRequestCountForRange(userId, now - 6 * 60 * 60 * 1000, now),
      last_12_hours: this.getRequestCountForRange(userId, now - 12 * 60 * 60 * 1000, now),
      last_24_hours: this.getRequestCountForRange(userId, now - 24 * 60 * 60 * 1000, now),
    };
  },


  // Function to return the number of requests for the given time range
  getRequestCountForRange(userId, startTimestamp, endTimestamp) {
    return Object.values(requestCounts[userId] || {})
      .filter((timestamp) => timestamp >= startTimestamp && timestamp <= endTimestamp)
      .length;
  },


  // Middleware function to handle the request and generate the response
  async handleRequest(req, res, next) {
    // Extract the user ID and request ID from the request headers
    const userId = req.body["X-USER-ID"];
    const requestId = req.body["X-REQUEST-ID"];

    if (!requestCounts[userId]) {
      requestCounts[userId] = {};
    }
    requestCounts[userId][requestId] = Date.now();


    // Generate the response with the aggregated statistics for the user
    const response = {
      success: true,
      data: {
        user_id: userId,
        message: "Successfully called API",
      },
      metadata: this.getAggregatedStatistics(userId),
    };
    res.json(response);
  },
};


router.use((req, res, next) => AggregationMiddleware.handleRequest(req, res, next));

router.get("/", (req, res, next) => {
  res.status(200).json({
            request: {
                type: 'GET',
                url: 'http://localhost:3000/api'
            }
        });
});

module.exports = router;
