export default function Brand({ size = 'md', onClick }) {
  const sz = typeof size === 'number' ? size : size === 'lg' ? 40 : 28;
  const fs = typeof size === 'number' ? Math.round(size * 0.56) : size === 'lg' ? 24 : 18;
  return (
    <div className="tm-brand"
      style={{ fontSize: fs, ...(onClick ? { cursor: 'pointer' } : {}) }}
      onClick={onClick}>
      <div className="tm-brand-mark" style={{ width: sz, height: sz }}>
        <span /><span /><span /><span />
      </div>
      <span>TaskMatrix</span>
    </div>
  );
}
