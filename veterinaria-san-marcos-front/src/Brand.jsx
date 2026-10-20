function Brand({ compact = false }) {
  return (
    <a className="site-brand" href="/inicio" aria-label="Veterinaria San Marcos, inicio">
      <span className="site-brand__mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="currentColor">
          <ellipse cx="12" cy="12" rx="4" ry="5" transform="rotate(-25 12 12)" />
          <ellipse cx="22" cy="9" rx="4" ry="5" />
          <ellipse cx="31" cy="15" rx="4" ry="5" transform="rotate(25 31 15)" />
          <ellipse cx="6" cy="22" rx="3" ry="4" transform="rotate(-35 6 22)" />
          <path d="M12 29c0-5 5-11 10-11s11 7 11 12c0 7-7 5-11 3-4 2-10 3-10-4Z" />
        </svg>
      </span>
      <span className="site-brand__text">
        <span className="site-brand__eyebrow">Veterinaria</span>
        <span className="site-brand__name">San Marcos</span>
        {!compact && <span className="site-brand__tagline">Cuidamos a quienes más quieres</span>}
      </span>
    </a>
  )
}

export default Brand
