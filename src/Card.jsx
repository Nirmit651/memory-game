export default function Card({ name, img, onClick }) {
  return (
    <button className="card" onClick={onClick} aria-label={name}>
      <img className="card-img" src={img} alt={name} />
      <span className="card-name">{name}</span>
    </button>
  );
}
