import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MdLocalGasStation, MdTimeline, MdDelete } from 'react-icons/md';

const FUEL_TYPES = ['Pertalite', 'Pertamax', 'Pertamax Turbo', 'Solar', 'Dexlite'];

export default function FuelConsumption() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        vehicle_type: '',
        fuel_type: 'Pertalite',
        initial_km: '',
        final_km: '',
        price_per_liter: '',
        liters: ''
    });

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await api.getFuelLogs();
            setLogs(data || []);
        } catch (error) {
            console.error('Failed to fetch fuel logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Number(formData.final_km) <= Number(formData.initial_km)) {
            alert('KM Akhir harus lebih besar dari KM Awal');
            return;
        }

        try {
            setSubmitting(true);
            await api.createFuelLog({
                vehicle_type: formData.vehicle_type,
                fuel_type: formData.fuel_type,
                initial_km: Number(formData.initial_km),
                final_km: Number(formData.final_km),
                price_per_liter: Number(formData.price_per_liter),
                liters: Number(formData.liters)
            });

            // Reset form
            setFormData({
                vehicle_type: '',
                fuel_type: 'Pertalite',
                initial_km: '',
                final_km: '',
                price_per_liter: '',
                liters: ''
            });

            fetchLogs();
        } catch (error) {
            console.error('Failed to save fuel log', error);
            alert('Gagal menyimpan data');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus data ini?')) return;
        try {
            await api.deleteFuelLog(id);
            fetchLogs();
        } catch (error) {
            console.error('Failed to delete fuel log', error);
        }
    };

    // Calculations for preview
    const distance = formData.final_km && formData.initial_km
        ? Math.max(0, Number(formData.final_km) - Number(formData.initial_km))
        : 0;

    const totalCost = formData.price_per_liter && formData.liters
        ? Number(formData.price_per_liter) * Number(formData.liters)
        : 0;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
            <header style={{ marginBottom: '1.5rem' }}>
                <h2 className="text-xl">Konsumsi Bahan Bakar</h2>
                <p className="text-secondary text-sm">Catat dan pantau pengeluaran BBM kendaraan Anda</p>
            </header>

            <div className="grid-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Form Section */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <MdLocalGasStation style={{ color: 'var(--primary-color)', fontSize: '1.25rem' }} />
                        <h4 style={{ fontWeight: 600 }}>Input Data Baru</h4>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label className="form-label">Jenis Kendaraan</label>
                            <input
                                type="text"
                                name="vehicle_type"
                                value={formData.vehicle_type}
                                onChange={handleChange}
                                placeholder="Contoh: Honda Vario, Toyota Avanza"
                                className="form-input"
                                required
                            />
                        </div>

                        <div>
                            <label className="form-label">Jenis Bahan Bakar</label>
                            <select
                                name="fuel_type"
                                value={formData.fuel_type}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                {FUEL_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="form-label">KM Awal</label>
                                <input
                                    type="number"
                                    name="initial_km"
                                    value={formData.initial_km}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="form-label">KM Akhir</label>
                                <input
                                    type="number"
                                    name="final_km"
                                    value={formData.final_km}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        {distance > 0 && (
                            <div style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                color: 'var(--primary-color)',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <MdTimeline />
                                <span>Jarak Tempuh: <strong>{distance} km</strong></span>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="form-label">Harga / Liter</label>
                                <input
                                    type="number"
                                    name="price_per_liter"
                                    value={formData.price_per_liter}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="form-label">Jumlah Liter</label>
                                <input
                                    type="number"
                                    name="liters"
                                    value={formData.liters}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--bg-secondary)',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginTop: '0.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span className="text-secondary text-sm">Total Biaya</span>
                                <span style={{ fontWeight: 600 }}>{formatCurrency(totalCost)}</span>
                            </div>
                            {distance > 0 && formData.liters > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="text-secondary text-sm">Konsumsi BBM</span>
                                    <span style={{ fontWeight: 600, color: 'var(--success-color)' }}>
                                        {(distance / Number(formData.liters)).toFixed(1)} km/liter
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                            style={{ marginTop: '1rem' }}
                        >
                            {submitting ? 'Menyimpan...' : 'Simpan Data'}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <MdTimeline style={{ color: 'var(--secondary-color)', fontSize: '1.25rem' }} />
                        <h4 style={{ fontWeight: 600 }}>Riwayat Pengisian</h4>
                    </div>

                    {loading ? (
                        <p className="text-secondary text-center">Memuat data...</p>
                    ) : logs.length === 0 ? (
                        <p className="text-secondary text-center" style={{ padding: '2rem 0' }}>Belum ada data tercatat</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {logs.map(log => (
                                <div key={log.id} style={{
                                    padding: '1rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    position: 'relative'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <div>
                                            <h5 style={{ fontWeight: 600 }}>{log.vehicle_type}</h5>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                background: 'var(--bg-secondary)',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {log.fuel_type}
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--error-color)' }}>
                                                {formatCurrency(log.total_cost)}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {new Date(log.date).toLocaleDateString('id-ID')}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '0.5rem',
                                        fontSize: '0.85rem',
                                        color: 'var(--text-secondary)',
                                        marginTop: '0.5rem',
                                        paddingTop: '0.5rem',
                                        borderTop: '1px dashed var(--border-color)'
                                    }}>
                                        <div>
                                            <span>Jarak: </span>
                                            <strong style={{ color: 'var(--text-primary)' }}>{log.distance} km</strong>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span>Konsumsi: </span>
                                            <strong style={{ color: 'var(--text-primary)' }}>{(log.distance / log.liters).toFixed(1)} km/l</strong>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(log.id)}
                                        style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '-2rem', // Adjust as needed or use hover overlay
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--error-color)',
                                            cursor: 'pointer',
                                            opacity: 0.5
                                        }}
                                        title="Hapus"
                                        onMouseEnter={(e) => e.target.style.opacity = 1}
                                        onMouseLeave={(e) => e.target.style.opacity = 0.5}
                                    >
                                        <MdDelete />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
