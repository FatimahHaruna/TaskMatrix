export default function Brand({ size = 'md', onClick }) {
  const sz = size === 'lg' ? 40 : 28;
  return (
    <div className="tm-brand"
      style={{ ...(size === 'lg' ? { fontSize: 24 } : {}), ...(onClick ? { cursor: 'pointer' } : {}) }}
      onClick={onClick}>
      <div className="tm-brand-mark" style={{ width: sz, height: sz }}>
        <span /><span /><span /><span />
      </div>
      <span>TaskMatrix</span>
    </div>
  );
}
