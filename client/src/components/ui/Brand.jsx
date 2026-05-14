export default function Brand({ size = 'md' }) {
  const sz = size === 'lg' ? 40 : 28;
  return (
    <div className="tm-brand" style={size === 'lg' ? { fontSize: 24 } : {}}>
      <div className="tm-brand-mark" style={{ width: sz, height: sz }}>
        <span /><span /><span /><span />
      </div>
      <span>TaskMatrix</span>
    </div>
  );
}
