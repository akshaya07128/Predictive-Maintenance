import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Thermometer, 
  Zap, 
  Gauge, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Settings,
  History,
  TrendingUp
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

interface PredictionResult {
  status: string;
  action: string;
}

interface SensorData {
  time: string;
  temp: number;
  vib: number;
  pres: number;
}

export default function App() {
  const [temperature, setTemperature] = useState(45);
  const [vibration, setVibration] = useState(5);
  const [pressure, setPressure] = useState(80);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<SensorData[]>([]);
  
  // Simulate real-time data flow
  useEffect(() => {
    const interval = setInterval(() => {
      const newData: SensorData = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temp: temperature + (Math.random() * 4 - 2),
        vib: vibration + (Math.random() * 2 - 1),
        pres: pressure + (Math.random() * 6 - 3),
      };
      setHistory(prev => [...prev.slice(-19), newData]);
    }, 2000);
    return () => clearInterval(interval);
  }, [temperature, vibration, pressure]);

  const handlePredict = async () => {
    setIsPredicting(true);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temperature, vibration, pressure }),
      });
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Predictive Maintenance AI</h1>
          </div>
          <p className="text-gray-400 text-sm">Industrial Asset Monitoring & Failure Prediction System</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">
            System Online
          </Badge>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls & Real-time Stats */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-[#141414] border-gray-800 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Sensor Controls
              </CardTitle>
              <CardDescription className="text-gray-500">Adjust parameters to simulate conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-gray-300">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    Temperature (°C)
                  </Label>
                  <span className="font-mono text-orange-500 font-bold">{temperature.toFixed(1)}</span>
                </div>
                <Slider 
                  value={[temperature]} 
                  onValueChange={(v) => setTemperature(v[0])} 
                  max={120} 
                  step={0.5}
                  className="[&_[role=slider]]:bg-orange-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-gray-300">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Vibration (mm/s)
                  </Label>
                  <span className="font-mono text-yellow-500 font-bold">{vibration.toFixed(1)}</span>
                </div>
                <Slider 
                  value={[vibration]} 
                  onValueChange={(v) => setVibration(v[0])} 
                  max={30} 
                  step={0.1}
                  className="[&_[role=slider]]:bg-yellow-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-gray-300">
                    <Gauge className="w-4 h-4 text-blue-500" />
                    Pressure (PSI)
                  </Label>
                  <span className="font-mono text-blue-500 font-bold">{pressure.toFixed(1)}</span>
                </div>
                <Slider 
                  value={[pressure]} 
                  onValueChange={(v) => setPressure(v[0])} 
                  max={200} 
                  step={1}
                  className="[&_[role=slider]]:bg-blue-500"
                />
              </div>

              <Button 
                onClick={handlePredict} 
                disabled={isPredicting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isPredicting ? (
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Activity className="w-5 h-5 mr-2" />
                )}
                {isPredicting ? "Analyzing Patterns..." : "Run AI Prediction"}
              </Button>
            </CardContent>
          </Card>

          {/* Health Indicators */}
          <Card className="bg-[#141414] border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Asset Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-bold text-white">94</span>
                <span className="text-gray-500 mb-1">/ 100</span>
              </div>
              <Progress value={94} className="h-2 bg-gray-800" />
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                Based on current telemetry, the asset is operating within nominal parameters.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Visualization & Results */}
        <div className="lg:col-span-8 space-y-6">
          {/* Prediction Result Area */}
          <AnimatePresence mode="wait">
            {prediction ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 20 }}
              >
                <Card className={`border-2 ${prediction.status === "Failure likely" ? "border-red-500/50 bg-red-500/5" : "border-green-500/50 bg-green-500/5"}`}>
                  <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className={`p-4 rounded-full ${prediction.status === "Failure likely" ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"}`}>
                      {prediction.status === "Failure likely" ? <AlertTriangle className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl font-bold mb-1">{prediction.status}</h3>
                      <p className="text-gray-400 text-sm mb-3">AI Analysis Result</p>
                      <div className="inline-flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-gray-800">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Recommended Action:</span>
                        <span className="text-sm font-medium text-white">{prediction.action}</span>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setPrediction(null)} className="border-gray-800 hover:bg-gray-800">
                      Dismiss
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="bg-[#141414] border-gray-800 border-dashed">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                    <History className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-gray-300 font-medium">No Active Prediction</h3>
                  <p className="text-gray-500 text-sm max-w-xs mt-2">
                    Adjust the sensors and click "Run AI Prediction" to analyze current machine state.
                  </p>
                </CardContent>
              </Card>
            )}
          </AnimatePresence>

          {/* Charts Area */}
          <Card className="bg-[#141414] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Telemetry Stream</CardTitle>
                <CardDescription className="text-gray-500">Real-time sensor history (last 20 samples)</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-[10px] uppercase text-gray-500 font-bold">Temp</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] uppercase text-gray-500 font-bold">Pres</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPres" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#525252" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      interval={4}
                    />
                    <YAxis 
                      stroke="#525252" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorTemp)" 
                      animationDuration={500}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pres" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPres)" 
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Vibration Monitor */}
          <Card className="bg-[#141414] border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Vibration Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 30]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px' }}
                    />
                    <Line 
                      type="stepAfter" 
                      dataKey="vib" 
                      stroke="#eab308" 
                      strokeWidth={2} 
                      dot={false}
                      animationDuration={300}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs">
        <div className="flex items-center gap-4">
          <span>&copy; 2026 Predictive Maintenance AI</span>
          <span className="w-1 h-1 bg-gray-700 rounded-full" />
          <span>Hackathon Demo Edition</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">API Reference</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
