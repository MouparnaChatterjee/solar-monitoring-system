import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);
{/* Api decleration */}
const API_ENDPOINT = "https://0bqc1htfz6.execute-api.us-east-1.amazonaws.com/data";

 
function useSolarAPI(url, refreshMs = 5000) {
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState("loading");

  const load = async () => {
    try {
      const response = await axios.get(url);
      console.log(“Url response”, response);
      setRecords(response.data || []);
      setStatus("success");
    } catch (e) {
      console.log(e);
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, refreshMs);
    return () => clearInterval(timer);
  }, [url]);

  return { records, status };
}


function buildChartConfig(data, keys, colors) {
  return {
    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: keys.map((key, i) => ({
      label: key.toUpperCase(),
      data: data.map(d => d[key]),
      borderWidth: 2,
      borderColor: colors[i],
      backgroundColor: colors[i] + "33"
    }))
  };
}


export default function SolarDashboard() {
  const { records, status } = useSolarAPI(API_ENDPOINT);

  
  const latest = useMemo(() => records.slice(-20), [records]);

  {/* Voltage, current, power display*/}
  const electricalChart = useMemo(() =>
    buildChartConfig(latest, ["voltage", "current", "power"], ["green", "orange", "purple"]),
  [latest]);
{/* Temperature and humidity display */}
  const environmentChart = useMemo(() =>
    buildChartConfig(latest, ["temperature", "humidity"], ["red", "blue"]),
  [latest]);

  if (status === "loading") return <p>Loading sensor feed...</p>;
  if (status === "error") return <p>Unable to retrieve data</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>⚡ Solar Monitoring Panel</h1>

      {/* Charts */}
<Col>
	<Row>

      <section>
        <h3>Electrical Parameters(Live)</h3>
        <Line data={electricalChart} />
      </section>
	</Row>
<Row>
      <section style={{ marginTop: "30px" }}>
        <h3>Environmental Parameters(Live)</h3>
        <Line data={environmentChart} />
      </section>
</Row>
</Col>
      
      <section style={{ marginTop: "30px" }}>
        <h3>Recent Readings</h3>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Time</th>
              <th>Temp</th>
              <th>Humidity</th>
              <th>Voltage</th>
              <th>Power</th>
            </tr>
          </thead>
          <tbody>
            {latest.map((row, idx) => (
              <tr key={idx}>
                <td>{row.timestamp}</td>
                <td>{row.temperature}</td>
                <td>{row.humidity}</td>
                <td>{row.voltage}</td>
                <td>{row.power}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
