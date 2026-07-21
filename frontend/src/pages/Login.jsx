import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

 const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await API.post('/api/login/', form)
      localStorage.setItem('token', res.data.access)
      localStorage.setItem('refresh', res.data.refresh)

      const profileRes = await API.get('/api/profile/')
      const role = profileRes.data.role
      localStorage.setItem('role', role)
      localStorage.setItem('username', profileRes.data.username)
      sessionStorage.setItem('role', role)
      sessionStorage.setItem('username', profileRes.data.username)

      if (role === 'volunteer' || role === 'government') {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      console.error('LOGIN ERROR:', err)
      console.error('Response:', err.response)
      console.error('Message:', err.message)

      if (err.response) {
        setError('خطأ من الخادم: ' + err.response.status + ' - بيانات غير صحيحة')
      } else if (err.request) {
        setError('فشل الاتصال بالخادم - تاكد ان Django شغال')
      } else {
        setError('خطأ: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🚑</div>
        <h1 style={styles.title}>مُسعف</h1>
        <p style={styles.sub}>إسعافات أولية ذكية</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>اسم المستخدم</label>
          <input
            style={styles.input}
            placeholder="أدخل اسم المستخدم"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>كلمة المرور</label>
          <input
            style={styles.input}
            type="password"
            placeholder="أدخل كلمة المرور"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button style={styles.btnRed} onClick={handleSubmit} disabled={loading}>
          {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
        </button>

        <div style={styles.divider}><span>أو</span></div>

        <Link to="/register" style={{ textDecoration: 'none' }}>
          <button style={styles.btnOutline}>إنشاء حساب جديد</button>
        </Link>
      </div>
    </div>
  )
}
const styles = {
  page: {
    minHeight: '100vh',
    background: '#111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Cairo, sans-serif',
    direction: 'rtl',
  },
  card: {
    background: '#242429',
    borderRadius: '40px',
    padding: '60px 28px',
    width: '390px',
    minHeight: '844px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    justifyContent: 'center',
    boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 2px #333',
    overflow: 'hidden',
  },
  logo: {
    width: '72px', height: '72px', background: '#E8192C',
    borderRadius: '20px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '36px', margin: '0 auto',
    boxShadow: '0 8px 24px rgba(232,25,44,0.4)',
  },
  title: { color: '#E8192C', textAlign: 'center', fontSize: '30px', fontWeight: 900, margin: 0 },
  sub: { color: '#9090a8', textAlign: 'center', fontSize: '14px', margin: 0 },
  error: { background: 'rgba(232,25,44,0.1)', border: '1px solid rgba(232,25,44,0.3)', borderRadius: '12px', padding: '10px 14px', color: '#ff6b7a', fontSize: '13px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#9090a8', fontSize: '13px', fontWeight: 600 },
  input: {
    background: '#2e2e35', border: '1.5px solid #3a3a45', borderRadius: '14px',
    padding: '13px 16px', fontFamily: 'Cairo, sans-serif', fontSize: '15px',
    color: '#f0f0f5', outline: 'none', textAlign: 'right', width: '100%',
  },
  btnRed: {
    background: '#E8192C', color: 'white', border: 'none', borderRadius: '14px',
    padding: '14px', fontFamily: 'Cairo, sans-serif', fontSize: '16px',
    fontWeight: 700, cursor: 'pointer', width: '100%',
    boxShadow: '0 6px 20px rgba(232,25,44,0.35)',
  },
  btnOutline: {
    background: '#2e2e35', color: '#f0f0f5', border: '1.5px solid #3a3a45',
    borderRadius: '14px', padding: '14px', fontFamily: 'Cairo, sans-serif',
    fontSize: '16px', fontWeight: 600, cursor: 'pointer', width: '100%',
  },
  divider: { textAlign: 'center', color: '#9090a8', fontSize: '13px' },
}