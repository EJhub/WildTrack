import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";

const AccessionUsageFrequency = ({ timeframe, gradeLevel }) => {
  const [accessionFrequencyData, setAccessionFrequencyData] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const weeklyLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const monthlyLabels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const fetchUsersAndLibraryHours = async () => {
      try {
        // Fetch all users
        const usersResponse = await fetch("http://localhost:8080/api/users/all");
        const usersData = await usersResponse.json();

        // Filter users based on gradeLevel
        const filteredUsers =
          gradeLevel === "All Grades"
            ? usersData
            : usersData.filter((user) => user.grade === gradeLevel || `Grade ${user.grade}` === gradeLevel);

        setUsers(filteredUsers);

        // Fetch all library hours
        const hoursResponse = await fetch("http://localhost:8080/api/library-hours/all");
        const hoursData = await hoursResponse.json();

        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)

        const filteredLibraryHours = hoursData.filter((record) => {
          const recordDate = new Date(record.timeIn);

          // Exclude records with null or invalid dates
          if (isNaN(recordDate) || !record.bookTitle) return false;

          // Filter weekly: restrict to current week
          const isWithinWeek =
            timeframe === "weekly" && recordDate >= startOfWeek && recordDate <= today;

          // Filter monthly: restrict to current year
          const isWithinYear =
            timeframe === "monthly" && recordDate.getFullYear() === today.getFullYear();

          // Combine user filtering with timeframe filtering
          return (
            filteredUsers.some((user) => user.idNumber === record.idNumber) &&
            (isWithinWeek || isWithinYear)
          );
        });

        setAccessionFrequencyData(filteredLibraryHours);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data.");
      }
    };

    fetchUsersAndLibraryHours();
  }, [gradeLevel, timeframe]);

  // Chart labels based on timeframe
  const labels = timeframe === "weekly" ? weeklyLabels : monthlyLabels;

  // Process filtered library hours to group by book titles and days/months
  const bookUsageByDay = {};

  accessionFrequencyData.forEach((record) => {
    const dayOrMonth =
      timeframe === "weekly"
        ? new Date(record.timeIn).toLocaleString("en-US", { weekday: "long" })
        : new Date(record.timeIn).toLocaleString("en-US", { month: "long" });

    if (!bookUsageByDay[record.bookTitle]) {
      bookUsageByDay[record.bookTitle] = Array(labels.length).fill(0);
    }

    const index = labels.indexOf(dayOrMonth);
    if (index !== -1) {
      bookUsageByDay[record.bookTitle][index] += 1;
    }
  });

  // Remove book titles with all zero values
  const filteredBookUsage = Object.entries(bookUsageByDay).filter(([_, data]) =>
    data.some((value) => value > 0)
  );

  // Prepare datasets for the chart
  const datasets = filteredBookUsage.map(([bookTitle, data], index) => ({
    label: bookTitle,
    data,
    backgroundColor: `hsl(${index * 40}, 70%, 60%)`,
    borderColor: `hsl(${index * 40}, 70%, 50%)`,
    borderWidth: 1,
    stack: "books",
  }));

  const chartData = { labels, datasets };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "right" },
      title: {
        display: true,
        text: `Accession Usage Frequency (${timeframe === "weekly" ? "Weekly" : "Monthly"})`,
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  return (
    <Box>
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </Box>
  );
};

export default AccessionUsageFrequency;
