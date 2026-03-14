import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import TripPage from './pages/TripPage'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/trip/:id" element={<TripPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App