import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import Wallet from './pages/Wallet'
import FuelConsumption from './pages/FuelConsumption'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budget" element={<Budget />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="fuel" element={<FuelConsumption />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
