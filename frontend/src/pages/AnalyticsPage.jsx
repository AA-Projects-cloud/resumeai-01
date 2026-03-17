import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { analyticsApi } from '../services/api'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  LineChart, Line
} from 'recharts'
import { BarChart3, Target, Award, Layers } from 'lucide-react'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1']

function ChartCard({ title, icon: Icon, children }) {
  return (
    <div className="p-5 rounded-2xl border" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
        <Icon size={15} style={{ color: 'hsl(var(--primary))' }} /> {title}
      </h3>
      {children}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-lg text-xs border shadow-lg"
      style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
      <p className="font-medium">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.get().then(r => r.data),
    retry: false,
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="max-w-xl mx-auto p-8 text-center">
      <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
        Analytics not available — make sure your backend is running and API keys are configured.
      </p>
    </div>
  )

  const {
    totalResumes = 0,
    averageStrength = 0,
    completionBySection = {},
    skillsDistribution = [],
    timelineData = [],
    resumeTypes = {},
  } = data || {}

  const completionChartData = Object.entries(completionBySection).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value,
  }))

  const resumeTypesData = Object.entries(resumeTypes).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value,
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Resumes', value: totalResumes, icon: Layers, color: '#3b82f6' },
          { label: 'Avg AI Strength', value: `${averageStrength}%`, icon: Target, color: '#8b5cf6' },
          { label: 'Skills Tracked', value: skillsDistribution.length, icon: Award, color: '#10b981' },
          { label: 'Sections Filled', value: `${Object.values(completionBySection).filter(v => v > 0).length}/6`, icon: BarChart3, color: '#f59e0b' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl border flex items-center gap-4"
            style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: color + '22' }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>{value}</p>
              <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Section completion */}
        <ChartCard title="Section Completion %" icon={Target}>
          {completionChartData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={completionChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 18%)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Completion %" radius={[4, 4, 0, 0]}>
                  {completionChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-center py-8" style={{ color: 'hsl(var(--muted-foreground))' }}>No data yet</p>}
        </ChartCard>

        {/* Skills distribution */}
        <ChartCard title="Top Skills Distribution" icon={Award}>
          {skillsDistribution.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={skillsDistribution} layout="vertical" margin={{ top: 4, right: 8, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 18%)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Resumes" radius={[0, 4, 4, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-center py-8" style={{ color: 'hsl(var(--muted-foreground))' }}>Add skills in Resume Builder</p>}
        </ChartCard>

        {/* Resume timeline */}
        <ChartCard title="Resume Creation Timeline" icon={BarChart3}>
          {timelineData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timelineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 18%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" name="Resumes" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-center py-8" style={{ color: 'hsl(var(--muted-foreground))' }}>No data yet</p>}
        </ChartCard>

        {/* Resume types pie */}
        <ChartCard title="Resume Types Breakdown" icon={Layers}>
          {resumeTypesData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={resumeTypesData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {resumeTypesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'hsl(215 20% 55%)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-center py-8" style={{ color: 'hsl(var(--muted-foreground))' }}>Create resumes to see breakdown</p>}
        </ChartCard>
      </div>
    </div>
  )
}
