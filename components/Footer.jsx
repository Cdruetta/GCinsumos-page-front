'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Footer() {
  const router = useRouter()

  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: 'Facebook',
      icon: 'pi pi-facebook',
      url: 'https://facebook.com',
      color: '#1877F2'
    },
    {
      name: 'Instagram',
      icon: 'pi pi-instagram',
      url: 'https://instagram.com',
      color: '#E4405F'
    },
    {
      name: 'Twitter',
      icon: 'pi pi-twitter',
      url: 'https://twitter.com',
      color: '#1DA1F2'
    },
    {
      name: 'LinkedIn',
      icon: 'pi pi-linkedin',
      url: 'https://linkedin.com',
      color: '#0077B5'
    },
    {
      name: 'WhatsApp',
      icon: 'pi pi-whatsapp',
      url: 'https://wa.me/',
      color: '#25D366'
    }
  ]

  const quickLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Catálogo', path: '/catalog' },
    { label: 'Carrito', path: '/cart' }
  ]

  return (
    <footer className="footer-container" style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      color: '#fff',
      marginTop: '4rem',
      paddingTop: '3rem',
      paddingBottom: '1.5rem',
      borderTop: '1px solid rgba(255, 122, 0, 0.2)'
    }}>
      <div className="container">
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Logo y Descripción */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 122, 0, 0.3)'
              }}>
                <Image
                  src="/gclogo.png"
                  alt="GCinsumos"
                  width={32}
                  height={32}
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0
                }}>
                  GCinsumos
                </h3>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  Tech & periféricos
                </p>
              </div>
            </div>
            <p style={{
              color: '#cbd5e1',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem'
            }}>
              Tu tienda de confianza para componentes, periféricos y equipos tecnológicos. 
              Asesoramiento profesional y stock en tiempo real.
            </p>
            {/* Redes Sociales */}
            <div className="social-links" style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 122, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = social.color
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)'
                    e.currentTarget.style.boxShadow = `0 6px 20px ${social.color}40`
                    e.currentTarget.style.borderColor = social.color
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = 'rgba(255, 122, 0, 0.2)'
                  }}
                  aria-label={social.name}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              color: '#fff'
            }}>
              Enlaces Rápidos
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => router.push(link.path)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#cbd5e1',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      padding: '0.5rem 0',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ff7a00'
                      e.currentTarget.style.transform = 'translateX(5px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#cbd5e1'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    <i className="pi pi-chevron-right" style={{ fontSize: '0.75rem' }}></i>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Información de Contacto */}
          <div>
            <h4 style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              color: '#fff'
            }}>
              Contacto
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div className="contact-item" style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <div className="contact-icon" style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <i className="pi pi-envelope" style={{ fontSize: '1rem', color: '#fff' }}></i>
                </div>
                <div>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    margin: 0,
                    marginBottom: '0.25rem'
                  }}>
                    Email
                  </p>
                  <a
                    href="mailto:contacto@gcinsumos.com"
                    style={{
                      color: '#cbd5e1',
                      fontSize: '0.95rem',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ff7a00'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                  >
                    contacto@gcinsumos.com
                  </a>
                </div>
              </div>

              <div className="contact-item" style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <div className="contact-icon" style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <i className="pi pi-phone" style={{ fontSize: '1rem', color: '#fff' }}></i>
                </div>
                <div>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    margin: 0,
                    marginBottom: '0.25rem'
                  }}>
                    Teléfono
                  </p>
                  <a
                    href="tel:+5491123456789"
                    style={{
                      color: '#cbd5e1',
                      fontSize: '0.95rem',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ff7a00'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                  >
                    +54 9 11 2345-6789
                  </a>
                </div>
              </div>

              <div className="contact-item" style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <div className="contact-icon" style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <i className="pi pi-map-marker" style={{ fontSize: '1rem', color: '#fff' }}></i>
                </div>
                <div>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    margin: 0,
                    marginBottom: '0.25rem'
                  }}>
                    Dirección
                  </p>
                  <p style={{
                    color: '#cbd5e1',
                    fontSize: '0.95rem',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    Buenos Aires, Argentina
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 122, 0, 0.3), transparent)',
          marginBottom: '1.5rem'
        }}></div>

        {/* Copyright */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#94a3b8',
            fontSize: '0.875rem',
            margin: 0
          }}>
            © {currentYear} GCinsumos. Todos los derechos reservados.
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => router.push('/admin')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ff7a00'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              Admin
            </button>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              Hecho con ❤️ para la comunidad tech
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

