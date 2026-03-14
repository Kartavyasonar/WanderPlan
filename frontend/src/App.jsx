import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import TripPage from './pages/TripPage'
import HistoryPage from './pages/HistoryPage'
import NotFound from './pages/NotFound'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/trip/:id" element={<TripPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App