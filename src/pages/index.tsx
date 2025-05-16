// src/pages/index.tsx
import Link from 'next/link'
import React, { createContext, useState, useContext, useEffect, FormEvent, ChangeEvent } from 'react'
import Image from 'next/image'
import { Geist, Geist_Mono } from 'next/font/google'
import styles from './index.module.css'   // CSS Module local ao componente

// Google Fonts
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

// Theme Context
const ThemeContext = createContext({ dark: false, toggle: () => {} })
function useTheme() {
  return useContext(ThemeContext)
}

// **PÁGINA PRINCIPAL**
export default function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const toggleTheme = () => setDarkMode(prev => !prev)

  return (
    <ThemeContext.Provider value={{ dark: darkMode, toggle: toggleTheme }}>
      <div
        className={[
          geistSans.className,
          geistMono.className,
          darkMode ? styles.dark : '',
          styles.container
        ].join(' ')}
      >
        <Header />
        <main className={styles.main}>
          <RegisterForm />
          <InfoSection />
        </main>
        <Footer />
      </div>
    </ThemeContext.Provider>
  )
}

/////////////////////////////
// Componentes Internos
/////////////////////////////

function Header() {
  const { dark, toggle } = useTheme()
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>SafaTi</h1>
      <button
        onClick={toggle}
        aria-label="Alternar tema claro/escuro"
        className={styles.button}
      >
        {dark ? '☀️ Claro' : '🌙 Escuro'}
      </button>
      <button
        onClick={() => history.back()}
        aria-label="Voltar"
        className={styles.button}
      >
        ← Voltar
      </button>
    </header>
  )
}

function RegisterForm() {
  type FormState = Record<'nome' | 'email' | 'cpf' | 'nascimento' | 'telefone', string>
  const initial: FormState = { nome: '', email: '', cpf: '', nascimento: '', telefone: '' }

  const [form, setForm] = useState<FormState>(initial)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updated = { ...form, [name]: value }
    setForm(updated)
    setProgress(Object.values(updated).filter(v => v).length)
  }

  const validaCPF = (raw: string) => {
    const cpf = raw.replace(/\D/g, '')
    if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false
    const calc = (base: string) => {
      let sum = 0
      for (let i = 0; i < base.length; i++) {
        sum += +base[i] * (base.length + 1 - i)
      }
      const rest = sum % 11
      return rest < 2 ? 0 : 11 - rest
    }
    const d1 = calc(cpf.slice(0, 9))
    const d2 = calc(cpf.slice(0, 9) + d1)
    return d1 === +cpf[9] && d2 === +cpf[10]
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.nome.length < 4) return setError('Nome muito curto')
    if (!validaCPF(form.cpf)) return setError('CPF inválido')
    if (!form.nascimento || new Date(form.nascimento) > new Date()) return setError('Data inválida')
    if (!/^\(?[1-9]{2}\)?\s?(?:9\d{4}|\d{4})-?\d{4}$/.test(form.telefone))
      return setError('Telefone inválido')

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setShowModal(true)
      setForm(initial)
      setProgress(0)
    }, 1000)
  }

  return (
    <>
      <section className={styles.formSection}>
        <h2 className={styles.formTitle}>Cadastro</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {(['nome', 'email', 'cpf', 'nascimento', 'telefone'] as const).map(key => (
            <div className={styles.field} key={key}>
              <label htmlFor={key} className={styles.label}>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </label>
              <input
                type={key === 'email' ? 'email' : key === 'nascimento' ? 'date' : 'text'}
                id={key}
                name={key}
                value={form[key]}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
          ))}
          <progress value={progress} max={5} className={styles.progress} />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={submitting} className={styles.submit}>
            {submitting
              ? <span className={styles.spinner} role="status" aria-label="Enviando..." />
              : 'Enviar'}
          </button>
        </form>
      </section>
      {showModal && <SuccessModal onClose={() => setShowModal(false)} />}
    </>
  )
}

function SuccessModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <button onClick={onClose} aria-label="Fechar" className={styles.modalClose}>
          ×
        </button>
        <h3 className={styles.modalTitle}>Sucesso!</h3>
        <p className={styles.modalText}>Seu cadastro foi realizado com sucesso.</p>
        <button onClick={onClose} className={styles.modalButton}>Continuar</button>
      </div>
    </div>
  )
}

function InfoSection() {
  return (
    <section className={styles.info}>
      <Image
        src="/Sistema-de-Seguranca-Empresarial-1024x576.jpg"
        alt="Segurança"
        width={400}
        height={225}
        className={styles.infoImage}
      />
      <div className={styles.infoText}>
        <h2>Segurança é essencial</h2>
        <p>
          A segurança é essencial para proteger pessoas, informações e bens. Seja no ambiente físico ou digital,
          adotar medidas preventivas reduz riscos e garante tranquilidade. Atitudes simples, como manter senhas seguras,
          trancar portas e estar atento ao entorno, fazem a diferença. Segurança começa com a consciência de cada um.
        </p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <Link href="/docs" passHref>
        <a className={styles.link}>
          <Image src="/file.svg" alt="Docs" width={16} height={16} />
          Docs
        </a>
      </Link>
      <Link href="https://vercel.com" passHref>
        <a className={styles.link}>
          <Image src="/vercel.svg" alt="Vercel" width={16} height={16} />
          Deploy
        </a>
      </Link>
      <Link href="/" passHref>
        <a className={styles.link}>
          <Image src="/globe.svg" alt="Home" width={16} height={16} />
          Home
        </a>
      </Link>
    </footer>
  )
}
