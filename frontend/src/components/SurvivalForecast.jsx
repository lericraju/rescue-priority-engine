import React, { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './SurvivalForecast.css';

const SurvivalForecast = ({ workerId, site }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        if (!workerId) return;
        const fetchForecast = async () => {
            try {
                const res = await fetch(`https://rescue-priority-engine.onrender.com/api/simulation/forecast/${workerId}?site=${site}`);
                const forecastData = await res.json();
                if (Array.isArray(forecastData)) {
                    setData(forecastData);
                } else {
                    setData([]); // Fallback for errors or invalid site
                }
            } catch (err) {
                console.error("Forecast fetch failed:", err);
            }
        };
        fetchForecast();
        const interval = setInterval(fetchForecast, 5000);
        return () => clearInterval(interval);
    }, [workerId, site]);

    if (!workerId) return <div className="forecast-placeholder">Select a worker to view survival forecast</div>;

    return (
        <div className="survival-forecast-panel">
            <h3 className="panel-title">60-Min Survival Projection: {workerId}</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="minute" stroke="#888" label={{ value: 'Minutes', position: 'insideBottom', offset: -5 }} />
                        <YAxis domain={[0, 1]} stroke="#888" label={{ value: 'Prob', angle: -90, position: 'insideLeft' }} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                            itemStyle={{ color: '#3b82f6' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="probability" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorProb)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SurvivalForecast;
